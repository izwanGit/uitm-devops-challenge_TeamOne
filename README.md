# UiTM Mobile SecOps 21Days Challenge: RentVerse Team

**Team Name:** TeamOne
**Challenge Theme:** Mobile Defense and Intelligence: Build Fast, Defend Smarter

## 1. Overview
RentVerse is a secure, intelligent mobile-first property rental platform developed for the UiTM Mobile SecOps Challenge. It integrates advanced security measures, AI-driven threat intelligence, and a seamless user experience to demonstrate DevSecOps excellence.

### Core Features
- **Secure Authentication:** MFA/OTP login, Role-Based Access Control (RBAC), and JWT session management.
- **AI-Powered Defense:** Real-time anomaly detection, risk scoring, and automated account locking for suspicious activities.
- **Secure Agreements:** Digital lease agreements with secure signature validation and audit trails.
- **Smart Alerts:** Instant email notifications for critical security events.
- **DevSecOps Pipeline:** Automated SAST, secret scanning (Gitleaks), vulnerability scanning (Trivy), and secure container deployment.

## 2. System Architecture
The RentVerse platform operates on a **DevSecOps-driven Microservices-inspired Architecture**, designed for high resilience, security depth, and automated threat response.

### High-Level Architecture Diagram
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

### Component Breakdown
1.  **Secure Edge Layer**:
    *   **WAF & Rate Limiter**: First line of defense against DDoS and brute-force (max 100 req/15min).
    *   **SSL/TLS**: Mandatory encryptions for all transit data.
2.  **Backend Core (Node.js/Express)**:
    *   **Security Monitor (Module 4)**: Real-time request analysis (IP, Headers, Device).
    *   **Auth Module**: Handles JWT issuance, Refresh Tokens, and Role Verification.
3.  **Intelligence Unit (Python/FastAPI)**:
    *   Decoupled service for heavy computational tasks (Price Prediction & Anomaly Classification).
4.  **Data Layer**:
    *   **PostgreSQL**: Strictly typed relational schema via Prisma ORM.
    *   **Redis**: High-speed session caching and key-value storage for transient tokens.

## 3. Installation & Run Guide

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python (v3.10+)
- Bun (optional, for faster frontend builds)

### Quick Start (Docker - Recommended)
The entire stack can be launched using Docker Compose.

```bash
# 1. Clone the repository
git clone https://github.com/izwanGit/uitm-devops-challenge_TeamOne.git
cd uitm-devops-challenge_TeamOne

# 2. Set up Environment Variables
# Call the setup script (if available) or copy example envs
cp rentverse-backend/.env.example rentverse-backend/.env
cp rentverse-frontend/.env.example rentverse-frontend/.env
cp rentverse-ai-service/.env.example rentverse-ai-service/.env

# 3. Start Services
docker-compose up -d --build
```

Access the application:
- **Frontend (Web/Mobile):** `http://localhost:3000`
- **Backend API:** `http://localhost:4000`
- **AI Service:** `http://localhost:8000`

### Manual Development Setup

#### Backend
```bash
cd rentverse-backend
pnpm install
pnpm prisma generate
pnpm dev
```

#### Frontend
```bash
cd rentverse-frontend
bun install
bun dev
```

#### AI Service
```bash
cd rentverse-ai-service
poetry install
poetry run uvicorn rentverse.main:app --reload
```

## 4. Mobile Build (APK)
To build the Android APK for submission:

```bash
cd rentverse-frontend
pnpm build
npx cap sync
npx cap open android
# Build APK via Android Studio
```

## 5. Module Implementation Checklist (Audit)

| Module | Status | Description |
|--------|--------|-------------|
| **M1: Secure Login & MFA** | ✅ Complete | implemented with JWT & OTP |
| **M2: Secure API Gateway** | ✅ Complete | Rate-limiting, Helmet, Input Validation |
| **M3: Digital Agreement** | ✅ Complete | Secure PDF generation & signatures |
| **M4: Smart Notifications** | ✅ Complete | Email alerts for critical risks |
| **M5: Activity Dashboard** | ✅ Complete | Admin view for security events |
| **M6: CI/CD Security** | ✅ Complete | GitHub Actions with CodeQL, Trivy, Gitleaks |

## 6. Special Features (Bonus)
- **Threat Intelligence:** AI analyzes user behavior (IP, speed, device) to calculate risk scores.
- **Zero-Trust Monitoring:** Continuous verification of session integrity.
- **Automated Defense:** Accounts are auto-locked if Risk Score > 60.


## 5. User Roles & Access Control
The platform implements strict **Role-Based Access Control (RBAC)**:

| Role | Access Level | Description |
|------|--------------|-------------|
| **User (Tenant)** | Basic | Can search properties, book leases, sign agreements, and view own profile. |
| **Landlord** | Advanced | Can list properties, approve/reject bookings, and manage own leases. |
| **Admin** | Superuser | Full access to **Security Dashboard**, User Management, and Property Approvals. |

*Note: Roles are stored in the JWT payload and verified by middleware.*

## 6. How to Trigger Security Alerts (Testing Guide)
To verify the **Module 4 (Smart Notification)** & **Module 5 (Dashboard)** features:

