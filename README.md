# BanglaHealth HMS + AI Dashboard

A Hospital Management System with embedded Machine Learning intelligence for real-time clinical decision support.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)

---

## What is this?

BanglaHealth HMS is a full-stack hospital management system that goes beyond traditional CRUD — it embeds AI-powered risk prediction directly into the clinical workflow. Doctors can register patients, record vitals, and instantly get diabetes risk scores with explainable AI (SHAP), or upload chest X-rays for automated pneumonia detection.

### Key Highlights

- **Real-time diabetes risk prediction** using XGBoost with SHAP explanations
- **Chest X-ray analysis** using ResNet-50 for pneumonia detection
- **Role-based access control** — Admin, Doctor, Nurse, Receptionist
- **Analytics dashboard** with risk distribution, trends, and district-level insights
- **Fully containerized** — one command to run the entire stack

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TailwindCSS, Recharts, TanStack Query |
| Backend | FastAPI, SQLAlchemy, Pydantic, Alembic |
| Database | PostgreSQL 15 |
| ML Models | XGBoost + SHAP, ResNet-50 (PyTorch) |
| Auth | JWT (python-jose) + bcrypt |
| DevOps | Docker, docker-compose |
| Deployment | Render.com |

---

## Architecture

```
┌──────────────────┐     REST API      ┌──────────────────┐
│                  │ ◄───────────────► │                  │
│   Next.js App    │                   │  FastAPI Server   │
│   (Port 3000)    │                   │  (Port 8000)     │
│                  │                   │                  │
│  - Dashboard     │                   │  - Auth (JWT)    │
│  - Patient List  │                   │  - Patient CRUD  │
│  - Risk Panel    │                   │  - ML Inference  │
│  - X-Ray Upload  │                   │  - SHAP Engine   │
│  - Appointments  │                   │  - X-Ray Engine  │
└──────────────────┘                   └────────┬─────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │                       │
                              ┌─────┴─────┐          ┌─────┴─────┐
                              │ PostgreSQL │          │ ML Models │
                              │  (5432)    │          │ XGBoost   │
                              │            │          │ ResNet-50 │
                              └────────────┘          └───────────┘
```

---

## Features

### Patient Management
- Register, update, search, and filter patients
- Track vitals history (glucose, BP, BMI, insulin, etc.)
- Risk-level badges: High (red), Medium (yellow), Low (green)

### AI Risk Prediction
- One-click diabetes risk scoring from patient vitals
- **SHAP explanations** — see which factors drive the prediction
- Prediction history timeline — track risk changes over time

### X-Ray Analysis
- Upload chest X-ray images (JPEG/PNG)
- Automated pneumonia probability scoring via ResNet-50
- Results stored and linked to patient records

### Analytics Dashboard
- Patient count, risk distribution, daily prediction stats
- District-level risk breakdown
- Trend analysis over time
- High-risk patient alerts

### Role-Based Access
| Role | Permissions |
|------|------------|
| Admin | Full access + user management |
| Doctor | Patients + predictions + X-ray |
| Nurse | Vitals entry + view predictions |
| Receptionist | Registration + appointments |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/banglahealth-hms.git
cd banglahealth-hms

# 2. Copy environment variables
cp .env.example .env

# 3. Start all services
docker-compose up --build

# 4. Seed demo data (first time only)
docker-compose exec backend python seed_data.py
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@banglahealth.com | admin123 |
| Doctor | doctor@banglahealth.com | doctor123 |
| Nurse | nurse@banglahealth.com | nurse123 |

---

## Project Structure

```
banglahealth-hms/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── database.py                # SQLAlchemy + PostgreSQL connection
│   ├── models/                    # ORM models
│   │   ├── user.py
│   │   ├── patient.py
│   │   ├── vitals.py
│   │   ├── risk_prediction.py
│   │   ├── appointment.py
│   │   └── audit_log.py
│   ├── routers/                   # API route handlers
│   │   ├── auth.py
│   │   ├── patients.py
│   │   ├── vitals.py
│   │   ├── predictions.py
│   │   ├── appointments.py
│   │   └── xray.py
│   ├── schemas/                   # Pydantic request/response models
│   ├── ml/                        # ML model files + inference
│   │   ├── risk_model.pkl
│   │   ├── scaler.pkl
│   │   ├── predictor.py
│   │   └── xray_predictor.py
│   ├── middleware/                 # Auth, rate limiting, audit
│   ├── alembic/                   # Database migrations
│   ├── seed_data.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   │   ├── dashboard/
│   │   │   ├── patients/
│   │   │   ├── appointments/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── components/            # Reusable UI components
│   │   │   ├── PatientTable.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   ├── SHAPChart.tsx
│   │   │   └── XRayUploader.tsx
│   │   └── lib/                   # API client, auth utils
│   ├── public/
│   ├── tailwind.config.ts
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── .env.example
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List patients (search, filter, paginate) |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/{id}` | Get patient detail |
| PUT | `/api/patients/{id}` | Update patient |
| DELETE | `/api/patients/{id}` | Delete patient (admin) |

### Vitals & Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients/{id}/vitals` | Record vitals |
| GET | `/api/patients/{id}/vitals` | Get vitals history |
| POST | `/api/patients/{id}/predict` | Run risk prediction |
| GET | `/api/patients/{id}/predictions` | Prediction history |

### X-Ray
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients/{id}/xray` | Upload X-ray for analysis |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Schedule appointment |
| PUT | `/api/appointments/{id}` | Update appointment status |

---

## ML Models

### Diabetes Risk Prediction
- **Algorithm:** XGBoost Classifier
- **Features:** Pregnancies, Glucose, Blood Pressure, Skin Thickness, Insulin, BMI, Diabetes Pedigree, Age
- **Output:** Risk level (Low/Medium/High) + probability score
- **Explainability:** SHAP values — top 3 contributing factors with impact direction

### Pneumonia X-Ray Classification
- **Algorithm:** ResNet-50 (transfer learning)
- **Input:** Chest X-ray image (JPEG/PNG)
- **Output:** Pneumonia probability + confidence score

---

## Screenshots

> Screenshots will be added after frontend development is complete.

<!--
![Dashboard](screenshots/dashboard.png)
![Patient Detail](screenshots/patient-detail.png)
![SHAP Explanation](screenshots/shap-chart.png)
![X-Ray Analysis](screenshots/xray-result.png)
-->

---

## Live Demo

> Deployment link will be added after launch.

<!-- **Live URL:** [https://banglahealth-hms.onrender.com](https://banglahealth-hms.onrender.com) -->

---

## Development

### Run without Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Run Tests
```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

---

## License

This project is licensed under the MIT License.

---

## Author

**Rakib** — Built as part of a portfolio for graduate program applications in Software Engineering & AI.

---

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [XGBoost](https://xgboost.readthedocs.io/) + [SHAP](https://shap.readthedocs.io/) for explainable ML
- [Next.js](https://nextjs.org/) for the frontend framework
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for data visualization
