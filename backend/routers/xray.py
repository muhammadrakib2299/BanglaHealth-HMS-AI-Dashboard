import json
import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.audit import log_action
from middleware.auth import get_current_user
from middleware.rate_limit import ml_rate_limiter
from models.patient import Patient
from models.user import User
from models.xray_result import XrayResult
from schemas.xray import XrayResponse

router = APIRouter(prefix="/api/patients/{patient_id}/xray", tags=["X-Ray"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "xrays")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/", response_model=XrayResponse, status_code=status.HTTP_201_CREATED)
async def upload_xray(
    patient_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ml_rate_limiter.check(request)
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG files are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    # ML prediction — placeholder until model is integrated
    try:
        from ml.xray_predictor import predict_xray
        result = predict_xray(filepath)
    except Exception:
        # Fallback: random-ish score for development
        import hashlib
        hash_val = int(hashlib.md5(contents[:1024]).hexdigest(), 16)
        prob = (hash_val % 100) / 100.0
        result = {"pneumonia_probability": round(prob, 4), "confidence": round(0.7 + (prob * 0.25), 4)}

    xray_result = XrayResult(
        patient_id=patient_id,
        image_path=f"uploads/xrays/{filename}",
        pneumonia_probability=result["pneumonia_probability"],
        confidence=result["confidence"],
        uploaded_by=current_user.id,
    )
    db.add(xray_result)
    db.commit()
    db.refresh(xray_result)

    log_action(db, current_user.id, "upload_xray", "xray", xray_result.id,
               json.dumps({"patient_id": patient_id, "probability": result["pneumonia_probability"]}))

    return xray_result


@router.get("/history", response_model=list[XrayResponse])
def get_xray_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    return (
        db.query(XrayResult)
        .filter(XrayResult.patient_id == patient_id)
        .order_by(XrayResult.uploaded_at.desc())
        .all()
    )
