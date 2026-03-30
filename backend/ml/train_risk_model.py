"""
Train XGBoost Diabetes Risk Prediction Model

Trains on the Pima Indians Diabetes dataset (or synthetic equivalent),
saves risk_model.pkl and scaler.pkl for use by predictor.py.

Usage:
    python train_risk_model.py
"""

import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "risk_model.pkl")
SCALER_PATH = os.path.join(SCRIPT_DIR, "scaler.pkl")

FEATURE_NAMES = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigree",
    "Age",
]


def download_pima_dataset() -> pd.DataFrame:
    """Try to download the Pima Indians Diabetes dataset from common sources.
    Falls back to generating realistic synthetic data if unavailable."""

    urls = [
        "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv",
        "https://raw.githubusercontent.com/npradascern/Pima-Indians-Diabetes-Dataset/master/diabetes.csv",
    ]

    # Try downloading from known public URLs
    for url in urls:
        try:
            print(f"Attempting download from: {url}")
            df = pd.read_csv(url, header=None)
            if df.shape[1] == 9:
                df.columns = FEATURE_NAMES + ["Outcome"]
                print(f"  -> Downloaded {len(df)} rows successfully.")
                return df
        except Exception as exc:
            print(f"  -> Failed: {exc}")

    # Try a version that already has headers
    try:
        url = "https://raw.githubusercontent.com/npradascern/Pima-Indians-Diabetes-Dataset/master/diabetes.csv"
        df = pd.read_csv(url)
        if "Outcome" in df.columns and len(df.columns) == 9:
            print(f"  -> Downloaded {len(df)} rows successfully.")
            return df
    except Exception:
        pass

    # Fallback: generate synthetic data that closely matches Pima dataset statistics
    print("Download unavailable. Generating synthetic data matching Pima dataset statistics...")
    return _generate_synthetic_pima(n_samples=768, seed=42)


def _generate_synthetic_pima(n_samples: int = 768, seed: int = 42) -> pd.DataFrame:
    """Generate synthetic data matching the statistical properties of the Pima
    Indians Diabetes dataset. Distributions are modeled from published summary
    statistics of the original dataset."""

    rng = np.random.RandomState(seed)

    # --- Non-diabetic samples (roughly 65%) ---
    n_neg = int(n_samples * 0.651)
    n_pos = n_samples - n_neg

    def _make_group(n, rng, diabetic: bool):
        if diabetic:
            pregnancies = rng.poisson(lam=4.9, size=n).clip(0, 17)
            glucose = rng.normal(141, 31, n).clip(56, 199)
            bp = rng.normal(70, 18, n).clip(24, 122)
            skin = rng.normal(32, 12, n).clip(7, 63)
            insulin = rng.normal(207, 130, n).clip(14, 846)
            bmi = rng.normal(35, 7, n).clip(18, 67)
            dpf = rng.gamma(2.2, 0.22, n).clip(0.085, 2.42)
            age = rng.normal(37, 11, n).clip(21, 81).astype(int)
        else:
            pregnancies = rng.poisson(lam=3.3, size=n).clip(0, 14)
            glucose = rng.normal(110, 26, n).clip(44, 197)
            bp = rng.normal(68, 18, n).clip(24, 122)
            skin = rng.normal(27, 12, n).clip(7, 60)
            insulin = rng.normal(130, 110, n).clip(14, 846)
            bmi = rng.normal(30, 7, n).clip(18, 57)
            dpf = rng.gamma(1.8, 0.20, n).clip(0.078, 2.42)
            age = rng.normal(31, 10, n).clip(21, 81).astype(int)

        return pd.DataFrame(
            {
                "Pregnancies": pregnancies.astype(int),
                "Glucose": glucose.round(0).astype(int),
                "BloodPressure": bp.round(0).astype(int),
                "SkinThickness": skin.round(0).astype(int),
                "Insulin": insulin.round(0).astype(int),
                "BMI": bmi.round(1),
                "DiabetesPedigree": dpf.round(3),
                "Age": age,
                "Outcome": int(diabetic),
            }
        )

    df = pd.concat(
        [_make_group(n_neg, rng, False), _make_group(n_pos, rng, True)],
        ignore_index=True,
    )
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)
    print(f"  -> Generated {len(df)} synthetic samples ({n_pos} diabetic, {n_neg} non-diabetic).")
    return df


def train():
    print("=" * 60)
    print("  XGBoost Diabetes Risk Model Training")
    print("=" * 60)

    # ---- 1. Load data ----
    print("\n[1/4] Loading dataset...")
    df = download_pima_dataset()

    X = df[FEATURE_NAMES].values
    y = df["Outcome"].values
    print(f"  Dataset shape: {X.shape}, Positive rate: {y.mean():.1%}")

    # ---- 2. Split and scale ----
    print("\n[2/4] Splitting and scaling data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    print(f"  Train: {X_train_scaled.shape[0]} samples, Test: {X_test_scaled.shape[0]} samples")

    # ---- 3. Train XGBoost ----
    print("\n[3/4] Training XGBoost classifier...")
    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        gamma=1,
        reg_alpha=0.5,
        reg_lambda=1.0,
        scale_pos_weight=(y_train == 0).sum() / max((y_train == 1).sum(), 1),
        eval_metric="logloss",
        random_state=42,
        use_label_encoder=False,
    )
    model.fit(
        X_train_scaled,
        y_train,
        eval_set=[(X_test_scaled, y_test)],
        verbose=False,
    )

    # ---- 4. Evaluate ----
    print("\n[4/4] Evaluating model...")
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)

    print(f"\n  Accuracy : {acc:.4f}")
    print(f"  ROC AUC  : {auc:.4f}")
    print(f"\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Non-Diabetic", "Diabetic"]))
    print(f"  Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"    {cm}")

    # ---- 5. Save ----
    print(f"\nSaving model  -> {MODEL_PATH}")
    joblib.dump(model, MODEL_PATH)
    print(f"Saving scaler -> {SCALER_PATH}")
    joblib.dump(scaler, SCALER_PATH)

    # Quick sanity check: verify files load correctly
    loaded_model = joblib.load(MODEL_PATH)
    loaded_scaler = joblib.load(SCALER_PATH)
    sample = scaler.transform(X[:1])
    prob = loaded_model.predict_proba(sample)[0][1]
    print(f"\nSanity check - sample prediction probability: {prob:.4f}")

    print("\nDone! Model files are ready for predictor.py")
    print("=" * 60)


if __name__ == "__main__":
    train()
