from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.appointment import Appointment, AppointmentStatus
from models.patient import Patient
from models.risk_prediction import RiskLevel, RiskPrediction
from models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_patients = db.query(func.count(Patient.id)).scalar()

    today = date.today()
    predictions_today = (
        db.query(func.count(RiskPrediction.id))
        .filter(func.date(RiskPrediction.predicted_at) == today)
        .scalar()
    )
    appointments_today = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.appointment_date == today)
        .filter(Appointment.status == AppointmentStatus.SCHEDULED)
        .scalar()
    )

    # High risk count (patients with latest prediction = HIGH)
    from sqlalchemy import distinct
    high_risk_subq = (
        db.query(
            RiskPrediction.patient_id,
            func.max(RiskPrediction.predicted_at).label("latest"),
        )
        .group_by(RiskPrediction.patient_id)
        .subquery()
    )
    high_risk_count = (
        db.query(func.count(RiskPrediction.patient_id))
        .join(
            high_risk_subq,
            (RiskPrediction.patient_id == high_risk_subq.c.patient_id)
            & (RiskPrediction.predicted_at == high_risk_subq.c.latest),
        )
        .filter(RiskPrediction.risk_level == RiskLevel.HIGH)
        .scalar()
    )

    return {
        "total_patients": total_patients or 0,
        "high_risk_count": high_risk_count or 0,
        "predictions_today": predictions_today or 0,
        "appointments_today": appointments_today or 0,
    }


@router.get("/risk-distribution")
def get_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get the latest prediction per patient
    subq = (
        db.query(
            RiskPrediction.patient_id,
            func.max(RiskPrediction.predicted_at).label("latest"),
        )
        .group_by(RiskPrediction.patient_id)
        .subquery()
    )
    results = (
        db.query(RiskPrediction.risk_level, func.count().label("count"))
        .join(
            subq,
            (RiskPrediction.patient_id == subq.c.patient_id)
            & (RiskPrediction.predicted_at == subq.c.latest),
        )
        .group_by(RiskPrediction.risk_level)
        .all()
    )
    return {r.risk_level.value: r.count for r in results}


@router.get("/predictions-over-time")
def get_predictions_over_time(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    results = (
        db.query(
            func.date(RiskPrediction.predicted_at).label("date"),
            func.count().label("count"),
        )
        .filter(RiskPrediction.predicted_at >= start_date)
        .group_by(func.date(RiskPrediction.predicted_at))
        .order_by(func.date(RiskPrediction.predicted_at))
        .all()
    )
    return [{"date": str(r.date), "count": r.count} for r in results]


@router.get("/district-risk")
def get_district_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subq = (
        db.query(
            RiskPrediction.patient_id,
            func.max(RiskPrediction.predicted_at).label("latest"),
        )
        .group_by(RiskPrediction.patient_id)
        .subquery()
    )
    results = (
        db.query(
            Patient.district,
            RiskPrediction.risk_level,
            func.count().label("count"),
        )
        .join(Patient, Patient.id == RiskPrediction.patient_id)
        .join(
            subq,
            (RiskPrediction.patient_id == subq.c.patient_id)
            & (RiskPrediction.predicted_at == subq.c.latest),
        )
        .group_by(Patient.district, RiskPrediction.risk_level)
        .all()
    )

    district_data = {}
    for r in results:
        if r.district not in district_data:
            district_data[r.district] = {"district": r.district, "low": 0, "medium": 0, "high": 0}
        district_data[r.district][r.risk_level.value] = r.count

    return list(district_data.values())