1.  **Simulate Failed Logins:**
    *   Attempt to login with an invalid password 5 times in a row.
    *   **Result:** Account is temporarily locked.
2.  **Simulate "Impossible Travel" (Dev Mode):**
    *   Use Postman to send a login request with headers: `X-Forwarded-For: 1.2.3.4`.
    *   Immediately send another request with: `X-Forwarded-For: 200.200.200.200` (Different Country geo).
    *   **Result:** Risk Score > 60 triggers an **Email Alert** and locks the account.
3.  **Check Admin Dashboard:**
    *   Login as Admin -> Go to **Security Logs**.
    *   Observe the "CRITICAL" event logged with IP and Reason.

## 7. Admin Dashboard Overview
The Admin Dashboard (`/admin/dashboard`) provides real-time visibility into system health:

*   **Security Events:** Live feed of login attempts, failures, and blocks.
*   **Property Approvals:** Queue of properties requiring manual or AI review.
*   **User Management:** List of active users with "Lock/Unlock" controls.

## 8. Environment Variables Reference
Ensure these are set in your `.env` file (see `.env.example`):

```bash
# Security
JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN="7d"

# APIs
DATABASE_URL="postgresql://user:pass@localhost:5432/rentverse"
AI_SERVICE_URL="http://localhost:8000"

# Notifications
SMTP_HOST="smtp.sendgrid.net"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-key"
```

## 9. Data Design (Complete ERD)
This Entity Relationship Diagram represents the full data schema (`prisma.schema`), highlighting the relationships between core entities, security logs, and financial records.

```mermaid
erDiagram
    %% CORE USERS
    User ||--o{ Lease : "As Tenant"
    User ||--o{ Lease : "As Landlord"
    User ||--o{ Property : "Owns"
    User ||--o{ SecurityEvent : "Triggers"
    User ||--o{ AuditLog : "Triggers"
    User ||--o{ Payment : "Pays"
    
    %% PROPERTIES
    Property ||--o{ Lease : "Has"
    Property ||--o{ PropertyView : "Viewed By"
    Property ||--o{ PropertyRating : "Rated By"
    Property ||--o{ Photo : "Contains"
    Property ||--o{ ListingApproval : "Requires"
    Property }|--|{ Amenity : "Has"
    
    %% FINANCIALS
    Lease ||--o{ Invoice : "Generates"
    Lease ||--|| RentalAgreement : "Signed As"
    Invoice ||--o{ Payment : "Settled By"
    
    %% AI & ANALYTICS
    Property ||--o{ PricePrediction : "Predicted"

    %% ENTITY DETAILS
    User {
        uuid id PK
        string email
        string password_hash
        enum role "USER, ADMIN"
        boolean mfaEnabled
        string mfaSecret
        int failedLoginAttempts
        datetime lockoutUntil
    }

    Property {
        uuid id PK
        string title
        decimal price
        string status "PENDING, APPROVED"
        float aiConfidenceScore
        geometry location
    }

    SecurityEvent {
        uuid id PK
        string eventType "LOGIN, SIGN_AGREEMENT"
        int riskScore "0-100"
        string severity "CRITICAL, WARNING"
        json metadata
    }
    
    RentalAgreement {
        uuid id PK
        string pdfUrl
        string originalHash
        string finalHash
        boolean isSigned
    }
```

## 10. Technical Deep Dives (Flow Diagrams)

### A. Advanced Security Login Flow
This diagram illustrates **Module 1 (MFA)** and **Module 4 (Risk Analysis)** working in tandem to prevent unauthorized access.

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

### B. Property Listing & AI Pipeline
Visualizing how **Module 2 (API)** and the **AI Service (Bonus)** interact to classify properties and automate approvals.

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> PendingReview: User Submits Listing
    
    state "AI Analysis Pipeline" as AI {
        PendingReview --> ExtractFeatures: API Trigger
        ExtractFeatures --> PredictPrice: Call Python Service
        PredictPrice --> ClassifyRisk: Detect Anomalies
    }
    
    ClassifyRisk --> CheckPolicy: Risk Score & Price Deviation
    
    state CheckPolicy <<choice>>
    CheckPolicy --> AutoApproved: High Confidence & Safe
    CheckPolicy --> ManualReview: Low Confidence / Outlier
    
    ManualReview --> AdminAction: Admin Dashboard
    AdminAction --> Approved: Admin Accepts
    AdminAction --> Rejected: Admin Denies
    
    AutoApproved --> Approved
    
    Approved --> [*]: Live on Marketplace
```

### C. Digital Agreement & Signing Process
The flow for **Module 3 (Digital Agreements)** ensuring non-repudiation and integrity.

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

## 11. Limitations & Future Improvements
*   **Limitation:** The AI Model currently uses synthetic training data for price prediction; real-world accuracy may vary.
*   **Improvement:** Implement **Biometric Authentication (FaceID)** for the mobile app to replace PINs.
*   **Improvement:** Integrate a **Blockchain Ledger (Hyperledger)** to store Agreement Hashes for immutable legal proof.


