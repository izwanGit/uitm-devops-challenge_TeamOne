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

The RentVerse platform is built on a robust, secure microservices-inspired architecture designed for high availability and threat resilience.

### High-Level Architecture Diagram
```mermaid
graph TD
    %% Users
    UserMobile((📱 Mobile User))
    UserWeb((💻 Web User/Admin))
    Attacker((👾 Threat Actor))

    %% Edge / Gateway Layer
    subgraph "🛡️ Secure Gateway Layer"
        WAF[Web Application Firewall / Global Limit]
        LB[Load Balancer / Nginx]
    end

    %% Application Layer
    subgraph "🏗️ Backend Services (Dockerized)"
        API[Node.js API Service]
        Auth[Auth Middleware]
        Security[🛡️ Security Monitor]
        
        API --> Auth
        Auth --> Security
        Security -- "Risk Score > 60" --> BlockAccess[⛔ Block & Lock]
    end

    %% AI Layer
    subgraph "🧠 Intelligence Layer"
        AIService[Python AI Service]
        Model[Anomaly & Price Model]
        AIService --> Model
    end

    %% Data Layer
    subgraph "💾 Data Persistence"
        DB[(PostgreSQL Database)]
        Redis[(Redis Cache)]
    end

    %% External Services
    subgraph "☁️ External Services"
        SendGrid[📧 Email Service]
    end

    %% Flows
    UserMobile --> WAF
    UserWeb --> WAF
    Attacker -.-> WAF
    WAF -- "Filtered Traffic" --> LB
    LB --> API
    
    API --> DB
    API -- "Async Logic" --> AIService
    API -- "Critical Alerts" --> SendGrid
    
    Security -- "Log Event" --> DB
    
    style Attacker stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5
    style Security fill:#fee,stroke:#f00
    style AIService fill:#eef,stroke:#00f
    style DB fill:#efe,stroke:#0f0
```

### Component Breakdown
1.  **Frontend Clients**:
    *   **Mobile App (Ionic/Capacitor)**: Main interface for tenants and digital agreements.
    *   **Web Dashboard (Next.js)**: Admin interface for security monitoring (`Module 5`) and property management.
2.  **Secure API Gateway (`Module 2`)**:
    *   Implements **Rate Limiting** to prevent DDoS.
    *   Validates **JWT Tokens** for all protected routes.
    *   Enforces **HTTPS** and secure headers (Helmet).
3.  **Backend Core**:
    *   **Node.js/Express**: Handles business logic.
    *   **Security Monitor (`Module 4`)**: Intercepts requests to calculate risk scores based on IP, geolocation, and device fingerprint.
4.  **Intelligence Layer (`Bonus`)**:
    *   **Python AI Service**: Runs independent of the main API.
    *   **Functions**: Predicts rental prices and detects anomaly patterns in user behavior.
5.  **Data Layer**:
    *   **PostgreSQL**: Stores relational data (Users, Properties, SecurityEvents).
    *   **Prisma ORM**: Ensures type-safe database interactions and prevents SQL injection.

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

## 9. Data Design (ERD)
The database schema manages Users, Properties, and Agreements.

```mermaid
erDiagram
    User ||--o{ Property : owns
    User ||--o{ Lease : signs
    Property ||--o{ Lease : has
    Lease ||--|| RentalAgreement : generates
    User ||--o{ SecurityEvent : triggers

    User {
        string id
        string email
        string role "USER, ADMIN"
        boolean mfaEnabled
    }

    Property {
        string id
        string title
        decimal price
        boolean approved
    }

    SecurityEvent {
        string id
        int riskScore
        string severity
        string reason
    }
```

## 10. Request / Login Flow Diagram
A typical secure login flow with MFA and Risk Analysis:

```mermaid
sequenceDiagram
    participant User
    participant App
    participant API
    participant DB
    participant AI as SecurityAI

    User->>App: Enter Credentials
    App->>API: POST /auth/login
    API->>DB: Verify Password
    
    rect rgb(255, 230, 230)
        Note over API, AI: 🛡️ Module 4: Risk Check
        API->>AI: Analyze Context (IP, Device)
        AI-->>API: Risk Score (0-100)
    end
    
    alt Risk < 60
        API-->>App: 200 OK (JWT Token)
    else Risk > 60
        API->>DB: Log Critical Event
        API-->>App: 403 Forbidden (Account Locked)
    end
```

## 11. System User Journey Flowchart
This flowchart visualizes the complete interaction lifecycle for all user roles within RentVerse.

```mermaid
flowchart TD
    %% Nodes
    Start((🟢 Start))
    Auth{🔐 Auth & MFA}
    RoleCheck{👤 Check Role}
    
    %% Tenant Path
    subgraph "Tenant Journey"
        Search[🔍 Search Properties]
        View[📱 View Details]
        AI_Pred[🤖 AI Price Prediction]
        Book[📅 Request Booking]
        WaitApproval[⏳ Wait for Approval]
        Sign[✍️ Digital Signature]
        Pay[💳 Payment]
        D_Active[🏠 Active Tenancy]
    end
    
    %% Landlord Path
    subgraph "Landlord Journey"
        AddProp[➕ List Property]
        AI_Class[🤖 AI Classification]
        WaitAdmin[⏳ Wait Admin Review]
        Manage[📋 Manage Leases]
        ApproveBooking[✅ Approve Booking]
    end
    
    %% Admin Path
    subgraph "Admin / Security Ops"
        Dashboard[🖥️ Security Dashboard]
        Alerts[🚨 Handle Critical Alerts]
        ReviewProp[📝 Review Listings]
    end
    
    %% Security Layer (Visualized as background check)
    SecMonitor((🛡️ Security Monitor))
    
    %% Connections
    Start --> Auth
    Auth -->|Success| RoleCheck
    Auth -.->|Fail x5| SecMonitor
    SecMonitor -.->|Critical Risk| Alerts
    
    RoleCheck -->|Tenant| Search
    RoleCheck -->|Landlord| AddProp
    RoleCheck -->|Admin| Dashboard
    
    %% Tenant Details
    Search --> View --> AI_Pred --> Book
    Book --> WaitApproval
    ApproveBooking -->|Approved| WaitApproval
    WaitApproval --> Sign --> Pay --> D_Active
    
    %% Landlord Details
    AddProp --> AI_Class --> WaitAdmin
    ReviewProp -->|Approved| WaitAdmin
    WaitAdmin --> Manage --> ApproveBooking
    
    %% Admin Details
    Dashboard --> Alerts
    Dashboard --> ReviewProp
    
    %% Click Events
    click Auth "Validates JWT & OTP"
    click SecMonitor "Module 4: Anomaly Detection"
    click Sign "Module 3: Secure Agreement"
```

## 12. Limitations & Future Improvements
*   **Limitation:** AI Model is currently trained on synthetic data for demonstration.
*   **Improvement:** Implement Biometric Authentication for mobile app.
*   **Improvement:** Add Blockchain implementation for immutable agreement logs.

