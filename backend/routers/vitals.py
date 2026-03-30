from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.patient import Patient
from models.user import User
from models.vitals import Vitals
from schemas.vitals import VitalsCreate, VitalsResponse

router = APIRouter(prefix="/api/patients/{patient_id}/vitals", tags=["Vitals"])


@router.post("/", response_model=VitalsResponse, status_code=status.HTTP_201_CREATED)
def record_vitals(
    patient_id: int,
    data: VitalsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    vitals = Vitals(patient_id=patient_id, recorded_by=current_user.id, **data.model_dump())
    db.add(vitals)
    db.commit()
    db.refresh(vitals)
    return vitals


@router.get("/", response_model=list[VitalsResponse])
def get_vitals_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    vitals = (
        db.query(Vitals)
        .filter(Vitals.patient_id == patient_id)
        .order_by(Vitals.recorded_at.desc())
        .all()
    )
    return vitals
