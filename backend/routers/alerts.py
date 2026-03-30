from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.patient import Patient
from models.risk_prediction import RiskLevel, RiskPrediction
from models.user import User

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/high-risk")
def get_high_risk_alerts(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent high-risk patients for the notification panel."""
    subq = (
        db.query(
            RiskPrediction.patient_id,
            func.max(RiskPrediction.predicted_at).label("latest"),
        )
        .group_by(RiskPrediction.patient_id)
        .subquery()
    )

    results = (
        db.query(RiskPrediction, Patient)
        .join(Patient, Patient.id == RiskPrediction.patient_id)
        .join(
            subq,
            (RiskPrediction.patient_id == subq.c.patient_id)
            & (RiskPrediction.predicted_at == subq.c.latest),
        )
        .filter(RiskPrediction.risk_level == RiskLevel.HIGH)
        .order_by(RiskPrediction.predicted_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "count": len(results),
        "alerts": [
            {
                "patient_id": pred.patient_id,
                "patient_name": patient.full_name,
                "district": patient.district,
                "risk_score": pred.risk_score,
                "predicted_at": pred.predicted_at.isoformat() if pred.predicted_at else None,
            }
            for pred, patient in results
        ],
    }
