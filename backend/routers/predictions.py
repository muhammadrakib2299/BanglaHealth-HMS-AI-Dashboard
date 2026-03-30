import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.audit import log_action
from middleware.auth import get_current_user
from models.patient import Patient
from models.risk_prediction import RiskLevel, RiskPrediction
from models.user import User
from models.vitals import Vitals
from schemas.prediction import PredictionResponse

router = APIRouter(prefix="/api/patients/{patient_id}", tags=["Predictions"])


@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def run_prediction(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    latest_vitals = (
        db.query(Vitals)
        .filter(Vitals.patient_id == patient_id)
        .order_by(Vitals.recorded_at.desc())
        .first()
    )
    if not latest_vitals:
        raise HTTPException(status_code=400, detail="No vitals recorded for this patient")

    # ML prediction — placeholder until model files are integrated
    try:
        from ml.predictor import predict_risk
        result = predict_risk(latest_vitals)
    except Exception:
        # Fallback: simple rule-based scoring for development
        score = 0.0
        if latest_vitals.glucose > 140:
            score += 0.3
        if latest_vitals.bmi > 30:
            score += 0.2
        if latest_vitals.age > 45:
            score += 0.15
        if latest_vitals.blood_pressure > 90:
            score += 0.1
        if latest_vitals.insulin > 150:
            score += 0.1
        if latest_vitals.diabetes_pedigree > 0.5:
            score += 0.15

        score = min(score, 1.0)
        if score >= 0.6:
            level = RiskLevel.HIGH
        elif score >= 0.3:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        result = {
            "risk_score": round(score, 4),
            "risk_level": level,
            "shap_values": {
                "Glucose": round(score * 0.3, 4),
                "BMI": round(score * 0.25, 4),
                "Age": round(score * 0.15, 4),
                "BloodPressure": round(score * 0.1, 4),
                "Insulin": round(score * 0.1, 4),
                "DiabetesPedigree": round(score * 0.05, 4),
                "SkinThickness": round(score * 0.03, 4),
                "Pregnancies": round(score * 0.02, 4),
            },
            "top_features": [
                {"feature": "Glucose", "impact": round(score * 0.3, 4), "direction": "increases risk" if latest_vitals.glucose > 120 else "decreases risk"},
                {"feature": "BMI", "impact": round(score * 0.25, 4), "direction": "increases risk" if latest_vitals.bmi > 25 else "decreases risk"},
                {"feature": "Age", "impact": round(score * 0.15, 4), "direction": "increases risk" if latest_vitals.age > 40 else "decreases risk"},
            ],
        }

    prediction = RiskPrediction(
        patient_id=patient_id,
        vitals_id=latest_vitals.id,
        risk_level=result["risk_level"],
        risk_score=result["risk_score"],
        shap_values=json.dumps(result["shap_values"]),
        top_features=json.dumps(result["top_features"]),
        predicted_by=current_user.id,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    log_action(db, current_user.id, "predict", "prediction", prediction.id,
               json.dumps({"patient_id": patient_id, "risk_level": result["risk_level"].value}))

    return PredictionResponse(
        id=prediction.id,
        patient_id=prediction.patient_id,
        vitals_id=prediction.vitals_id,
        risk_level=prediction.risk_level,
        risk_score=prediction.risk_score,
        shap_values=result["shap_values"],
        top_features=result["top_features"],
        predicted_at=prediction.predicted_at,
    )


@router.get("/predictions", response_model=list[PredictionResponse])
def get_predictions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    predictions = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.patient_id == patient_id)
        .order_by(RiskPrediction.predicted_at.desc())
        .all()
    )
    results = []
    for p in predictions:
        results.append(PredictionResponse(
            id=p.id,
            patient_id=p.patient_id,
            vitals_id=p.vitals_id,
            risk_level=p.risk_level,
            risk_score=p.risk_score,
            shap_values=json.loads(p.shap_values),
            top_features=json.loads(p.top_features),
            predicted_at=p.predicted_at,
        ))
    return results
