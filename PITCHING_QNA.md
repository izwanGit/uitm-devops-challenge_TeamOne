# ⚔️ RentVerse Q&A Battleground: 15 Toughest Questions

This document prepares you for the technical grilling by judges. These answers are designed to showcase depth, security-first thinking, and industry-standard terminology.

---

### 1. "Why did you choose a Microservices architecture for a prototype?"
**Answer**: "Scaling and isolation. By separating the **AI Service (FastAPI)** from the **Core Backend (Express)**, we ensure that a heavy ML load doesn't crash the booking system. More importantly, it reduces our attack surface—each service can have its own distinct security policy and firewall rules."

### 2. "How do you ensure the Digital Agreements (M3) are actually legally binding?"
**Answer**: "We implement **Non-Repudiation**. When a tenant signs, we don't just save an image; we generate a SHA-256 hash of the final PDF and store it in our immutable audit trail. Any tampering with even one pixel of that PDF would change the hash, immediately failing our `verifyPdf` check."

### 3. "Explain your 'Impossible Travel' logic (B3). How does it actually work?"
**Answer**: "We use the **Haversine Formula** to calculate the great-circle distance between login coordinates. If a user logs in from Kuala Lumpur and then from Jakarta 5 minutes later, our system calculates that the required velocity exceeds 12,000 km/h. It then autonomously triggers an `ACCOUNT_AUTO_LOCKED` event."

### 4. "Your Zero-Trust Fingerprinting (B2) sounds fancy. How do you prevent 'Replay Attacks'?"
**Answer**: "Every session token is bound to a unique **Device Fingerprint** (hash of hardware + browser headers). Even if an attacker steals the JWT (Session Hijacking), they cannot use it on a different machine because the fingerprint mismatch will trigger a critical security alert and invalidate the session instantly."

### 5. "Why use BCrypt over simpler hashing like MD5 or SHA-1?"
**Answer**: "MD5 and SHA-1 are cryptographically broken and vulnerable to collision attacks and 'Rainbow Tables'. **BCrypt** is specifically designed for passwords; it uses a 'key-stretching' algorithm and a configurable cost factor (12 rounds) to make brute-force attacks computationally expensive even for modern hardware."

### 6. "How does your AI Service (B1) detect 'Fake Listings' or price scams?"
**Answer**: "Our FastAPI service uses a regression model trained on Malaysian rental datasets. If a landlord lists a 3-bedroom luxury condo for RM 500 when the predicted market value is RM 2,500, the system flags it as 'High Risk' and requires manual admin approval before it goes public."

### 7. "What happens if your Slack Webhook (M4) is leaked? How is it secured?"
**Answer**: "In production, we use **Environment Variable Injection** (via Railway/Vercel secrets). The webhook is never hardcoded. Furthermore, our `slack.service.js` is designed to only accept internally generated events, and we implement rate-limiting on outgoing notifications to prevent 'Alert Fatigue' or logging noise."

### 8. "Why use Puppeteer for PDF generation instead of client-side libraries?"
**Answer**: "Client-side PDF generation is easily manipulated by the user's browser inspector. By using **Puppeteer on the Server**, we ensure a 'Gold Master' copy of the agreement that is generated in a controlled, isolated environment, which we then cryptographically seal immediately."

### 9. "Can you walk us through your CI/CD Pipeline (M6)? What is the most critical stage?"
**Answer**: "The most critical stage is the **Security Scanning Block (B4)**. We run **Gitleaks** to catch accidental secret commits, **Trivy** to scan for OS vulnerabilities in our Docker images, and **CodeQL** for semantic code analysis. If any of these fail, the build is killed before it ever reaches production."

### 10. "Is your system vulnerable to SQL Injection? How do you defend it?"
**Answer**: "No. We use **Prisma ORM**, which inherently uses 'Parameterized Queries'. This ensures that user input is always treated as data, never as executable code. We also add a second layer of defense using **Validator Middleware** to strip malicious characters at the API entry point."

### 11. "Explain your MFA strategy. Is it 'True' MFA?"
**Answer**: "Yes. We use **TOTP (Time-based One-Time Password)**. It complies with the 'Something you know' (Password) and 'Something you have' (Authenticator App) principle. The secret key is encrypted in our database and never leaves the server after the initial setup."

### 12. "What is 'Haversine' and why is it in a rental app?"
**Answer**: "It's the mathematical backbone of our **Threat Intelligence**. It allows us to calculate distances on a sphere (the Earth). We use it to detect anomalies in login locations, which is a key indicator of stolen credentials or shared accounts."

