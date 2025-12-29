# 🛡️ Technical Implementation: Core Modules (M1 - M6)

This document provides a deep technical breakdown of the engineering behind the 6 Core Modules of the RentVerse SecOps Platform.

---

### M1: Secure Registration & Login (Identity & Access Management)
*   **Password Security**:
    *   **Algorithm**: We use **BCrypt** (`bcryptjs`) for password hashing.
    *   **Salt Rounds**: Configured at **12 rounds**, balancing security (0.3s hash time) and system performance. This protects against brute-force and offline dictionary attacks.
*   **Multi-Factor Authentication (MFA)**:
    *   **Standard**: Implemented using **TOTP** (Time-based One-Time Password) via the `otplib` library.
    *   **Flow**: At registration, a unique 32-character secret is generated, encrypted, and stored. We display this as a **QR Code** for the user to scan into apps like Google Authenticator.
*   **Session Management**:
    *   **JWT Architecture**: We use JSON Web Tokens with a three-part structure (Header, Payload, Signature).
    *   **Payload Protection**: Only non-sensitive data (UUID, Email, Role) is stored in the payload.
    *   **Expiration**: Tokens have a **1-hour "Short-Lived" duration** to minimize the window for credential reuse if intercepted.

### M2: API Gateway & Request Validation (The Perimeter Defense)
*   **Security Middleware**:
    *   **Helmet.js**: Configured to set 11+ security headers, including `Content-Security-Policy` to prevent XSS and `X-Frame-Options` to prevent Clickjacking.
    *   **CORS**: Strictly restricted to our Vercel frontend domain to prevent unauthorized cross-origin requests.
*   **Traffic Scrubbing**:
    *   **Rate Limiting**: Implemented `express-rate-limit` allowing maximum 100 requests per 15 minutes per IP for general routes, and **5 attempts per 15 minutes** for the `/login` route to thwart brute-force.
*   **Data Integrity (Joi)**:
    *   **Schema Enforcement**: Every incoming `POST` and `PUT` request is funneled through a **Joi validation middleware**.
    *   **Constraint Examples**: Emails must match standard regex patterns, names are capped at 50 characters, and prices must be positive integers. This stops "SQL Injection" and "Buffer Overflow" attempts before they hit the database.

### M3: Digital Rental Agreements (Cryptographic Non-Repudiation)
*   **Server-Side Rendering (SSR)**:
    *   **Puppeteer Engine**: We bypass client-side PDF generation (which is easily spoofed). Instead, the backend launches a headless Chrome instance to render the agreement as an immutable document.
*   **The Signature Bridge**:
    *   **Canvas Capture**: The frontend captures the user's signature as a **Base64 string**. This is transmitted over an encrypted HTTPS channel to our backend.
*   **Cryptographic Sealing**:
    *   **SHA-256 Hashing**: Immediately after generation, the system runs `crypto.createHash('sha256')` on the PDF buffer.
    *   **Persistence**: This unique "Digital Fingerprint" is stored in the `RentalAgreement` table.
    *   **Verification**: Our `verifyPdf` service can check any document against its stored hash. If even a single metadata byte is changed, the verification will fail, ensuring the document's legal integrity.

### M4: Smart SecOps Notifications (Alert Telemetry)
*   **Slack Orchestration**:
    *   **Webhook Service**: Our `slack.service.js` converts raw error logs into **Rich Text Cards**. 
    *   **Severity Levels**: We categorize alerts into `INFO` (Green), `WARNING` (Yellow), and `CRITICAL/FIRE` (Red).
*   **Email (SMTP) Alerts**:
    *   **SendGrid Integration**: Used for high-priority user alerts (e.g., "Login from New Device").
    *   **Template Injection**: Dynamically injects user data into pre-built, responsive HTML templates.
*   **Event Debouncing**:
    *   To prevent "Alert Fatigue," the system has logic to suppress duplicate notifications within a 5-minute window if the same threat is detected repeatedly.

### M5: Security & Activity Dashboard (Human-in-the-Loop)
*   **Audit Logging Architecture**:
    *   **Prisma Events**: Every sensitive database transaction triggers an entry in the `AuditLog` table, capturing `userId`, `action`, `ipAddress`, and `userAgent`.
*   **Unified Monitoring UI**:
    *   **Live Feed**: Developed in Next.js using **Real-time API Polling** to show the latest security events.
    *   **Interactive Controls**: Admins can view the specific **Risk Reasons** (e.g., "Incorrect Fingerprint") and have the authority to manually lock/unlock accounts based on the forensic data provided.
*   **RBAC (Role Based Access Control)**: Strictly ensures that only users with the `ADMIN` or `SUPERADMIN` flag can view these logs or access the security controls.

### M6: Secured CI/CD Pipeline (Operational Security)
*   **14-Stage Workflow (GitHub Actions)**:
    *   **Static Scanning**: Runs `npm run lint` and `npm test` to ensure code quality.
    *   **Dependency Audit**: Runs `npm audit` to check for packages with known security vulnerabilities.
*   **Environment Parity**:
    *   **Dockerization**: Both frontend and backend are containerized, ensuring that the "Defense Environment" is identical during development, testing, and production.
*   **Multi-Cloud Deployment**:
    *   **Vercel**: Hosts the static frontend with built-in DDoS protection.
    *   **Railway**: Hosts the Node.js API and the PostgreSQL database, providing encrypted-at-rest storage and isolated networking.
