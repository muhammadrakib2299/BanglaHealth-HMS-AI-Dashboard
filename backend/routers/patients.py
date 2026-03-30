from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from middleware.audit import log_action
from middleware.auth import get_current_user, require_roles
from models.patient import Patient
from models.risk_prediction import RiskPrediction
from models.user import Role, User
from schemas.patient import (
    PatientCreate,
    PatientListResponse,
    PatientResponse,
    PatientUpdate,
)

router = APIRouter(prefix="/api/patients", tags=["Patients"])


def _enrich_patient(patient: Patient, db: Session) -> PatientResponse:
    latest = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.patient_id == patient.id)
        .order_by(RiskPrediction.predicted_at.desc())
        .first()
    )
    resp = PatientResponse.model_validate(patient)
    if latest:
        resp.latest_risk_level = latest.risk_level.value
        resp.latest_risk_score = latest.risk_score
    return resp


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = Patient(**data.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    log_action(db, current_user.id, "create_patient", "patient", patient.id)
    return _enrich_patient(patient, db)


@router.get("/", response_model=PatientListResponse)
def list_patients(
    search: str | None = Query(None),
    risk_level: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Patient)

    if search:
        query = query.filter(
            (Patient.full_name.ilike(f"%{search}%"))
            | (Patient.district.ilike(f"%{search}%"))
        )

    total = query.count()
    patients = query.order_by(Patient.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return PatientListResponse(
        patients=[_enrich_patient(p, db) for p in patients],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return _enrich_patient(patient, db)


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    log_action(db, current_user.id, "update_patient", "patient", patient.id)
    return _enrich_patient(patient, db)


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    log_action(db, current_user.id, "delete_patient", "patient", patient_id)
