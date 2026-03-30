from datetime import datetime

from pydantic import BaseModel


class XrayResponse(BaseModel):
    id: int
    patient_id: int
    image_path: str
    pneumonia_probability: float
    confidence: float
    uploaded_at: datetime

    model_config = {"from_attributes": True}
