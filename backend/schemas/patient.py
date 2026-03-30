from datetime import datetime

from pydantic import BaseModel

from models.patient import Gender


class PatientCreate(BaseModel):
    full_name: str
    age: int
    gender: Gender
    district: str
    phone: str | None = None
    address: str | None = None


class PatientUpdate(BaseModel):
    full_name: str | None = None
    age: int | None = None
    gender: Gender | None = None
    district: str | None = None
    phone: str | None = None
    address: str | None = None


class PatientResponse(BaseModel):
    id: int
    full_name: str
    age: int
    gender: Gender
    district: str
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime
    latest_risk_level: str | None = None
    latest_risk_score: float | None = None

    model_config = {"from_attributes": True}


class PatientListResponse(BaseModel):
    patients: list[PatientResponse]
    total: int
    page: int
    per_page: int
