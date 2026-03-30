import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    vitals_id: Mapped[int] = mapped_column(ForeignKey("vitals.id"))
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel))
    risk_score: Mapped[float] = mapped_column(Float)
    shap_values: Mapped[str] = mapped_column(Text)  # JSON string
    top_features: Mapped[str] = mapped_column(Text)  # JSON string: top 3 SHAP features
    predicted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    predicted_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    patient = relationship("Patient", back_populates="predictions")
