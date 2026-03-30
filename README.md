# BanglaHealth HMS + AI Dashboard

**A Smart Hospital Management System with AI-Powered Clinical Decision Support**

Built for hospitals and clinics in Bangladesh to digitize operations, predict patient risks using machine learning, and deliver actionable insights through a modern analytics dashboard.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)
![Tests](https://img.shields.io/badge/tests-15%20passed-brightgreen.svg)

---

## The Problem

Hospitals in Bangladesh face critical challenges:

- **Manual record-keeping** leads to lost patient data, duplicated files, and delayed diagnoses
- **No early warning system** — doctors discover high-risk conditions only when symptoms appear, often too late for prevention
- **Disconnected workflows** — patient records, lab results, appointments, and imaging exist in separate paper systems
- **Limited access to specialists** — rural clinics lack radiologists to read X-rays, causing delays in pneumonia detection
- **No data-driven insights** — hospital administrators cannot identify risk patterns across districts or track disease trends

**BanglaHealth HMS solves all of this in one platform.**

---

## The Solution

BanglaHealth HMS is a full-stack hospital management system that embeds AI-powered risk prediction directly into the clinical workflow. Instead of replacing doctors, it amplifies their capabilities:

- A doctor records patient vitals and instantly gets a **diabetes risk score with explainable AI** showing exactly which factors are driving the risk
- A nurse uploads a chest X-ray and gets an **automated pneumonia probability** within seconds, helping prioritize urgent cases
- An administrator opens the dashboard and sees **real-time risk distribution across all districts**, enabling data-driven resource allocation

---

## Who Benefits and How

### Doctors

| What They Get | How It Helps |
|---------------|-------------|
| One-click diabetes risk prediction | No manual calculation — enter vitals, get instant risk score (Low/Medium/High) |
| SHAP explanations | Understand *why* a patient is high-risk (e.g., "glucose level increases risk by 35%") |
| Patient history timeline | See how risk scores change over time to evaluate treatment effectiveness |
| X-ray AI analysis | Get pneumonia probability for chest X-rays without waiting for a radiologist |
| PDF patient reports | Download complete patient reports for referrals or records |
| Appointment management | View and manage all scheduled appointments with status tracking |

### Nurses

| What They Get | How It Helps |
|---------------|-------------|
| Digital vitals entry | Record glucose, BP, BMI, insulin, and more — linked directly to patient records |
| Risk visibility | See patient risk levels at a glance to prioritize care |
| Reduced paperwork | No more handwritten logs — all vitals are timestamped and searchable |

### Receptionists

| What They Get | How It Helps |
|---------------|-------------|
| Patient registration | Register new patients with district, contact info, and demographics |
| Appointment scheduling | Book appointments by selecting doctor and patient from dropdowns |
| Patient search | Find any patient instantly by name or district |

### Hospital Administrators (Admin)

| What They Get | How It Helps |
|---------------|-------------|
| Analytics dashboard | See total patients, high-risk count, daily predictions, and appointments at a glance |
| District-wise risk map | Identify which districts have the highest diabetes risk for targeted health campaigns |
| Prediction trends | Track how many risk predictions are being run daily — monitor system adoption |
| Audit trail | Full log of who did what and when — for compliance and accountability |
| Staff management | Create, edit, and deactivate doctor accounts |
| High-risk alerts | Get notified about patients with dangerous risk scores |

### Patients (Indirect Benefits)

- **Earlier detection** of diabetes risk before symptoms appear
- **Faster pneumonia screening** through AI-assisted X-ray reading
- **Better continuity of care** — every doctor sees the same complete record
- **Data-driven follow-ups** — high-risk patients get flagged for priority appointments

---

## Why Use BanglaHealth HMS

1. **AI Built In, Not Bolted On** — Risk prediction is part of the workflow, not a separate tool. Record vitals, click predict, get results.

2. **Explainable AI** — Doctors don't get a black-box score. SHAP values show exactly which factors (glucose, BMI, age, etc.) are driving each prediction and by how much.

3. **Works Without Specialists** — A rural clinic nurse can upload an X-ray and get a pneumonia probability score. No radiologist needed for initial screening.

4. **Role-Based Security** — Every user sees only what they need. Receptionists can't access predictions. Nurses can't delete patients. Only admins see audit logs.

5. **District-Level Insights** — Hospital networks can identify disease hotspots across Bangladesh's districts and allocate resources where they're needed most.

6. **One Command to Run** — `docker-compose up` starts everything: database, backend, frontend, and AI models. No complex setup.

7. **PDF Reports** — Generate professional patient reports with vitals, risk scores, X-ray results, and appointment history for referrals or records.

8. **Audit Compliance** — Every prediction, upload, and modification is logged with user ID, timestamp, and IP address.

---

## Features

### Patient Management
- Full CRUD (create, read, update, delete) for patient records
- Search and filter by name, district, or risk level
- Paginated patient list with color-coded risk badges
- Detailed patient profile with vitals history and prediction timeline

### AI-Powered Diabetes Risk Prediction
- **Model:** XGBoost Classifier trained on the Pima Indians Diabetes dataset
- **Input:** 8 vital signs (glucose, blood pressure, BMI, insulin, skin thickness, pregnancies, diabetes pedigree, age)
- **Output:** Risk score (0-100%) + Risk level (Low / Medium / High)
- **Explainability:** SHAP values showing top 3 contributing factors with impact direction
- **History:** Full prediction timeline per patient to track risk progression

### Chest X-Ray Pneumonia Detection
- **Model:** ResNet-50 (transfer learning with ImageNet pretrained weights)
- **Input:** Chest X-ray image (JPEG/PNG, max 10MB)
- **Output:** Pneumonia probability (0-100%) + confidence score
- **Storage:** Images saved and linked to patient records
- **Rate Limited:** 10 analyses per minute per user to prevent abuse

### Analytics Dashboard
- **Stat cards:** Total patients, high-risk count, predictions today, appointments today
- **Risk distribution pie chart:** Latest prediction per patient
- **Predictions over time:** Line chart showing daily prediction volume (30 days)
- **District-wise risk breakdown:** Grouped bar chart by district and risk level
- **Recent patients widget:** Quick access to latest registrations

### Doctor Management
- Add, edit, and remove doctors
- Activate/deactivate doctor accounts
- Search doctors by name
- Doctor list integrated into appointment scheduling

### Appointment Scheduling
- Schedule appointments with doctor and patient dropdowns
- Date and time selection with optional notes
- Status tracking: Scheduled / Completed / Cancelled
- Doctor name displayed in appointment list

### PDF Patient Reports
- Download complete patient report as PDF
- Includes: patient info, latest vitals, risk prediction, X-ray results, appointment history
- Professional formatting with color-coded risk indicators
- One-click download from patient detail page

### High-Risk Alerts
- Automatic detection of patients with high risk scores
- Alert panel showing patient name, district, score, and prediction time
- Configurable alert threshold

### Audit Trail
- Logs every prediction, patient creation, X-ray upload, and data modification
- Records: user ID, action type, resource, timestamp, IP address
- Admin-only access with filtering by action and resource type

### Authentication & Security
- JWT-based authentication with 60-minute token expiry
- bcrypt password hashing
- Role-based access control (RBAC) with 4 roles
- CORS protection configured for frontend origin
- Rate limiting on ML endpoints

---

## Role-Based Workflow

### Admin Workflow
```
Login --> Dashboard (view stats & alerts)
      --> Manage Doctors (add/edit/remove)
      --> View Audit Logs (monitor activity)
      --> View All Patients & Appointments
```

### Doctor Workflow
```
Login --> Dashboard (view stats)
      --> Select Patient --> View History
      --> Record Vitals --> Run AI Prediction --> Review SHAP Explanation
      --> Upload X-Ray --> Review Pneumonia Score
      --> Download Patient Report (PDF)
      --> Manage Appointments (complete/cancel)
```

### Nurse Workflow
```
Login --> Select Patient
      --> Record Vitals (glucose, BP, BMI, etc.)
      --> View Risk Predictions (read-only)
```

### Receptionist Workflow
```
Login --> Register New Patient (name, age, district, contact)
      --> Schedule Appointment (select doctor + patient + date/time)
      --> Search Patients
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Server-side rendering, routing, React framework |
| **UI Styling** | TailwindCSS | Utility-first responsive design |
| **Charts** | Recharts | Dashboard visualizations (pie, line, bar charts) |
| **State Management** | TanStack Query (React Query) | Server state caching, auto-refetching |
| **Backend** | FastAPI | High-performance async Python API framework |
| **ORM** | SQLAlchemy 2.0 | Database models and queries |
| **Validation** | Pydantic v2 | Request/response schema validation |
| **Database** | PostgreSQL 15 | Relational data storage |
| **Migrations** | Alembic | Database schema versioning |
| **ML (Tabular)** | XGBoost + SHAP | Diabetes risk prediction with explainability |
| **ML (Imaging)** | PyTorch + ResNet-50 | Chest X-ray pneumonia classification |
| **Auth** | python-jose + bcrypt | JWT tokens + password hashing |
| **PDF Generation** | ReportLab | Patient report export |
| **Containerization** | Docker + docker-compose | One-command deployment |
| **CI/CD** | GitHub Actions | Automated linting, type checking, build verification |
| **Deployment** | Render.com | Cloud hosting (free tier) |
| **Testing** | pytest + httpx | 15 backend API tests |

---

## Architecture

```
┌────────────────────────┐         REST API         ┌────────────────────────┐
│                        │  ◄───────────────────►   │                        │
│     Next.js Frontend   │                          │    FastAPI Backend      │
│     (Port 3000)        │                          │    (Port 8000)         │
│                        │                          │                        │
│  - Login Page          │                          │  - Auth (JWT + RBAC)   │
│  - Dashboard           │                          │  - Patient CRUD        │
│  - Patient Management  │                          │  - Vitals Recording    │
│  - Doctor Management   │                          │  - Risk Prediction     │
│  - Appointments        │                          │  - X-Ray Analysis      │
│  - Risk Predictions    │                          │  - PDF Reports         │
│  - X-Ray Upload        │                          │  - Audit Logging       │
│  - PDF Download        │                          │  - Rate Limiting       │
│                        │                          │                        │
└────────────────────────┘                          └───────────┬────────────┘
                                                                │
                                                    ┌───────────┴───────────┐
                                                    │                       │
                                              ┌─────┴──────┐        ┌──────┴──────┐
                                              │ PostgreSQL  │        │  ML Models  │
                                              │   (5432)    │        │             │
                                              │             │        │  XGBoost    │
                                              │  7 Tables:  │        │  + SHAP     │
                                              │  users      │        │             │
                                              │  patients   │        │  ResNet-50  │
                                              │  vitals     │        │  (PyTorch)  │
                                              │  predictions│        │             │
                                              │  appointments│       └─────────────┘
                                              │  xray_results│
                                              │  audit_log  │
                                              └─────────────┘
```

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/muhammadrakib2299/BanglaHealth-HMS-AI-Dashboard.git
cd BanglaHealth-HMS-AI-Dashboard

# 2. Start all services (PostgreSQL + Backend + Frontend)
docker-compose up --build

# 3. Seed demo data (first time only — creates 5 users + 50 patients)
docker-compose exec backend python seed_data.py
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Swagger API Docs:** http://localhost:8000/docs

### Run Without Docker

**Backend** (Terminal 1):
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL environment variable to your PostgreSQL instance
uvicorn main:app --reload --port 8000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev
```

### Generate ML Model Files

```bash
cd backend/ml

# Train XGBoost diabetes model (generates risk_model.pkl + scaler.pkl)
python train_risk_model.py

# Setup ResNet-50 pneumonia model (generates resnet50_pneumonia.pth)
python train_xray_model.py
```

### Run Tests

```bash
pytest backend/tests/ -v
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@banglahealth.com | admin123 |
| Doctor | doctor@banglahealth.com | doctor123 |
| Doctor 2 | doctor2@banglahealth.com | doctor123 |
| Nurse | nurse@banglahealth.com | nurse123 |
| Receptionist | reception@banglahealth.com | reception123 |

The seed script creates **50 demo patients** across 15 Bangladeshi districts, each with vitals, risk predictions, and appointments.

---

## API Reference (27 Endpoints)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/auth/me` | Get current authenticated user |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients/` | Create patient |
| GET | `/api/patients/` | List patients (search, filter, paginate) |
| GET | `/api/patients/{id}` | Get patient with latest risk info |
| PUT | `/api/patients/{id}` | Update patient |
| DELETE | `/api/patients/{id}` | Delete patient (Admin only) |

### Vitals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients/{id}/vitals/` | Record vitals |
| GET | `/api/patients/{id}/vitals/` | Get vitals history |

### AI Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients/{id}/predict` | Run diabetes risk prediction |
| GET | `/api/patients/{id}/predictions` | Get prediction history |

### X-Ray Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients/{id}/xray/` | Upload X-ray for AI analysis |
| GET | `/api/patients/{id}/xray/history` | Get X-ray history |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors/` | List doctors (with search) |
| GET | `/api/doctors/{id}` | Get doctor details |
| POST | `/api/doctors/` | Create doctor |
| PUT | `/api/doctors/{id}` | Update doctor |
| DELETE | `/api/doctors/{id}` | Delete doctor |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/` | List appointments (filter by date/doctor/status) |
| POST | `/api/appointments/` | Schedule appointment |
| PUT | `/api/appointments/{id}` | Update appointment status |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Summary statistics |
| GET | `/api/dashboard/risk-distribution` | Risk level counts |
| GET | `/api/dashboard/predictions-over-time` | Daily prediction chart data |
| GET | `/api/dashboard/district-risk` | District-wise risk breakdown |

### Reports & Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/{id}/report` | Download patient PDF report |
| GET | `/api/alerts/high-risk` | High-risk patient alerts |
| GET | `/api/audit-log` | Audit trail (Admin only) |

---

## Project Structure

```
BanglaHealth-HMS-AI-Dashboard/
├── backend/
│   ├── main.py                       # FastAPI application entry point
│   ├── config.py                     # Environment configuration
│   ├── database.py                   # SQLAlchemy engine & session
│   ├── seed_data.py                  # Demo data generator (50 patients)
│   ├── start.sh                      # Docker startup script
│   ├── requirements.txt              # Python dependencies
│   ├── requirements-ml.txt           # ML-specific dependencies
│   ├── Dockerfile                    # Backend container
│   ├── models/                       # SQLAlchemy ORM models
│   │   ├── user.py                   #   Users (4 roles)
│   │   ├── patient.py                #   Patients
│   │   ├── vitals.py                 #   Vital signs
│   │   ├── risk_prediction.py        #   AI predictions
│   │   ├── appointment.py            #   Appointments
│   │   ├── xray_result.py            #   X-ray results
│   │   └── audit_log.py              #   Audit trail
│   ├── routers/                      # API route handlers
│   │   ├── auth.py                   #   Authentication
│   │   ├── patients.py               #   Patient CRUD
│   │   ├── vitals.py                 #   Vitals recording
│   │   ├── predictions.py            #   Risk prediction
│   │   ├── xray.py                   #   X-ray upload & analysis
│   │   ├── doctors.py                #   Doctor management
│   │   ├── appointments.py           #   Appointment scheduling
│   │   ├── dashboard.py              #   Analytics endpoints
│   │   ├── reports.py                #   PDF report generation
│   │   ├── alerts.py                 #   High-risk alerts
│   │   └── audit.py                  #   Audit log viewer
│   ├── schemas/                      # Pydantic request/response models
│   ├── middleware/                    # Auth, rate limiting, audit, errors
│   ├── ml/                           # Machine learning models
│   │   ├── predictor.py              #   XGBoost + SHAP inference
│   │   ├── xray_predictor.py         #   ResNet-50 inference
│   │   ├── train_risk_model.py       #   XGBoost training script
│   │   └── train_xray_model.py       #   ResNet-50 setup script
│   ├── tests/                        # pytest test suite (15 tests)
│   │   ├── conftest.py               #   Test fixtures & setup
│   │   ├── test_auth.py              #   Authentication tests
│   │   ├── test_patients.py          #   Patient API tests
│   │   └── test_doctors.py           #   Doctor API tests
│   └── alembic/                      # Database migrations
├── frontend/
│   ├── src/
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── login/                #   Login page
│   │   │   └── (authenticated)/      #   Protected pages
│   │   │       ├── dashboard/        #     Analytics dashboard
│   │   │       ├── patients/         #     Patient list + detail + new
│   │   │       ├── doctors/          #     Doctor management
│   │   │       └── appointments/     #     Appointment scheduling
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Sidebar.tsx           #   Navigation sidebar
│   │   │   ├── RiskBadge.tsx         #   Risk level badge
│   │   │   ├── SHAPChart.tsx         #   SHAP explanation chart
│   │   │   ├── XRayUploader.tsx      #   X-ray drag & drop
│   │   │   ├── Toast.tsx             #   Notification toasts
│   │   │   └── Skeleton.tsx          #   Loading skeletons
│   │   └── lib/                      # Utilities
│   │       ├── api.ts                #   API client with JWT
│   │       ├── auth.tsx              #   Auth context provider
│   │       └── types.ts              #   TypeScript interfaces
│   ├── Dockerfile                    # Frontend container
│   ├── tailwind.config.ts
│   └── package.json
├── docker-compose.yml                # Development orchestration
├── docker-compose.prod.yml           # Production orchestration
├── render.yaml                       # Render.com deployment blueprint
├── .github/workflows/ci.yml          # GitHub Actions CI pipeline
└── README.md
```

---

## ML Models In Detail

### Diabetes Risk Prediction

| Attribute | Detail |
|-----------|--------|
| **Algorithm** | XGBoost Classifier |
| **Training Data** | Pima Indians Diabetes Dataset (768 samples) |
| **Features** | Pregnancies, Glucose, Blood Pressure, Skin Thickness, Insulin, BMI, Diabetes Pedigree Function, Age |
| **Preprocessing** | StandardScaler normalization |
| **Output** | Risk score (0-100%), Risk level (Low < 30% / Medium 30-60% / High > 60%) |
| **Explainability** | SHAP TreeExplainer — shows top 3 factors with impact magnitude and direction |
| **Training Script** | `backend/ml/train_risk_model.py` |
| **Model Files** | `risk_model.pkl`, `scaler.pkl` |

### Pneumonia X-Ray Classification

| Attribute | Detail |
|-----------|--------|
| **Algorithm** | ResNet-50 (transfer learning) |
| **Pretrained On** | ImageNet (1000 classes) |
| **Fine-tuned For** | Binary classification — Normal vs Pneumonia |
| **Input** | 224x224 pixel chest X-ray (JPEG/PNG) |
| **Preprocessing** | ImageNet normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) |
| **Output** | Pneumonia probability (0-100%), Confidence score |
| **Setup Script** | `backend/ml/train_xray_model.py` |
| **Model File** | `resnet50_pneumonia.pth` (~94 MB) |

