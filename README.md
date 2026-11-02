<div align="center">

# 🏥 SwasthyaSetu AI (स्वास्थ्यसेतु)
### *Next-Generation Affordable & Scalable Digital Healthcare Platform for Rural & Urban India*

[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA%20%7C%202G%20Kiosk-0D9488.svg?style=for-the-badge&logo=react)](https://swasthyasetu.vercel.app)
[![Compliance](https://img.shields.io/badge/Compliance-ABDM%20%7C%20DPDP%20Act%202023%20%7C%20FHIR%20R4-0284C7.svg?style=for-the-badge&logo=healthcare)](https://abdm.gov.in)
[![Security](https://img.shields.io/badge/Security-OWASP%20Top%2010%20%7C%20Bcrypt%20%7C%20JWT-10B981.svg?style=for-the-badge&logo=auth0)](#-security--compliance-posture)
[![Build Status](https://img.shields.io/badge/Build-Production%20Verified%20(20%2F20%20Tests)-16A34A.svg?style=for-the-badge&logo=checkmarx)](#-automated-testing--audit-results)

[Explore Live Demo](http://localhost:3001) • [API Documentation](#-api-reference) • [Database Architecture](#-database-schema-mongodb-atlas) • [Cloud Deployment](#-production-cloud-deployment-guide)

</div>

---

## 📌 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Core Innovation & Features](#-core-innovation--features)
- [Interactive Clinical Demonstration Flow](#-interactive-clinical-demonstration-flow)
- [Database Schema (MongoDB Atlas)](#-database-schema-mongodb-atlas)
- [API Reference](#-api-reference)
- [Security & Compliance Posture](#-security--compliance-posture)
- [Automated Testing & Audit Results](#-automated-testing--audit-results)
- [Local Setup & Installation](#-local-setup--installation)
- [Production Cloud Deployment Guide](#-production-cloud-deployment-guide)
- [Repository Structure](#-repository-structure)
- [License & Statutory Disclaimer](#-license--statutory-disclaimer)

---

## 📖 Executive Overview

India faces a severe structural healthcare imbalance: **over 65% of the population resides in rural areas, while nearly 80% of registered doctors and tertiary care hospitals are concentrated in urban centers**. Furthermore, out-of-pocket expenditure on branded pharmaceuticals drives millions of families into medical debt annually.

**SwasthyaSetu AI** is an enterprise-grade digital health ecosystem developed to eliminate these barriers through four foundational pillars:
1. **Indic Multilingual AI Triage**: Voice and text symptom intake in regional dialects (Hindi, English, Hinglish) with immediate red-flag screening for emergencies (National Ambulance Dispatch **108**).
2. **2G-Resilient Telemedicine**: Low-bitrate (16 kbps Opus) WebRTC voice and video consultations designed for rural edge networks with high packet loss.
3. **PMBJP Generic Drug Substitution Engine**: Algorithmic brand-to-generic mapping converting costly branded medicines to bioequivalent Jan Aushadhi generic salts, delivering **70% to 93% direct cost reduction**.
4. **National ABDM & DPDP Act 2023 Compliance**: Integrated 14-digit **ABHA identity** generation, standardized **FHIR R4 longitudinal health records**, dynamic consent gating, and immutable audit logs.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER (Vercel SPA)                                  │
│                                                                                        │
│   React 18 + TypeScript + Vite + Tailwind CSS + Lucide React + Recharts Visualizations │
│   ┌──────────────────────┬────────────────────────────┬────────────────────────────┐   │
│   │   Citizen Portal     │   Doctor Telehealth Hub    │   District Admin Desk      │   │
│   │   • ABHA Health Card │   • OPD Waiting Queue      │   • Rural vs Urban Stats   │   │
│   │   • Voice AI Triage  │   • E-Prescription Studio  │   • NMC Credential Audit   │   │
│   │   • Jan Aushadhi     │   • Authorized ABHA EHR    │   • DPDP Access Trails     │   │
│   └──────────────────────┴────────────────────────────┴────────────────────────────┘   │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ HTTPS / WSS / Bearer JWT
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY TIER (Render Express)                             │
│                                                                                        │
│   Node.js + Express + Helmet + CORS Whitelist + express-rate-limit + Zod Validation    │
│   ┌──────────────────────┬────────────────────────────┬────────────────────────────┐   │
│   │  /api/auth           │  /api/telemed              │  /api/abdm                 │   │
│   │  /api/patients       │  /api/consultations        │  /api/resources            │   │
│   │  /api/doctors        │  /api/pharmacy             │  /api/rural                │   │
│   └──────────────────────┴────────────────────────────┴────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┬──────────────────────┘
                       │                                          │
                       ▼                                          ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
│       DATABASE TIER (Atlas)          │  │        AI CLINICAL ENGINE (Render)           │
│                                      │  │                                              │
│   MongoDB Atlas (Replica Set)        │  │   FastAPI + Uvicorn + Clinical Reasoning     │
│   • 10 Collections (Mongoose)        │  │   • Indic Regional Symptom NLP Triage        │
│   • Connection Pool (min 2, max 10)  │  │   • Emergency 108 Red-Flag Sentinel          │
│   • Resilient In-Memory Fallback     │  │   • Preventive Health Analytics (NCD Score)  │
│   • Immutable Audit Trail Log        │  │   • PMBJP Generic Bioequivalent Drug Engine  │
└──────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

---

## 🚀 Core Innovation & Features

### 1. Indic AI Health Assistant (`/ai-assistant`)
- **Multilingual Dialect Intake**: Supports native voice and text symptom descriptions across Hindi, Hinglish, and English with browser Web Speech API integration.
- **Cardiovascular & Neurological Red-Flag Sentinels**: Scans for myocardial infarction, stroke (FAST protocol), and acute respiratory distress, triggering immediate **108 National Ambulance Dispatch** guidance.
- **Differential Reasoning**: Correlates symptoms with vital telemetry (Blood Pressure, SpO2, Pulse, Capillary Glucose) and outputs provisional ICD-10 diagnostic classifications.

### 2. Affordable Healthcare Discovery & Rural 2G Mode (`/affordable-centers`)
- **Geographic Discovery**: Search verified hospitals, Community Health Centers (CHCs), Primary Health Centers (PHCs), diagnostic labs, and Jan Aushadhi Kendras.
- **Published Tariff Transparency**: Compare published consultation fees (₹0 government subsidies to ₹200).
- **Ultra-Low Bandwidth 2G Mode**: Strips bulky payloads down to **< 2KB per request**, allowing instant loading over edge cellular networks in remote villages.

### 3. Telemedicine & E-Prescription Studio (`/telemedicine`)
- **Multi-Modality Consultations**: Supports HD WebRTC Video, Audio-Only, and Village Gram Kiosk teleconsultation modes.
- **Cryptographic E-Prescriptions**: Doctors counter-sign prescriptions backed by verified National Medical Commission (NMC) registration numbers.
- **Generic Substitution Savings**: Real-time price delta calculation demonstrating direct household savings (**₹407/month average, 79% financial relief**).

### 4. Professional Dashboards Suite
- **Patient Dashboard (`/patient-dashboard`)**: Recharts Fasting Blood Glucose (`AreaChart`) and Blood Pressure variance (`BarChart`), active ABHA card link, upcoming appointments, and preventive care pamphlets.
- **Doctor Dashboard (`/doctor-dashboard`)**: Live waiting room queue categorized by triage priority (*Emergency*, *Urgent*, *Routine*), patient roster, pending appointment requests, authorized records viewer, and clinical case-mix analytics (`PieChart`).
- **Admin Dashboard (`/admin-dashboard`)**: Platform-wide KPIs, Rural vs. Urban utilization breakdown (`PieChart` & `BarChart`), monthly registration growth, doctor credential verification desk, and immutable compliance audit log.

---

## 🎬 Interactive Clinical Demonstration Flow

A complete end-to-end patient storyline is documented in [`scratch/demo_workflow.md`](scratch/demo_workflow.md):

| Step | User Action | System Execution | Verified Endpoint |
| :---: | :--- | :--- | :---: |
| **01** | **Patient Registration** | Citizen Ramesh Patel registers at `/auth`; system hashes password (Bcrypt 10 rounds) and generates a compliant **14-digit ABHA ID** (`14-8921-4321-7654`). | `POST /api/auth/register-patient` |
| **02** | **Resource Discovery** | Patient toggles **2G Low-Bandwidth Mode** in Sitapur District; receives PHC facility profile (`< 2KB` payload). | `GET /api/resources?district=Sitapur&lite=true` |
| **03** | **Voice Symptom Triage** | Patient describes symptoms in Hindi: *"मुझे बहुत प्यास लग रही है और बार-बार पेशाब जाना पड़ रहा है"* (`Glucose: 242 mg/dL`); AI detects Hyperglycemia (`ICD-10: E11.9`). | `POST /api/triage/assess` |
| **04** | **Telehealth Booking** | Patient books an audio teleconsultation with Dr. Priya Sharma (MD Internal Medicine, AIIMS New Delhi). | `POST /api/telemed/appointments` |
| **05** | **Doctor Consultation** | Doctor views Ramesh in the OPD queue, reviews authorized EHR under active consent, and prescribes bioequivalent Jan Aushadhi generic salts (**83% direct savings**). | `GET /api/doctors/dashboard-summary` |
| **06** | **Health Monitoring** | Patient reviews Fasting Glucose AreaChart trends on `/patient-dashboard` and can revoke data sharing consent under Section 6 of the DPDP Act 2023. | `POST /api/abdm/consents/revoke` |

---

## 🗄️ Database Schema (MongoDB Atlas)

The platform is backed by 10 normalized, indexed Mongoose collections:

| Collection | Schema Model | Purpose | Primary Keys & Key Indexes |
| :--- | :--- | :--- | :--- |
| **`users`** | `User.ts` | Authentication identities and role permissions | `_id`, `email` (unique), `phone` (unique), `role` |
| **`patients`** | `Patient.ts` | Citizen demographics, vitals, and ABHA identity | `userId` (ref: users), `abhaId` (unique), `bloodGroup` |
| **`doctors`** | `Doctor.ts` | Physician licensing, specialty, and OPD slots | `userId` (ref: users), `nmcRegistrationNumber` (unique), `specialty` |
| **`appointments`** | `Appointment.ts` | Telehealth and in-person consultations | `patientId`, `doctorId`, `date`, `status` |
| **`medicalrecords`** | `MedicalRecord.ts` | Longitudinal EHR diagnostic documents and labs | `patientId`, `recordType`, `date` |
| **`healthmetrics`** | `HealthMetric.ts` | Time-series vitals (Glucose, BP, SpO2, Pulse) | `patientId`, `recordedAt`, `metricType` |
| **`healthcarecenters`**| `HealthcareCenter.ts` | Public facility directory and rural kiosks | `_id`, `district`, `category`, `pincode` |
| **`consultations`** | `Consultation.ts` | Clinical notes, provisional diagnoses, and ICD-10 | `appointmentId`, `doctorId`, `patientId` |
| **`notifications`** | `Notification.ts` | Patient follow-up alerts and medicine refill notices | `userId`, `isRead`, `createdAt` |
| **`feedback`** | `Feedback.ts` | Citizen care ratings and quality reviews | `patientId`, `targetType`, `rating` |

---

## 🌐 API Reference

All protected endpoints require an HTTP Bearer token: `Authorization: Bearer <JWT>`.

### Authentication & Profiles (`/api/auth`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/auth/register-patient` | Register patient and issue 14-digit ABHA identity | Public |
| `POST` | `/api/auth/register-doctor` | Register doctor with NMC license credentials | Public |
| `POST` | `/api/auth/login` | Authenticate user and issue signed 7-day JWT | Public |
| `GET` | `/api/auth/me` | Validate session token and retrieve user profile | Authenticated |

### ABDM & Consent-Gated Records (`/api/abdm`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/abdm/generate-abha` | Provision official 14-digit ABHA ID and ABHA address | Public |
| `GET` | `/api/abdm/fhir-bundle/:patientId` | Retrieve FHIR R4 longitudinal record (403 if consent revoked) | Consent Gated |
| `POST` | `/api/abdm/consents/grant` | Grant third-party clinical access under DPDP Act 2023 | Patient |
| `POST` | `/api/abdm/consents/revoke` | Revoke data access under Section 6 of the DPDP Act | Patient |
| `GET` | `/api/abdm/audit-trail` | Immutable compliance log of all health data access events | Admin / Auditor |

### Clinical AI & Telehealth (`/api/triage`, `/api/telemed`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/triage/assess` | Clinical triage reasoning engine with red-flag sentinel | Public / Patient |
| `POST` | `/api/telemed/appointments` | Schedule a telemedicine consultation slot | Patient |
| `GET` | `/api/doctors/dashboard-summary` | Retrieve doctor OPD waiting queue and clinical case-mix | Doctor |
| `GET` | `/api/patients/dashboard-summary`| Retrieve patient longitudinal vitals and prescriptions | Patient |

### Healthcare Resource Directory (`/api/resources`, `/api/rural`)
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/resources` | Filter healthcare centers by district and category (`lite=true` for 2G) | Public |
| `POST` | `/api/resources/upload-photo` | Secure facility photo upload with WebP optimization (< 5MB) | Authenticated |
| `GET` | `/api/rural/kiosks` | List Gram Panchayat assisted telehealth kiosks | Public |

---

## 🔒 Security & Compliance Posture

| Domain | Control Implemented | Standard Aligned | Status |
| :--- | :--- | :--- | :---: |
| **Authentication** | Bcrypt password hashing (10 salt rounds) + signed JWTs | OWASP Top 10 | **VERIFIED** |
| **Role-Based Access** | Privilege escalation defense (`patient` blocked from `/api/admin` with `403`) | NIST RBAC | **VERIFIED** |
| **Rate Limiting** | `express-rate-limit`: 200 req/15min on `/api/`, 20 req/15min on auth | OWASP API4:2023 | **VERIFIED** |
| **File Upload Defense** | MIME whitelist (`image/jpeg, png, webp`), 5MB cap, regex rejection of SVG scripts | OWASP API8:2023 | **VERIFIED** |
| **HTTP Hardening** | Helmet headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`) | OWASP Security Headers | **VERIFIED** |
| **CORS Policy** | Strict origin whitelist with credentials support for Vercel and Render domains | W3C CORS Spec | **VERIFIED** |
| **Consent Gating** | Revoked consent triggers immediate `403 Forbidden` on FHIR bundles | DPDP Act 2023 §6 | **VERIFIED** |
| **Audit Trails** | Immutable audit log capturing user, timestamp, action, resource, IP, and token | ABDM Security Spec | **VERIFIED** |
| **Clinical Safety** | Statutory non-diagnostic disclaimers and immediate 108 emergency escalation prompts | CDSCO Guidelines | **VERIFIED** |

---

## 🧪 Automated Testing & Audit Results

The automated security and quality test suite ([`scratch/test_security_audit.ps1`](scratch/test_security_audit.ps1)) verifies 20 critical assertions across backend and AI microservices:

```text
=======================================================
 SWASTHYASETU AI - COMPREHENSIVE SECURITY & AUDIT SUITE
=======================================================

--- 1. Security Headers & Service Liveness ---
 [PASS] Backend Health Endpoint (HTTP 200)
 [PASS] X-Content-Type-Options: nosniff (Prevents MIME-sniffing attacks)
 [PASS] X-Frame-Options: SAMEORIGIN (Protects against clickjacking)

--- 2. FastAPI AI Clinical Service Health ---
 [PASS] AI Clinical Engine Available (Service: SwasthyaSetu AI Intelligence Core)

--- 3. Authentication & Credential Verification ---
 [PASS] Patient Registration Flow (Role: patient)
 [PASS] Patient Login with Valid Credentials (JWT issued)
 [PASS] Reject Invalid Password (Safely blocked with HTTP 401)
 [PASS] Doctor Registration & Licensing Flow (Role: doctor)

--- 4. Role-Based Access Control (RBAC) & Defense ---
 [PASS] Deny Access Without Bearer Token (HTTP 401)
 [PASS] Privilege Escalation Defense (Patient -> Admin HTTP 403)
 [PASS] Admin Authorized Route Access (HTTP 200)

--- 5. Secure File Uploads & Polyglot Injection Prevention ---
 [PASS] Reject Malicious Script/SVG Upload (HTTP 400)
 [PASS] Accept Clean Image & Optimize WebP (HTTP 201)

--- 6. DPDP Act & ABDM Consent-Gated Access ---
 [PASS] ABHA ID & Address Generation
 [PASS] FHIR R4 Bundle Access with Active Consent (HTTP 200)
 [PASS] Citizen Consent Revocation under DPDP Act (Success)
 [PASS] Block Access to Revoked Health Data (HTTP 403 Forbidden)
 [PASS] Immutable DPDP Audit Trail Logging (Logged access/revocation events)

--- 7. AI Clinical Triage & Emergency Warning Detection ---
 [PASS] AI Red-Flag Detection (Immediate 108 Recommendation)

--- 8. Credentials & Sensitive File Leak Protection ---
 [PASS] Root .gitignore Excludes .env & Secrets

=======================================================
 AUDIT SUMMARY RESULTS:
 Passed Tests: 20
 Failed Tests: 0
 Overall Status: PASSED (Production Audit Grade)
=======================================================
```

---

## 💻 Local Setup & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection string)

### 1. Clone Repository
```bash
git clone https://github.com/your-org/swasthyaSetu.git
cd swasthyaSetu
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.production.example .env
npm run dev
# Backend running on http://localhost:5000 (Health check: http://localhost:5000/api/health)
```

### 3. AI Clinical Microservice Setup
```bash
cd ../ai_service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# AI Service running on http://localhost:8000 (Health check: http://localhost:8000/health)
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# Frontend running on http://localhost:3000 or http://localhost:3001
```

---

## ☁️ Production Cloud Deployment Guide

### Deploying Frontend to Vercel
1. Push the repository to GitHub.
2. Sign in to **[Vercel](https://vercel.com)** and create a new project.
3. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://swasthyasetu-backend.onrender.com/api`
   - `VITE_AI_SERVICE_URL`: `https://swasthyasetu-ai.onrender.com`
5. Click **Deploy**. Vercel will use [`frontend/vercel.json`](frontend/vercel.json) to handle SPA client-side routing rewrites and static asset caching.

### Deploying Backend & AI Microservice to Render
1. Sign in to **[Render](https://render.com)**.
2. Click **New +** > **Blueprint** and connect the repository.
3. Render detects [`render.yaml`](render.yaml) and automatically provisions:
   - **`swasthyasetu-backend`**: Node.js web service running `npm install && npm run build` and `npm start`.
   - **`swasthyasetu-ai`**: Python web service running `pip install -r requirements.txt` and `uvicorn main:app`.
4. Under the backend service environment variables, provide your production `MONGODB_URI` from MongoDB Atlas.
5. Deploy both services.

---

## 📁 Repository Structure

```text
swasthyaSetu/
├── ai_service/                      # Python FastAPI Clinical Intelligence Microservice
│   ├── main.py                      # FastAPI application entrypoint & clinical routing
│   ├── requirements.txt             # Microservice dependencies
│   └── .env.example                 # Python service environment template
├── backend/                         # Node.js & Express Production API Gateway
│   ├── src/
│   │   ├── config/                  # Environment variables & MongoDB Atlas connection
│   │   ├── middleware/              # Auth JWT, RBAC, input validation & rate limiting
│   │   ├── models/                  # 10 Normalized Mongoose schema models
│   │   ├── routes/                  # REST endpoints (auth, telemed, abdm, triage, etc.)
│   │   ├── services/                # Audit logger, in-memory store & clinical utilities
│   │   └── server.ts                # Server bootstrap with Helmet & CORS whitelist
│   ├── package.json                 # Backend scripts and dependencies
│   ├── tsconfig.json                # TypeScript compilation config (outputs to dist/)
│   └── .env.production.example      # Render production environment template
├── frontend/                        # React 18 TypeScript Single Page Application
│   ├── src/
│   │   ├── assets/                  # High-resolution clinical photographs & cutouts
│   │   ├── components/              # Shared UI components (cards, navbar, modals)
│   │   ├── pages/                   # 17 application pages (Patient, Doctor, Admin, etc.)
│   │   ├── services/                # API client with environment-aware endpoints
│   │   ├── types/                   # TypeScript interfaces (clinical, navigation, auth)
│   │   └── App.tsx                  # Client-side router and role-aware layouts
│   ├── vercel.json                  # Vercel SPA routing and caching configuration
│   └── .env.production.example      # Vercel production environment template
├── render.yaml                      # Render multi-service Infrastructure-as-Code manifest
└── README.md                        # Enterprise project documentation
```

---

## 📄 License & Statutory Disclaimer

This project is licensed under the **Apache License 2.0**.

> **Clinical Disclaimer**: SwasthyaSetu AI is engineered as an algorithmic assistive tool for registered medical practitioners and community health workers under the National Digital Health Mission. It provides pre-consultation educational triage and does not replace independent clinical judgment by a qualified physician. In acute, life-threatening medical emergencies (severe chest pain, stroke symptoms, acute dyspnea), users are directed immediately to the National Emergency Ambulance Dispatch (**108**).