### 13. "How do you handle 'False Positives' in your autonomous locking system?"
**Answer**: "Security vs Usability is a balance. When a user is locked, our **Admin Dashboard (M5)** provides a 'One-Click Unlock' for admins. We also send an email to the user explaining the lockout, allowing them to verify their identity through a secure secondary channel."

### 14. "Why did you use Next.js 15 for the frontend?"
**Answer**: "For its **Server Components** and **Security**. Next.js 15 allows us to keep sensitive logic on the server while rendering a high-performance, SEO-friendly interface. It also has built-in protection against common web vulnerabilities like XSS and CSRF."

### 15. "If you had 3 more months, what security feature would you add next?"
**Answer**: "I would implement **Biometric Attestation** via WebAuthn, moving towards a completely passwordless login system. I would also integrate a dedicated **HSM (Hardware Security Module)** for signing the rental agreements to reach bank-level security compliance."

### 16. "How do you protect your Session (JWT) from being stolen via XSS?"
**Answer**: "We implement **HTTP-Only** and **Secure** cookies for session management where possible. This prevents JavaScript from accessing the token. We also set a strict **Content Security Policy (CSP)** to block malicious scripts from executing in the first place."

### 17. "Why use Joi validation (M2) if you already have Prisma types?"
**Answer**: "This is part of our **Defense in Depth** strategy. Prisma catches errors at the database layer, but Joi catches them at the 'Edge' (API entry point). This prevents malformed data from ever consuming server resources or reaching our core logic, stopping potential ReDoS or injection attacks early."

### 18. "If the Signed PDF is lost on the server, how does the tenant recover it?"
**Answer**: "We implemented a **Graceful Fallback Mechanism**. If the signed file is missing (e.g., server wipe), the system automatically falls back to serving the raw draft template from our `originalPdfUrl` storage. The user never sees a 404 error, maintaining system availability."

### 19. "How does the Admin Dashboard (M5) distinguish between a 'real' login and a 'fingerprint spoof'?"
**Answer**: "Our `securityMonitor` middleware calculates a hash of the device's unique characteristics. If the JWT is valid but the **Fingerprint Hash** changes mid-session, we flag it as an `IDENTITY_MISMATCH`. The dashboard then marks this event as 'Critical', indicating a likely stolen session token."

### 20. "What is the benefit of using Docker (M6) for a SecOps project?"
**Answer**: "Isolation. Every component—the Backend, Frontend, and AI Service—runs in its own **Containerized Sandbox**. This ensures that even if one service is compromised, the attacker is trapped inside the container and cannot easily pivot to the host OS or other services."

### 21. "Does your AI Service (B1) learn from new data live in production?"
**Answer**: "For this prototype, the model is **Pre-Trained** to ensure stability. However, the architecture supports 'Active Learning'—we log every prediction into our `price_predictions` table, which can be used as a fresh dataset to re-train and improve the model's accuracy every week."

### 22. "Can a user bypass 'Impossible Travel' (B3) by using a VPN?"
**Answer**: "While a VPN masks the IP, we also track **Time-Distance Delta**. If a user logs in from an 'Unknown VPN' and their previous session was a 'Real Residential IP' half a world away just minutes prior, the risk score still spikes. We don't just trust the IP geo; we trust the behavioral pattern."

### 23. "How do you ensure your Slack Webhooks (M4) don't get flooded during a DDoS?"
**Answer**: "We use an **Alert Debouncer**. Our `alert.service.js` is designed to group similar security events. Instead of sending 1,000 Slack pings for a brute-force attack, it sends one summary alert and continues to update the Audit Log silently to prevent 'Notification Denial of Service'."

### 24. "How do you handle Malaysian PDPA (Privacy) compliance with all this logging?"
**Answer**: "We strictly follow the **Principle of Minimality**. We only log what is necessary for security (IP, Fingerprint, Action). We don't store plain-text passwords or sensitive personal data in the audit logs. All stored security telemetry is strictly for forensic use and has a set retention policy."

### 25. "Explain your 'Digital Signature' logic again. Is it just an image?"
**Answer**: "No. The signature image is just the visual anchor. The actual security comes from the **Cryptographic Binding**. We take the bytes of the signed PDF, run them through a hashing algorithm, and store that unique 'fingerprint' in the DB. If one comma is added to that PDF later, our verification service will reject it as 'Tampered'."