---

## Database Schema

```
┌──────────┐    ┌──────────┐    ┌───────────────┐    ┌──────────────┐
│  users   │    │ patients │    │    vitals     │    │ risk_        │
│──────────│    │──────────│    │───────────────│    │ predictions  │
│ id (PK)  │◄──┤ id (PK)  │◄──┤ id (PK)       │◄──┤──────────────│
│ email    │    │ full_name│    │ patient_id(FK)│    │ id (PK)      │
│ full_name│    │ age      │    │ glucose       │    │ patient_id   │
│ password │    │ gender   │    │ blood_pressure│    │ vitals_id    │
│ role     │    │ district │    │ bmi           │    │ risk_level   │
│ is_active│    │ phone    │    │ insulin       │    │ risk_score   │
│ created  │    │ address  │    │ skin_thickness│    │ shap_values  │
│ updated  │    │ created  │    │ pregnancies   │    │ top_features │
└──────────┘    │ updated  │    │ diabetes_ped  │    │ predicted_at │
     │          └──────────┘    │ age           │    └──────────────┘
     │               │          │ recorded_at   │
     │               │          └───────────────┘
     │               │
     │          ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
     │          │ appointments │    │ xray_results │    │  audit_log   │
     │          │──────────────│    │──────────────│    │──────────────│
     └─────────►│ id (PK)      │    │ id (PK)      │    │ id (PK)      │
                │ patient_id   │    │ patient_id   │    │ user_id      │
                │ doctor_id    │    │ image_path   │    │ action       │
                │ date         │    │ pneumonia_%  │    │ resource_type│
                │ time         │    │ confidence   │    │ resource_id  │
                │ status       │    │ uploaded_at  │    │ details      │
                │ notes        │    │ uploaded_by  │    │ ip_address   │
                └──────────────┘    └──────────────┘    │ created_at   │
                                                        └──────────────┘
```

