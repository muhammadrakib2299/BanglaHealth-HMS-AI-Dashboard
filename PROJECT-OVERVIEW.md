# BanglaHealth HMS + AI Dashboard

## Project Overview

A full-stack Hospital Management System with embedded Machine Learning intelligence, built for real-world clinical decision support. The system integrates a diabetes risk prediction engine (XGBoost + SHAP) and a pneumonia X-ray classifier (ResNet-50) directly into a modern hospital workflow.

---

## Problem Statement

Hospitals in Bangladesh often rely on manual record-keeping and reactive diagnosis. There is no unified system that combines patient management, vitals tracking, and AI-powered risk assessment in a single platform. BanglaHealth HMS bridges this gap by embedding predictive intelligence directly into the clinical workflow.

---

## Core Objectives

1. **Digitize hospital operations** — patient registration, vitals recording, appointment scheduling, visit history
2. **Embed real-time ML risk scoring** — predict diabetes risk per patient using XGBoost, with SHAP-based explanations
3. **Integrate medical imaging AI** — upload chest X-rays and get pneumonia probability via ResNet-50
4. **Provide actionable analytics** — dashboard with risk distribution, district-level insights, and trend analysis
5. **Ensure clinical traceability** — audit logs, prediction history, role-based access control

---

## Tech Stack

| Layer              | Technology                              |
| ------------------ | --------------------------------------- |
| **Database**       | PostgreSQL 15 + Alembic (migrations)    |
| **Backend API**    | FastAPI + SQLAlchemy + Pydantic         |
| **Authentication** | JWT (python-jose) + Role-based access   |
| **ML Engine**      | XGBoost + SHAP (diabetes risk)          |
| **Imaging Engine** | ResNet-50 / PyTorch (pneumonia X-ray)   |
| **Frontend**       | Next.js 14 + TailwindCSS + Recharts    |
| **State/Caching**  | TanStack Query                          |
| **Containerization** | Docker + docker-compose               |
| **Deployment**     | Render.com (free tier)                  |
| **Testing**        | pytest (backend) + Vitest (frontend)    |

---

## Architecture

```
                    +-----------------+
                    |   Next.js App   |
                    |  (Port 3000)    |
                    +--------+--------+
                             |
                        REST API
                             |
                    +--------+--------+
                    |  FastAPI Server  |
                    |  (Port 8000)    |
                    +---+--------+----+
                        |        |
              +---------+--+  +--+---------+
              | PostgreSQL |  | ML Models  |
              |   (5432)   |  | XGBoost    |
              +------------+  | ResNet-50  |
                              +------------+
```

All services are containerized and orchestrated via `docker-compose`.

---

## Database Schema

### Tables

- **users** — Authentication, roles (Admin, Doctor, Nurse, Receptionist)
- **patients** — Name, age, gender, district, contact info
- **vitals** — Glucose, blood pressure, BMI, insulin, skin thickness, diabetes pedigree, pregnancies
- **risk_predictions** — Risk level, risk score, SHAP values JSON, linked to patient
- **appointments** — Patient-doctor scheduling with status tracking
- **xray_results** — Uploaded image path, pneumonia probability, model confidence
- **audit_log** — Who did what, when (prediction requests, patient modifications)

---

## Key Features

### Patient Management
- Full CRUD for patient records
- Search by name, district, risk level
- Paginated patient list with risk badges (High/Medium/Low)

### AI-Powered Risk Prediction
- Enter patient vitals → get real-time diabetes risk score
- SHAP explanation: top 3 contributing factors with direction of impact
- Prediction history timeline per patient (track risk over time)

### X-Ray Analysis
- Upload chest X-ray JPEG/PNG
- ResNet-50 returns pneumonia probability with confidence score
- Results stored and linked to patient record

### Analytics Dashboard
- Total patients, risk distribution (pie chart)
- Predictions over time (line chart)
- District-wise risk breakdown
- High-risk patient alerts

### Authentication & Authorization
- JWT-based login/register
- Role-based access:
  - **Admin** — Full system access + user management
  - **Doctor** — Patient records + predictions + X-ray
  - **Nurse** — Vitals entry + view predictions
  - **Receptionist** — Patient registration + appointments only

### Appointment Management
- Schedule appointments (date, time, doctor, patient)
- Status tracking: Scheduled / Completed / Cancelled
- Visit history per patient

### Reports & Audit
- Downloadable PDF patient risk report
- Full audit trail for predictions and data modifications
- Notification panel for high-risk patient alerts

---

## ML Models

### 1. Diabetes Risk Prediction (from Project 1)
- **Model:** XGBoost classifier
- **Features:** Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigree, Age
- **Output:** Risk level (Low/Medium/High), probability score, SHAP explanations
- **Explainability:** Top 3 SHAP features with impact direction

### 2. Pneumonia X-Ray Classification (from Project 2)
- **Model:** ResNet-50 (transfer learning)
- **Input:** Chest X-ray image (JPEG/PNG)
- **Output:** Pneumonia probability + confidence score

---

## Target Audience

This project serves as a portfolio piece for graduate program applications:

- **Poitiers (Software & Big Data):** Emphasize microservice architecture, Docker containerization, database schema design, API design, CI/CD
- **MIND / DataAI:** Emphasize ML integration, SHAP explainability panel, X-ray upload feature, real-time inference pipeline

---

## Project Status

**Phase:** Pre-development (Planning & Architecture)
**Target Completion:** 6 weeks
**Deployment Target:** Render.com (free tier) with live public URL
