from datetime import datetime

from pydantic import BaseModel


class VitalsCreate(BaseModel):
    pregnancies: int = 0
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: int


class VitalsResponse(BaseModel):
    id: int
    patient_id: int
    pregnancies: int
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: int
    recorded_at: datetime

    model_config = {"from_attributes": True}