---

## Testing

The project includes **15 automated tests** covering critical API functionality:

```
backend/tests/
├── conftest.py         # SQLite in-memory DB, test client, auth helpers
├── test_auth.py        # 6 tests: register, login, token, unauthorized
├── test_patients.py    # 5 tests: CRUD operations, 404 handling
└── test_doctors.py     # 4 tests: list, create, update, delete
```

Run all tests:
```bash
pytest backend/tests/ -v
```

---

## Deployment

### Render.com (One-Click)

The project includes `render.yaml` for Render.com deployment:

1. Fork this repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New > Blueprint** and connect your GitHub repo
4. Render automatically provisions PostgreSQL, backend, and frontend
5. Demo data seeds automatically on first deploy

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## CI/CD Pipeline

GitHub Actions runs on every push to `main`:

- **Backend:** Python syntax check + dependency validation
- **Frontend:** ESLint + TypeScript type checking + production build

---

## License

This project is licensed under the MIT License.

---

## Author

**Muhammad Rakib** — Full-stack developer building AI-integrated healthcare solutions.

Built as a portfolio project demonstrating the integration of machine learning into real-world clinical workflows, with emphasis on explainable AI, secure role-based systems, and production-ready containerized deployment.

---

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python web framework
- [Next.js](https://nextjs.org/) — React framework for production
- [XGBoost](https://xgboost.readthedocs.io/) — Gradient boosting for risk prediction
- [SHAP](https://shap.readthedocs.io/) — Explainable AI for model interpretation
- [PyTorch](https://pytorch.org/) — Deep learning framework for X-ray classification
- [TailwindCSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Recharts](https://recharts.org/) — React charting library
- [ReportLab](https://www.reportlab.com/) — PDF generation
- [PostgreSQL](https://www.postgresql.org/) — Reliable relational database
