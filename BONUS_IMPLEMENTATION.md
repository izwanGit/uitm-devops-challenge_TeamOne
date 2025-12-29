# 🚀 Technical Implementation: Bonus Features (B1 - B4)

This document provides a deep dive into how we implemented the "Innovation Pool" requirements.

---

### B1: Threat Intelligence (AI-Driven Price Prediction)
*   **The Problem**: Rental "bait-and-switch" scams where prices are too good to be true.
*   **Our Solution**: We built a dedicated **Intelligence Microservice** using Python and FastAPI.
*   **Implementation**:
    *   **Machine Learning**: We trained a regression model on a dataset of Malaysian rental properties.
    *   **Integration**: When a landlord posts a listing, our Node.js backend sends the property features (bedrooms, area, location) to the AI Service via an internal REST API.
    *   **Logic**: If the listed price is significantly below the predicted market value (90%+ variance), the system flags it as a "High-Risk Scam" and prevents it from going live without admin approval.
*   **File**: `rentverse-ai-service/app/main.py`

### B2: Zero-Trust Logic (Advanced Device Fingerprinting)
*   **The Problem**: Session Hijacking—where an attacker steals a user's JWT token and uses it on their own device.
*   **Our Solution**: Every session is cryptographically bound to a specific piece of hardware.
*   **Implementation**:
    *   **Fingerprinting**: At login, the app collects a set of non-PII hardware and browser characteristics (OS version, GPU info, screen resolution, headers).
    *   **Hashing**: This data is hashed into a unique **Device Fingerprint**.
    *   **Verification**: This hash is stored inside the JWT. On every subsequent request, our middleware re-calculates the fingerprint. If the fingerprint doesn't match the one in the token, the session is invalidated *immediately*, even if the password is correct.
*   **File**: `rentverse-backend/src/utils/device.utils.js` & `src/middleware/securityMonitor.middleware.js`

### B3: Adaptive Defense (Autonomous Locking System)
*   **The Problem**: Manual monitoring is too slow to stop high-velocity attacks.
*   **Our Solution**: An autonomous system that "fights back" without human intervention.
*   **Implementation**:
    *   **Impossible Travel**: We use the **Haversine Formula** to track the distance between logins. If you log in from KL and then Jakarta in 5 minutes, you are flagged.
    *   **Brute Force Detection**: We track login velocity. 5+ failures in 60 seconds triggers a block.
    *   **Autonomous Lockout**: These anomalies feed into a **Risk Engine**. If a user's risk score exceeds 90, the backend updates the `lockoutUntil` field in the database, physically blocking the user for a set duration.
*   **File**: `rentverse-backend/src/services/anomaly.service.js` & `src/services/alert.service.js`

### B4: Fully Automated Security Review (CI/CD Security)
*   **The Problem**: Human error during development can introduce vulnerabilities (leaked keys, outdated packages).
*   **Our Solution**: A "Security Gate" that kills the build if it finds any flaws.
*   **Implementation**:
    *   **Secret Scanning (Gitleaks)**: Scans every commit in the pipeline for API keys or passwords.
    *   **Vulnerability Scanning (Trivy)**: Scans our Docker images and node_modules for known CVEs.
    *   **Static Analysis (CodeQL)**: GitHub's advanced engine analyzes the source code for logic flaws like SQL Injection or Open Redirects.
*   **File**: `.github/workflows/ci-cd.yml`
