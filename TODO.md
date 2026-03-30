# BanglaHealth HMS — Development TODO

## Phase 1: Foundation (Week 1)

### Project Setup
- [ ] Initialize Git repository
- [ ] Create monorepo folder structure (`backend/`, `frontend/`)
- [ ] Set up `.env` and `.env.example` files
- [ ] Create base `docker-compose.yml` with PostgreSQL service
- [ ] Create `Dockerfile.backend` and `Dockerfile.frontend`

### Database
- [ ] Design final database schema (users, patients, vitals, risk_predictions, appointments, xray_results, audit_log)
- [ ] Set up SQLAlchemy models + Alembic for migrations
- [ ] Write seed script: 50 demo patients with vitals data
- [ ] Test: `docker-compose up` → PostgreSQL running with seeded data

---

## Phase 2: Backend API (Week 2)

### Authentication
- [ ] Install dependencies: python-jose, passlib, bcrypt
- [ ] Create User model + registration endpoint
- [ ] Create login endpoint → returns JWT token
- [ ] Create role-based middleware (Admin, Doctor, Nurse, Receptionist)
- [ ] Create `/api/auth/me` endpoint for current user info

### Patient Endpoints
- [ ] `POST /api/patients` — Create patient
- [ ] `GET /api/patients` — List patients (with search, filter by risk level, pagination)
- [ ] `GET /api/patients/{id}` — Get patient detail with vitals + predictions
- [ ] `PUT /api/patients/{id}` — Update patient
- [ ] `DELETE /api/patients/{id}` — Delete patient (admin only)

### Vitals Endpoints
- [ ] `POST /api/patients/{id}/vitals` — Record new vitals
- [ ] `GET /api/patients/{id}/vitals` — Get vitals history

### Appointment Endpoints
- [ ] `POST /api/appointments` — Schedule appointment
- [ ] `GET /api/appointments` — List appointments (filter by date, doctor, status)
- [ ] `PUT /api/appointments/{id}` — Update status (Scheduled/Completed/Cancelled)

### Infrastructure
- [ ] Pydantic request/response schemas for all endpoints
- [ ] Global error handling middleware
- [ ] CORS configuration
- [ ] API rate limiting on ML endpoints
- [ ] Swagger docs properly configured at `/docs`

---

## Phase 3: ML Integration (Week 3)

### Diabetes Risk Prediction
- [ ] Copy `risk_model.pkl` and `scaler.pkl` from Project 1
- [ ] Create `predictor.py` — load model, run inference, generate SHAP values
- [ ] `POST /api/patients/{id}/predict` — Run prediction, store result in DB
- [ ] `GET /api/patients/{id}/predictions` — Get prediction history
- [ ] Return top 3 SHAP features with impact direction + human-readable summary

### X-Ray Analysis
- [ ] Copy or load ResNet-50 model from Project 2
- [ ] Create `xray_predictor.py` — load model, preprocess image, run inference
- [ ] `POST /api/patients/{id}/xray` — Upload X-ray image, return pneumonia probability
- [ ] Store X-ray results linked to patient record
- [ ] Handle image validation (file type, size limits)

### Audit & Logging
- [ ] Create audit_log table model
- [ ] Log every prediction request (who, when, patient, result)
- [ ] Log patient data modifications
- [ ] `GET /api/audit-log` — Admin-only endpoint to view logs

---

## Phase 4: Frontend Core (Week 4)

### Setup
- [ ] Initialize Next.js 14 app with App Router
- [ ] Install TailwindCSS + configure theme (colors, fonts)
- [ ] Install Recharts + TanStack Query
- [ ] Set up API client utility (fetch wrapper with JWT)
- [ ] Create layout: sidebar navigation + top bar

### Authentication Pages
- [ ] Login page with form validation
- [ ] Register page
- [ ] Auth context/provider — store JWT, redirect on expiry
- [ ] Protected route middleware (Next.js middleware)

### Dashboard Page (`/dashboard`)
- [ ] Stats cards: Total Patients, High Risk Count, Predictions Today, Appointments Today
- [ ] Risk distribution pie chart
- [ ] Predictions over time line chart
- [ ] Recent patients table (top 10)
- [ ] District-wise risk breakdown (bar chart or map)

### Patients Page (`/patients`)
- [ ] Patient list table with columns: Name, Age, Gender, District, Risk Level, Last Visit
- [ ] RiskBadge component (High = red, Medium = yellow, Low = green)
- [ ] Search bar (by name, district)
- [ ] Filter by risk level dropdown
- [ ] Pagination controls
- [ ] "Add Patient" button → modal or form page

---

## Phase 5: Frontend Advanced (Week 5)

### Patient Detail Page (`/patients/[id]`)
- [ ] Patient info header (name, age, gender, district)
- [ ] Vitals entry form → submit to API
- [ ] "Run Prediction" button → call `/predict`, display result
- [ ] SHAPChart component (horizontal bar chart — red for increases risk, green for decreases)
- [ ] Prediction history timeline (list of past predictions with dates + scores)
- [ ] Vitals history chart (glucose, BMI, BP over time)

### X-Ray Section
- [ ] XRayUploader component (drag & drop or file select)
- [ ] Upload progress indicator
- [ ] Result display: pneumonia probability + confidence bar
- [ ] X-ray history per patient

### Appointments Page (`/appointments`)
- [ ] Calendar or list view of appointments
- [ ] Schedule new appointment form
- [ ] Status update buttons (Complete / Cancel)

### Reports & Notifications
- [ ] PDF report generation: patient summary with vitals + SHAP chart + X-ray result
- [ ] Download button on patient detail page
- [ ] Notification panel: high-risk patient alerts
- [ ] Alert badge in navigation sidebar

### Polish
- [ ] Responsive design (mobile + tablet)
- [ ] Loading skeletons for data fetching
- [ ] Empty states for no-data scenarios
- [ ] Toast notifications for success/error actions

---

## Phase 6: Deploy & Document (Week 6)

### Docker
- [ ] Finalize `Dockerfile.backend` (multi-stage build)
- [ ] Finalize `Dockerfile.frontend` (Next.js standalone output)
- [ ] Test full stack: `docker-compose up --build` works end-to-end
- [ ] Verify all services communicate correctly

### Deployment
- [ ] Create Render.com account
- [ ] Deploy PostgreSQL addon (free tier)
- [ ] Deploy backend service (connect GitHub repo)
- [ ] Deploy frontend service
- [ ] Set environment variables in Render dashboard
- [ ] Seed demo data on live server
- [ ] Test live URL end-to-end

### Documentation
- [ ] Write comprehensive README.md (done)
- [ ] Add architecture diagram image
- [ ] Add screenshots of key pages
- [ ] Record 2-minute Loom demo video
- [ ] Add demo video link to README

### Final Checks
- [ ] All API endpoints return proper error messages
- [ ] Auth flow works end-to-end (register → login → use app → logout)
- [ ] ML predictions return correct SHAP explanations
- [ ] X-ray upload and classification works
- [ ] Docker build completes without errors
- [ ] Live deployment is accessible and functional
- [ ] GitHub repo is clean (no `.env`, no `__pycache__`, proper `.gitignore`)

---

## Stretch Goals (Post-MVP)
- [ ] Dark mode toggle
- [ ] Email notifications for high-risk patients
- [ ] Multi-language support (Bengali + English)
- [ ] Patient data export (CSV)
- [ ] API versioning (`/api/v1/`)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Unit tests: >80% coverage on backend
- [ ] E2E tests with Playwright
- [ ] WebSocket real-time updates for dashboard
- [ ] Model performance monitoring dashboard
