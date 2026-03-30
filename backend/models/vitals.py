from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Vitals(Base):
    __tablename__ = "vitals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    pregnancies: Mapped[int] = mapped_column(Integer, default=0)
    glucose: Mapped[float] = mapped_column(Float)
    blood_pressure: Mapped[float] = mapped_column(Float)
    skin_thickness: Mapped[float] = mapped_column(Float)
    insulin: Mapped[float] = mapped_column(Float)
    bmi: Mapped[float] = mapped_column(Float)
    diabetes_pedigree: Mapped[float] = mapped_column(Float)
    age: Mapped[int] = mapped_column(Integer)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    recorded_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    patient = relationship("Patient", back_populates="vitals")
