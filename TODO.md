# BanglaHealth HMS — Development TODO

## Phase 1: Foundation (Week 1)

### Project Setup
- [x] Initialize Git repository
- [x] Create monorepo folder structure (`backend/`, `frontend/`)
- [x] Set up `.env` and `.env.example` files
- [x] Create base `docker-compose.yml` with PostgreSQL service
- [x] Create `Dockerfile.backend` and `Dockerfile.frontend`

### Database
- [x] Design final database schema (users, patients, vitals, risk_predictions, appointments, xray_results, audit_log)
- [x] Set up SQLAlchemy models + Alembic for migrations
- [x] Write seed script: 50 demo patients with vitals data
- [ ] Test: `docker-compose up` → PostgreSQL running with seeded data

---

## Phase 2: Backend API (Week 2)

### Authentication
- [x] Install dependencies: python-jose, passlib, bcrypt
- [x] Create User model + registration endpoint
- [x] Create login endpoint → returns JWT token
- [x] Create role-based middleware (Admin, Doctor, Nurse, Receptionist)
- [x] Create `/api/auth/me` endpoint for current user info

### Patient Endpoints
- [x] `POST /api/patients` — Create patient
- [x] `GET /api/patients` — List patients (with search, filter by risk level, pagination)
- [x] `GET /api/patients/{id}` — Get patient detail with vitals + predictions
- [x] `PUT /api/patients/{id}` — Update patient
- [x] `DELETE /api/patients/{id}` — Delete patient (admin only)

### Vitals Endpoints
- [x] `POST /api/patients/{id}/vitals` — Record new vitals
- [x] `GET /api/patients/{id}/vitals` — Get vitals history

### Appointment Endpoints
- [x] `POST /api/appointments` — Schedule appointment
- [x] `GET /api/appointments` — List appointments (filter by date, doctor, status)
- [x] `PUT /api/appointments/{id}` — Update status (Scheduled/Completed/Cancelled)

### Infrastructure
- [x] Pydantic request/response schemas for all endpoints
- [x] Global error handling middleware
- [x] CORS configuration
- [x] API rate limiting on ML endpoints
- [x] Swagger docs properly configured at `/docs`

---

## Phase 3: ML Integration (Week 3)

### Diabetes Risk Prediction
- [x] Create `predictor.py` — load model, run inference, generate SHAP values
- [x] `POST /api/patients/{id}/predict` — Run prediction, store result in DB
- [x] `GET /api/patients/{id}/predictions` — Get prediction history
- [x] Return top 3 SHAP features with impact direction + human-readable summary
- [ ] Copy `risk_model.pkl` and `scaler.pkl` from Project 1

### X-Ray Analysis
- [x] Create `xray_predictor.py` — load model, preprocess image, run inference
- [x] `POST /api/patients/{id}/xray` — Upload X-ray image, return pneumonia probability
- [x] Store X-ray results linked to patient record
- [x] Handle image validation (file type, size limits)
- [ ] Copy or load ResNet-50 model from Project 2

### Audit & Logging
- [x] Create audit_log table model
- [x] Log every prediction request (who, when, patient, result)
- [x] Log patient data modifications
- [x] `GET /api/audit-log` — Admin-only endpoint to view logs

---

## Phase 4: Frontend Core (Week 4)

### Setup
- [x] Initialize Next.js 14 app with App Router
- [x] Install TailwindCSS + configure theme (colors, fonts)
- [x] Install Recharts + TanStack Query
- [x] Set up API client utility (fetch wrapper with JWT)
- [x] Create layout: sidebar navigation + top bar

### Authentication Pages
- [x] Login page with form validation
- [x] Auth context/provider — store JWT, redirect on expiry
- [x] Protected route middleware (Next.js route groups)

### Dashboard Page (`/dashboard`)
- [x] Stats cards: Total Patients, High Risk Count, Predictions Today, Appointments Today
- [x] Risk distribution pie chart
- [x] Predictions over time line chart
- [x] District-wise risk breakdown (bar chart)

### Patients Page (`/patients`)
- [x] Patient list table with columns: Name, Age, Gender, District, Risk Level, Registered
- [x] RiskBadge component (High = red, Medium = yellow, Low = green)
- [x] Search bar (by name, district)
- [x] Filter by risk level dropdown
- [x] Pagination controls
- [x] "Add Patient" button → form page

---

## Phase 5: Frontend Advanced (Week 5)

### Patient Detail Page (`/patients/[id]`)
- [x] Patient info header (name, age, gender, district)
- [x] Vitals entry form → submit to API
- [x] "Run Prediction" button → call `/predict`, display result
- [x] SHAPChart component (horizontal bar chart — red for increases risk, green for decreases)
- [x] Prediction history timeline (list of past predictions with dates + scores)
- [x] Vitals history chart (glucose, BMI, BP over time)

### X-Ray Section
- [x] XRayUploader component (drag & drop or file select)
- [x] Upload progress indicator
- [x] Result display: pneumonia probability + confidence bar
- [x] X-ray history per patient

### Appointments Page (`/appointments`)
- [x] List view of appointments
- [x] Schedule new appointment form
- [x] Status update buttons (Complete / Cancel)

### Notifications
- [x] Notification panel: high-risk patient alerts
- [x] Alert badge in navigation header

### Polish
- [x] Responsive design (mobile + tablet)
- [x] Loading skeletons for data fetching
- [x] Toast notifications for success/error actions

---

## Phase 6: Deploy & Document (Week 6)

### Docker
- [x] Finalize `Dockerfile.backend` (multi-stage build)
- [x] Finalize `Dockerfile.frontend` (Next.js standalone output)
- [ ] Test full stack: `docker-compose up --build` works end-to-end
- [ ] Verify all services communicate correctly

### Deployment
- [x] Create `render.yaml` blueprint for one-click deployment
- [x] Create `start.sh` startup script (auto-migration + optional seed)
- [x] Create `docker-compose.prod.yml` for production
- [ ] Deploy to Render.com and test live URL

### CI/CD
- [x] GitHub Actions CI pipeline (lint, type-check, build)

### Documentation
- [x] Write comprehensive README.md
- [ ] Add screenshots of key pages
- [ ] Record 2-minute Loom demo video

### Final Checks
- [ ] Auth flow works end-to-end (register → login → use app → logout)
- [ ] ML predictions return correct SHAP explanations
- [ ] X-ray upload and classification works
- [ ] Docker build completes without errors
- [ ] Live deployment is accessible and functional
- [x] GitHub repo is clean (no `.env`, no `__pycache__`, proper `.gitignore`)

---

## Stretch Goals (Post-MVP)
- [ ] Dark mode toggle
- [ ] Email notifications for high-risk patients
- [ ] Multi-language support (Bengali + English)
- [ ] Patient data export (CSV)
- [ ] API versioning (`/api/v1/`)
- [ ] Unit tests: >80% coverage on backend
- [ ] E2E tests with Playwright
- [ ] WebSocket real-time updates for dashboard
- [ ] Model performance monitoring dashboard
