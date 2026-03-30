"""
Diabetes Risk Predictor using XGBoost + SHAP

This module loads the trained XGBoost model from Project 1 and provides
real-time risk predictions with SHAP explanations.

To activate: place risk_model.pkl and scaler.pkl in this directory.
"""

import json
import os

import numpy as np

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

FEATURE_NAMES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigree", "Age",
]

_model = None
_scaler = None
_explainer = None


def _load_model():
    global _model, _scaler, _explainer
    if _model is not None:
        return

    import joblib
    import shap
    import xgboost as xgb

    _model = joblib.load(MODEL_PATH)
    _scaler = joblib.load(SCALER_PATH)
    _explainer = shap.TreeExplainer(_model)


def predict_risk(vitals) -> dict:
    """Run XGBoost prediction with SHAP explanations on a Vitals ORM object."""
    _load_model()

    features = np.array([[
        vitals.pregnancies,
        vitals.glucose,
        vitals.blood_pressure,
        vitals.skin_thickness,
        vitals.insulin,
        vitals.bmi,
        vitals.diabetes_pedigree,
        vitals.age,
    ]])

    features_scaled = _scaler.transform(features)
    probability = float(_model.predict_proba(features_scaled)[0][1])

    # SHAP values
    shap_values = _explainer.shap_values(features_scaled)
    if isinstance(shap_values, list):
        shap_vals = shap_values[1][0]  # class 1 (diabetic)
    else:
        shap_vals = shap_values[0]

    # Determine risk level
    from models.risk_prediction import RiskLevel
    if probability >= 0.6:
        risk_level = RiskLevel.HIGH
    elif probability >= 0.3:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW

    # Build SHAP dict
    shap_dict = {name: round(float(val), 4) for name, val in zip(FEATURE_NAMES, shap_vals)}

    # Top 3 features by absolute SHAP value
    sorted_features = sorted(
        zip(FEATURE_NAMES, shap_vals), key=lambda x: abs(x[1]), reverse=True
    )[:3]
    top_features = [
        {
            "feature": name,
            "impact": round(abs(float(val)), 4),
            "direction": "increases risk" if val > 0 else "decreases risk",
        }
        for name, val in sorted_features
    ]

    return {
        "risk_score": round(probability, 4),
        "risk_level": risk_level,
        "shap_values": shap_dict,
        "top_features": top_features,
    }
