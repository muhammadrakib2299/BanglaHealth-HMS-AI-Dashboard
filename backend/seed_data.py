"""
Seed script: Creates demo users + 50 patients with vitals and predictions.
Run: python seed_data.py
"""

import json
import random
import sys
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from middleware.auth import hash_password
from models.user import Role, User
from models.patient import Gender, Patient
from models.vitals import Vitals
from models.risk_prediction import RiskLevel, RiskPrediction
from models.appointment import Appointment, AppointmentStatus

# Bangladesh districts (sample)
DISTRICTS = [
    "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet",
    "Rangpur", "Barisal", "Mymensingh", "Comilla", "Gazipur",
    "Narayanganj", "Tangail", "Bogura", "Cox's Bazar", "Jessore",
]

MALE_NAMES = [
    "Rahim Uddin", "Karim Hossain", "Jamal Ahmed", "Faruk Khan", "Habib Rahman",
    "Tariq Islam", "Nizam Chowdhury", "Shafiq Mia", "Rafiq Sarker", "Zahid Hasan",
    "Arif Billah", "Masud Rana", "Imran Ali", "Shakil Ahmed", "Nasir Uddin",
    "Babul Mia", "Sumon Das", "Ratul Haque", "Jewel Rana", "Tanvir Alam",
    "Sajib Hossain", "Rubel Ahmed", "Milon Khan", "Sohel Rana", "Kamrul Islam",
]

FEMALE_NAMES = [
    "Fatima Begum", "Ayesha Khatun", "Rashida Akter", "Nasreen Jahan", "Salma Begum",
    "Roksana Parvin", "Shirin Akter", "Taslima Sultana", "Rehana Begum", "Momena Khatun",
    "Josna Akter", "Shapla Begum", "Moyna Khatun", "Rubina Yasmin", "Halima Begum",
    "Kulsum Akter", "Nargis Sultana", "Amena Khatun", "Rahima Begum", "Bilkis Akter",
    "Sumaiya Islam", "Nusrat Jahan", "Tamanna Akter", "Papiya Begum", "Sharmin Sultana",
]


def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding demo users...")
    users = [
        User(email="admin@banglahealth.com", full_name="Admin User",
             hashed_password=hash_password("admin123"), role=Role.ADMIN),
        User(email="doctor@banglahealth.com", full_name="Dr. Kamal Hossain",
             hashed_password=hash_password("doctor123"), role=Role.DOCTOR),
        User(email="doctor2@banglahealth.com", full_name="Dr. Nasreen Ahmed",
             hashed_password=hash_password("doctor123"), role=Role.DOCTOR),
        User(email="nurse@banglahealth.com", full_name="Nurse Fatima",
             hashed_password=hash_password("nurse123"), role=Role.NURSE),
        User(email="reception@banglahealth.com", full_name="Receptionist Rahim",
             hashed_password=hash_password("reception123"), role=Role.RECEPTIONIST),
    ]
    db.add_all(users)
    db.flush()
    doctor_ids = [u.id for u in users if u.role == Role.DOCTOR]

    print("Seeding 50 demo patients...")
    patients = []
    for i in range(50):
        if i < 25:
            name = MALE_NAMES[i % len(MALE_NAMES)]
            gender = Gender.MALE
        else:
            name = FEMALE_NAMES[(i - 25) % len(FEMALE_NAMES)]
            gender = Gender.FEMALE

        age = random.randint(18, 75)
        patient = Patient(
            full_name=name,
            age=age,
            gender=gender,
            district=random.choice(DISTRICTS),
            phone=f"+880{random.randint(1300000000, 1999999999)}",
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 90)),
        )
        patients.append(patient)

    db.add_all(patients)
    db.flush()

    print("Seeding vitals and predictions...")
    for patient in patients:
        # 1-3 vitals entries per patient
        num_vitals = random.randint(1, 3)
        for v in range(num_vitals):
            glucose = round(random.uniform(60, 200), 1)
            bmi = round(random.uniform(18, 42), 1)
            bp = round(random.uniform(60, 110), 1)
            insulin = round(random.uniform(15, 300), 1)

            vitals = Vitals(
                patient_id=patient.id,
                pregnancies=random.randint(0, 8) if patient.gender == Gender.FEMALE else 0,
                glucose=glucose,
                blood_pressure=bp,
                skin_thickness=round(random.uniform(10, 50), 1),
                insulin=insulin,
                bmi=bmi,
                diabetes_pedigree=round(random.uniform(0.08, 2.0), 3),
                age=patient.age,
                recorded_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 60)),
                recorded_by=random.choice(doctor_ids),
            )
            db.add(vitals)
            db.flush()

            # Generate a prediction for each vitals entry
            score = 0.0
            if glucose > 140: score += 0.3
            if bmi > 30: score += 0.2
            if patient.age > 45: score += 0.15
            if bp > 90: score += 0.1
            if insulin > 150: score += 0.1
            if vitals.diabetes_pedigree > 0.5: score += 0.15
            score = min(round(score + random.uniform(-0.05, 0.05), 4), 1.0)
            score = max(score, 0.0)

            if score >= 0.6:
                level = RiskLevel.HIGH
            elif score >= 0.3:
                level = RiskLevel.MEDIUM
            else:
                level = RiskLevel.LOW

            shap_values = {
                "Glucose": round(score * 0.3, 4),
                "BMI": round(score * 0.25, 4),
                "Age": round(score * 0.15, 4),
                "BloodPressure": round(score * 0.1, 4),
                "Insulin": round(score * 0.1, 4),
                "DiabetesPedigree": round(score * 0.05, 4),
                "SkinThickness": round(score * 0.03, 4),
                "Pregnancies": round(score * 0.02, 4),
            }
            top_features = [
                {"feature": "Glucose", "impact": round(score * 0.3, 4),
                 "direction": "increases risk" if glucose > 120 else "decreases risk"},
                {"feature": "BMI", "impact": round(score * 0.25, 4),
                 "direction": "increases risk" if bmi > 25 else "decreases risk"},
                {"feature": "Age", "impact": round(score * 0.15, 4),
                 "direction": "increases risk" if patient.age > 40 else "decreases risk"},
            ]

            prediction = RiskPrediction(
                patient_id=patient.id,
                vitals_id=vitals.id,
                risk_level=level,
                risk_score=score,
                shap_values=json.dumps(shap_values),
                top_features=json.dumps(top_features),
                predicted_at=vitals.recorded_at + timedelta(minutes=5),
                predicted_by=random.choice(doctor_ids),
            )
            db.add(prediction)

        # Random appointment for ~60% of patients
        if random.random() < 0.6:
            appt = Appointment(
                patient_id=patient.id,
                doctor_id=random.choice(doctor_ids),
                appointment_date=(datetime.now(timezone.utc) + timedelta(days=random.randint(-7, 14))).date(),
                appointment_time=datetime.strptime(
                    f"{random.randint(9, 16)}:{random.choice(['00', '30'])}", "%H:%M"
                ).time(),
                status=random.choice(list(AppointmentStatus)),
                notes=random.choice([None, "Follow-up checkup", "Initial consultation", "Lab results review"]),
            )
            db.add(appt)

    db.commit()
    db.close()
    print("Seeding complete! 5 users + 50 patients with vitals, predictions, and appointments.")


if __name__ == "__main__":
    seed()
