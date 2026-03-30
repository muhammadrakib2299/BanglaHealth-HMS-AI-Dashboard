from datetime import datetime

from pydantic import BaseModel

from models.risk_prediction import RiskLevel


class PredictionResponse(BaseModel):
    id: int
    patient_id: int
    vitals_id: int
    risk_level: RiskLevel
    risk_score: float
    shap_values: dict
    top_features: list[dict]
    predicted_at: datetime

    model_config = {"from_attributes": True}
