# 🗺️ RentVerse Module & File Mapping Guide

This document maps the **Core Modules (M1-M6)** and **Bonus Features (B1-B4)** of the RentVerse SecOps Platform to their specific file locations in the codebase. Use this as a cheat sheet during your technical demo or Q&A.

---

## 🛡️ Core Modules (M1 - M6)

### M1: Secure Registration & Login (MFA + Hashing)
*   **Backend Logic**: `rentverse-backend/src/modules/auth/` (Auth Controller & Service)
*   **Password Hashing (BCrypt)**: `rentverse-backend/src/modules/auth/auth.service.js`
*   **MFA Implementation**: `rentverse-backend/src/middleware/session.js` (MFA Enforcement)
*   **Frontend UI**: `rentverse-frontend/app/login/page.tsx` & `rentverse-frontend/app/register/page.tsx`

### M2: API Gateway & Request Validation
*   **Security Headers (Helmet/CORS)**: `rentverse-backend/src/app.js`
*   **Rate Limiting**: `rentverse-backend/src/middleware/rateLimit.js`
*   **Schema Validation (Joi)**: `rentverse-backend/src/utils/validators.js` & `src/modules/*/schema.js`

### M3: Digital Rental Agreements (Non-Repudiation)
*   **PDF Generation (Puppeteer)**: `rentverse-backend/src/services/pdfGeneration.service.js`
*   **Digital Signature Pad**: `rentverse-frontend/app/leases/sign/page.tsx`
*   **Cryptographic Hashing (SHA-256)**: `rentverse-backend/src/services/pdfGeneration.service.js` (calculateFileHash)
*   **Non-Repudiation Check**: `rentverse-backend/src/services/pdfGeneration.service.js` (verifyPdf)

### M4: Smart SecOps Notifications (Slack/SMTP)
*   **Slack Webhook Integration**: `rentverse-backend/src/services/slack.service.js`
*   **SMTP Alerting (SendGrid)**: `rentverse-backend/src/services/email.service.js`
*   **Integrated Alerting Hub**: `rentverse-backend/src/services/alert.service.js` (handleAlerts)

### M5: Security & Activity Dashboard
*   **Admin Frontend**: `rentverse-frontend/app/admin/dashboard/` & `admin/security/`
*   **Audit Logging System**: `rentverse-backend/src/services/audit.service.js`
*   **Admin Controller**: `rentverse-backend/src/routes/admin.js`

### M6: Secured CI/CD Pipeline
*   **Main Pipeline File**: `.github/workflows/ci-cd.yml` (14+ Stages)
*   **Infrastructure Configuration**: `rentverse-backend/Dockerfile` & `rentverse-frontend/Dockerfile`

---

## 🚀 Innovation Pool (Bonus B1 - B4)

### B1: Threat Intelligence (AI Price Prediction)
*   **AI Microservice (FastAPI)**: `rentverse-ai-service/app/main.py`
*   **Price Scraper/Analyzer**: `rentverse-ai-service/app/services/scraper.py`
*   **ML Model Connector**: `rentverse-backend/src/services/ai.service.js`

### B2: Zero-Trust Identity (Device Fingerprinting)
*   **Fingerprint Calculation**: `rentverse-backend/src/utils/device.utils.js`
*   **Zero-Trust Middleware**: `rentverse-backend/src/middleware/securityMonitor.middleware.js`
*   **Mismatch Detection**: Logic in `securityMonitor.middleware.js` comparing current hash vs session hash.

### B3: Adaptive Defense (Autonomous Locking)
*   **Impossible Travel Logic (Haversine)**: `rentverse-backend/src/utils/geo.utils.js` & `src/services/anomaly.service.js`
*   **Autonomous Lockout Logic**: `rentverse-backend/src/services/alert.service.js` (Calls `prisma.user.update` for lockoutUntil).

### B4: Fully Automated Security Review
*   **Static Application Security Testing (CodeQL)**: `.github/workflows/ci-cd.yml`
*   **Secret Scanning (Gitleaks)**: `.github/workflows/ci-cd.yml` & `.gitleaks.toml`
*   **Vulnerability Scanning (Trivy)**: `.github/workflows/ci-cd.yml` (Scans both Backend & Frontend filesystems).

---

## 📂 Key Security Directories

*   **`rentverse-backend/src/middleware/`**: The "Shield" of the application.
*   **`rentverse-backend/src/services/`**: The "Brain" (Logging, Alerts, PDF, AI).
*   **`rentverse-frontend/utils/`**: Client-side security utilities (API configuration, Sharing).
