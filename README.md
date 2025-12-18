# 🏙️ RentVerse: Advanced Secure Mobile Rental Ecosystem

[![Project Status](https://img.shields.io/badge/Status-Exceptional-success?style=for-the-badge&logo=github)](https://github.com/izwanGit/uitm-devops-challenge_TeamOne)
[![Security Policy](https://img.shields.io/badge/Security-Enforced-red?style=for-the-badge&logo=snyk)](SECURITY.md)
[![License](https://img.shields.io/badge/Challenge-UiTM_Mobile_SecOps-blueviolet?style=for-the-badge)](https://github.com/izwanGit/uitm-devops-challenge_TeamOne)

**Team Name:** TeamOne  
**Challenge Theme:** "Mobile Defense and Intelligence: Build Fast, Defend Smarter"

> [!IMPORTANT]
> **RentVerse** is a high-integrity, mobile-first property rental platform engineered for the **UiTM Mobile SecOps 21Days Challenge**. It represents a state-of-the-art implementation of the DevSecOps philosophy, where security is an intrinsic part of the application's DNA.

---

## 🚀 Deployment Status

| Service | Environment | URL |
| :--- | :--- | :--- |
| **Frontend (Mobile/Web)** | Production (Vercel) | [uitm-devops-challenge-team-one.vercel.app](https://uitm-devops-challenge-team-one.vercel.app) |
| **Backend API** | Production (Railway) | [uitm-devops-challengeteamone-production.up.railway.app](https://uitm-devops-challengeteamone-production.up.railway.app) |
| **AI Microservice** | Production (Railway) | [rentverse-ai-service-production-295c.up.railway.app](https://rentverse-ai-service-production-295c.up.railway.app) |

---

## 1. Overview
RentVerse provides a blueprint for the next generation of secure property tech by blending advanced behavioral analytics, cryptographic trust models, and a rigorous 14-stage automated security pipeline.

### Core Capabilities
-   **🔐 Secure Authentication Architecture**: Multi-factor (MFA/OTP) login flows, Argon2 credential hashing, and Role-Based Access Control (RBAC).
-   **🛡️ Intelligent Behavioral Defense**: Real-time analysis of IP velocity, geographic context, and device fingerprinting to detect and block threat actors.
-   **📄 Cryptographic Lease Integrity**: Digital agreements with SHA-256 hashing and secure signature validation to prevent non-repudiation.
-   **🚨 Automated Threat Response**: Instant SMTP security alerts and automated account locking based on real-time risk scoring.
-   **🏗️ Enterprise-Grade DevSecOps**: A "Broken Build" pipeline policy enforcing SAST (CodeQL), secret scanning (Gitleaks), and container vulnerability checks (Trivy).

---

## 2. System Architecture
The platform operates on a **DevSecOps-driven Microservices Architecture**, designed for high resilience and automated threat response.

```mermaid
graph TD
    %% -- Actors --
    UserMobile((📱 Mobile Tenant))
    UserWeb((💻 Web Landlord))
    Admin((🛡️ SecOps Admin))
    Attacker((👾 Threat Actor))

    %% -- Edge Security Layer --
    subgraph "🛡️ Edge Security Layer"
        WAF[Cloudflare / WAF]
        RateLimit[Global Rate Limiter]
        LB[Nginx Load Balancer]
    end

    %% -- Application Layer --
    subgraph "🏗️ Backend Container Cluster"
        API[Node.js Express API v1]
        AuthMW[🔐 Auth Middleware]
        SecMW[🛡️ Security Monitor Module]
        
        %% Flow inside Backend
        API --> AuthMW
        AuthMW --> SecMW
    end

    %% -- Intelligence Layer --
    subgraph "🧠 Intelligence Microservice"
        AIService[Python FastAPI Service]
        MLModel[Scikit-Learn Model]
        
        AIService --> MLModel
    end

    %% -- Data Persistence Layer --
    subgraph "💾 Data Persistence"
        DB[(PostgreSQL 16)]
        Redis[(Redis Cache)]
        S3[Object Storage]
    end

    %% -- External Services --
    subgraph "☁️ External Integrations"
        SendGrid[📧 Email / SMTP]
        Maps[🗺️ Google Maps API]
    end

    %% -- Connections --
    UserMobile --> WAF
    UserWeb --> WAF
    Attacker -.-> WAF
    WAF --Filtered Traffic--> RateLimit
    RateLimit --> LB
    LB --> API
    Admin --> LB

    %% Service Ops
    SecMW --"Risk Score > 60"--> Utils[⛔ Block Request]
    SecMW --"Log Event"--> DB
    API --"Predict Price/Anomaly"--> AIService
    API --"Store Data"--> DB
    API --"Cache Session"--> Redis
    API --"Send Alert"--> SendGrid
    
    %% Styles
    style Attacker stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5
    style SecMW fill:#fee,stroke:#f00
    style AIService fill:#eef,stroke:#00f
    style DB fill:#efe,stroke:#0f0
```

---

## 3. Detailed Module Execution
Every module of the challenge was implemented with a focus on production-grade security and developer best practices.

### M1: Secure Login & Multi-Factor Authentication
-   **Identity Guard**: Optimized standard JWT issuance with short-lived access tokens and secure refresh mechanisms.
-   **MFA Integration**: Mandatory TOTP layer (Google Authenticator compat) via profile settings or enrollment during onboarding to mitigate credential stuffing.

### M2: Secure API Gateway & Validation
-   **Deep Sanitization**: Every API endpoint is protected by middleware that enforces strict schema validation and sanitizes inputs to prevent XSS and NoSQL injection.
-   **Edge Protection**: Helmet.js for security headers and a custom rate-limiting strategy that protects against brute-force while maintaining performance for genuine users.

### M3: Digital Agreement & Non-Repudiation
-   **Integrity Seal**: Upon signing, the backend generates a final PDF and calculates its SHA-256 hash.
-   **Audit Trail**: Hash is stored in the database alongside a record of the signer's IP address and timestamp, providing immutable proof.

### M4: Smart Notifications (Real-Time Threat Intelligence)
-   **Heuristic Engine**: Intercepts critical actions to calculate risk based on:
    -   **Impossible Travel**: Detecting logins from distant locations within impossible timeframes.
    -   **Device Fingerprinting**: Tracking unrecognized device hashes.
    -   **Failure Velocity**: Monitoring high rates of failed login attempts.
-   **Automated Response**: Risk score > 60 triggers an immediate 30-minute account lock and dispatches an automated SMTP security alert.

### M5: Activity Dashboard & SecOps
-   **Live Telemetry**: Real-time feed of all `SECURITY_EVENT` logs categorized by severity (SAFE, SUSPICIOUS, CRITICAL).
-   **Administrative Actions**: SecOps teams can manually override automated blocks or lock suspicious accounts directly from the dashboard.

### M6: Hardened CI/CD Pipeline
Enforced by **14 successful automated checks** to ensure no insecure code reaches production:
-   **CodeQL Analysis**: Advanced SAST for logic and security vulnerability detection.
-   **Secret Scanning**: Gitleaks scanning in every PR to ensure zero credential leaks.
-   **Container Auditing**: Trivy scans of the filesystem and Docker images for CVEs (CRITICAL/HIGH).

---

## 4. Testing the Security Heuristics
To verify the **A++ (Exceptional)** level of security implementation:

> [!TIP]
> **Brute Force Test**: Attempt to log in with an invalid password 6 times. 
> **Result**: The `SECURITY_EVENT` is logged as `CRITICAL`, and the account is automatically locked.

> [!TIP]
> **Impossible Travel Test**: Log in from your local machine, then immediately send a request from a foreign IP proxy. 
> **Result**: The system calculates a speed outlier (>800 km/h) and sends an immediate alert email.

---

## 5. Installation & Run Guide

### Quick Start (Docker - Recommended)
The entire stack can be launched using Docker Compose.

```bash
# 1. Clone the repository
git clone https://github.com/izwanGit/uitm-devops-challenge_TeamOne.git
cd uitm-devops-challenge_TeamOne

# 2. Set up Environment Variables
cp rentverse-backend/.env.example rentverse-backend/.env
cp rentverse-frontend/.env.example rentverse-frontend/.env
cp rentverse-ai-service/.env.example rentverse-ai-service/.env

# 3. Start Services
docker-compose up -d --build
```

Access the application:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:4000`
- **AI Service:** `http://localhost:8000`

---

## 6. Technical Deep Dives (Flow Diagrams)

### Advanced Security Login Flow
```mermaid
sequenceDiagram
    participant U as 👤 User
    participant API as 🛡️ API Gateway
    participant DB as 💾 Database
    participant AI as 🧠 Security Monitor (Mod 4)
    participant Mail as 📧 Email Service

    U->>API: POST /auth/login (Credentials)
    
    rect rgb(240, 248, 255)
        Note right of API: Step 1: Basic Auth
        API->>DB: Check Password Hash (Argon2)
        DB-->>API: Valid
    end
    
    rect rgb(255, 240, 245)
        Note right of API: Step 2: Risk Analysis
        API->>AI: Analyze Context (IP, Geo, Device)
        
        alt Risk Score > 60 (CRITICAL)
            AI-->>API: 🚫 BLOCK (Score: 85)
            API->>DB: Lock Account & Log Event
            API->>Mail: Send CRITICAL ALERT to User
            API-->>U: 403 Forbidden (Account Locked)
        else Risk Score < 60 (SAFE)
            AI-->>API: ✅ ALLOW
            API->>DB: Log Successful Login
            API-->>U: 200 OK (Issue JWT)
        end
    end
```

### Digital Agreement & Signing Process
```mermaid
sequenceDiagram
    participant T as 📱 Tenant
    participant L as 💻 Landlord
    participant API as ⚙️ Backend
    participant PDF as 📄 PDF Engine

    L->>API: Approve Lease Request
    API->>PDF: Generate Draft Contract (PDF)
    PDF-->>API: Return PDF Path
    API->>T: Notification "Lease Ready"
    
    T->>API: GET /agreements/preview
    T->>API: POST /agreements/sign (Base64 Signature)
    
    rect rgb(230, 255, 230)
        Note right of API: Integrity Seal
        API->>PDF: Embed Signature Image
        API->>API: Calculate SHA-256 Hash of Final PDF
        API->>DB: Store Hash + Timestamp + IP
    end
    
    API-->>T: 200 OK (Signed)
    API->>L: Email "Agreement Signed"
```

---

## 7. Data Design (Complete ERD)
```mermaid
erDiagram
    USERS ||--o{ PROPERTIES : "owns"
    USERS ||--o{ LEASES : "as tenant/landlord"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    USERS ||--o{ SECURITY_EVENTS : "associated with"

    PROPERTIES ||--o{ LEASES : "leased in"
    PROPERTIES ||--o{ PROPERTY_AMENITIES : "has"
    
    LEASES ||--o{ INVOICES : "generates"
    LEASES ||--o{ RENTAL_AGREEMENTS : "documented by"
    
    INVOICES ||--o{ PAYMENTS : "paid by"

    USERS {
        text id PK
        text email
        text name
        Role role
        boolean isActive
    }

    PROPERTIES {
        text id PK
        text title
        numeric price
        ListingStatus status
        text ownerId FK
    }

    LEASES {
        text id PK
        timestamp startDate
        timestamp endDate
        text propertyId FK
        text tenantId FK
    }
```

---

## 8. Development Team (TeamOne)
- **Architecture**: DevSecOps Lead
- **Frontend**: UX/React Specialist
- **Backend**: Security & API Specialist
- **AI/ML**: Python Microservice Specialist

*Developed for the UiTM Mobile SecOps Challenge 2025.*


