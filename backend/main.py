import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError

from config import settings
from middleware.error_handler import global_exception_handler, integrity_error_handler
from routers import auth, patients, vitals, predictions, appointments, xray, dashboard
from routers import audit, alerts, doctors, reports

app = FastAPI(
    title="BanglaHealth HMS API",
    description="Hospital Management System with AI-powered risk prediction",
    version="1.0.0",
)

# Exception handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(patients.router)
app.include_router(vitals.router)
app.include_router(predictions.router)
app.include_router(appointments.router)
app.include_router(xray.router)
app.include_router(audit.router)
app.include_router(alerts.router)
app.include_router(doctors.router)
app.include_router(reports.router)

# Serve uploaded files
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/")
def root():
    return {"message": "BanglaHealth HMS API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
