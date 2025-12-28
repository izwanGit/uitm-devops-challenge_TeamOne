# 🏆 THE RENTVERSE MASTER PITCHING MANUAL (The "Winning" Edition)
**Mission**: Win the UiTM Mobile SecOps 21Days Challenge (RM 4,000 Prize)
**Strategy**: "Shock and Awe" - Overwhelm with quality, speed, and deep security.
**Duration**: 10 Minutes Setup + 10 Minutes Demo + 20 Minutes Q&A
**Target Audience**: SecOps Professionals, Industry Judges, Lecturers.

---

## 🛑 PART 1: THE WAR ROOM (PRE-FLIGHT CHECKLIST)

**Mental State**: You are a CTO presenting to investors. Confident. Precise. No "student" vibes.

### 1.1 Hardware & Environment
- [ ] **Laptop**: Charged to 100%. Connected to **Personal Hotspot** (The venue WiFi kills demos).
- [ ] **Phone (Android)**: Connected to Laptop via USB.
- [ ] **Screen Mirroring**: Launch `scrcpy` or QuickTime Player (New Movie Recording -> Select Phone).
- [ ] **Notifications**: 
    -   **Laptop**: Focus Mode ON (Do Not Disturb).
    -   **Phone**: Volume MAX (For the important Slack "Ping" sound).
- [ ] **Resolution**: Set Laptop to `1920x1080` (Safe for projectors).

### 1.2 "The Stage" (Browser Tabs Configuration)
Open these EXACT tabs in order. Do not fumble looking for links.

**Window 1 (The Dashboard - "The Defense"):**
1.  **Tab 1 - Admin Dashboard**: `https://uitm-devops-challengeteamone-production.up.railway.app/admin/dashboard`
    *   *Action*: Log in as `admin@rentverse.com`. Filter to "All Events".
2.  **Tab 2 - Slack Web**: `https://app.slack.com/client/...`
    *   *Action*: Open channel `#secops-alerts`. Scroll to bottom.
    *   *Why*: Backup visual if popups don't show on projector.

**Window 2 (The Proof - "The Engineering"):**
1.  **Tab 1 - GitHub Actions**: `https://github.com/izwanGit/uitm-devops-challenge_TeamOne/actions`
    *   *Action*: Open the latest `main` workflow. Expand the job to show "14 checks passed".
2.  **Tab 2 - Gisleaks/Trivy Report**: (Optional screenshot or log file)
3.  **Tab 3 - Vercel Dashboard**: (Show the "Production" tag).

**Window 3 (The Demo - "The User"):**
1.  **Tab 1 - Landing Page**: `https://uitm-devops-challenge-team-one.vercel.app`
    *   *Note*: Keep this as backup if the Mobile App mirroring lags.

### 1.3 VS Code Setup (The "Under the Hood" View)
Have these files open in tabs for the "Technical Execution" score.
1.  `ci.yml` (The Pipeline).
2.  `securityMonitor.js` (The Threat Logic).
3.  `haversine.js` (The Impossible Travel Math).
4.  `deviceFingerprint.js` (The Zero Trust Logic).

---

## 📊 PART 2: THE SLIDE DECK (CONTENT & SCRIPT)

**Design Note**: Keep slides dark mode (SecOps vibe). Clean typography. No walls of text.

### Slide 1: Title Card
*   **Visual**: Big RentVerse Logo. Subtitle: "Mobile Defense & Intelligence".
*   **Footer**: "Team One | UiTM SecOps Challenge 2025".
*   **Script**: "Good afternoon judges. We are Team One. The challenge was to build a mobile prototype. We went further. We built a military-grade rental ecosystem."

### Slide 2: The Logic (Problem vs Solution)
*   **Visual**:
    *   **Left (The Problem)**: 🚩 Fake Listings. 🚩 Scams. 🚩 Weak Passwords.
    *   **Right (The Solution - RentVerse)**: 🛡️ AI Verification. 🛡️ Zero-Trust Auth. 🛡️ Legal Non-Repudiation.
*   **Script**: "Malaysian rental markets are plagued by scams and data breaches. Traditional apps use simple passwords—those are dead. RentVerse introduces a Zero-Trust architecture where every login, listing, and lease is cryptographically verified."

### Slide 3: The Architecture (Microservices)
*   **Visual**: A clean diagram showing:
    *   **Frontend**: Next.js 15 (Vercel) + Capacitor (Android).
    *   **Backend**: Node.js Express (Railway) + PostgreSQL.
    *   **Intelligence**: Python FastAPI (AI Service).
    *   **Security Layer**: WAF -> Rate Limit -> Auth Middleware.
*   **Script**: "We didn't just build a monolith. We engineered a scalable Microservices architecture. Our Node.js core handles business logic, while a dedicated Python FastAPI service runs our ML models for fraud detection. All protected by a custom Security Middleware."

### Slide 4: Core Module Compliance (M1 - M6)
**Visual**: A Checklist Table (Split Screen).
*   **Left Column (Authentication)**:
    *   ✅ **M1: Secure Login** (MFA + BCrypt Hashing).
    *   ✅ **M2: API Gateway** (Helmet + Joi Validation).
    *   ✅ **M3: Digital Agreements** (SHA-256 Non-Repudiation).
*   **Right Column (Operations)**:
    *   ✅ **M4: Smart Notifications** (Slack + SMTP).
    *   ✅ **M5: Activity Dashboard** (RBAC Admin Panel).
    *   ✅ **M6: CI/CD Pipeline** (14-Stage Automation).

**Speaker Notes**:
"We didn't skip a single requirement. We delivered all 6 Core Modules.
1.  **M1 & M2**: Start with military-grade Identity and Validation.
2.  **M3**: Moves to Legal Tech with cryptographic lease signing.
3.  **M4 & M5**: Gives Admins real-time eyes on the threat landscape.
4.  **M6**: Ensures every line of code is scanned before deployment."

### Slide 5: The Innovation Pool (Bonus B1 - B4)
**Visual**: A Dark Card with Neon text "100% BONUS COMPLETION".
*   ✅ **B1: Threat Intelligence** (AI Price Prediction).
*   ✅ **B2: Zero-Trust Logic** (Device Fingerprinting).
*   ✅ **B3: Adaptive Defense** (Auto-Locking Mechanisms).
*   ✅ **B4: Automated Security** (CodeQL + Trivy Scans).

**Speaker Notes**:
"But we didn't stop at the requirements. We cleaned out the entire Innovation Pool.
*   **Threat Intel**: We use AI to predict scam prices.
*   **Zero-Trust**: We fingerprint every device to prevent session hijacking.
*   **Adaptive Defense**: Our system fights back. It locks attackers automatically.
*   **Automated Security**: We integrated industry-standard tools like CodeQL and Trivy."

### Slide 6: Live System Demo Introduction
**Visual**: A split view of a Phone Screen and a Laptop Screen.
**Text**: "Live Production Environment | Vercel & Railway".

**Speaker Notes**:
"Now, we will demonstrate these features live. Not on localhost. But on a production environment deployed to Vercel and Railway, mirroring a real-world bank-grade setup."

---

## 🎬 PART 3: THE "HOLLYWOOD" LIVE DEMO SCRIPT (10 MINS STRICT)

**Cast**:
*   **You (The Presenter)**: Driving the flow.
*   **The Phone**: The Star of the show.
*   **The Laptop**: The Command Center.

### [0:00 - 3:00] SCENE 1: THE REGISTRATION (Show the MFA Setup)
**Goal**: Prove the MFA isn't fake. Show the QR Scanning.

1.  **Narrator**: "Let's start fresh. I am a new tenant, registering on the **Mobile App**."
2.  **Action (Phone)**: Click "Register".
    *   Name: `Judge Demo`
    *   Email: `judge1@rentverse.com` (Use a fresh one!)
    *   Pass: `SecurePass123!`
3.  **Action**: Submit.
4.  **Action**: **The QR Code appears**.
    *   *Judge Psychology*: This is the moment they know it's real.
5.  **Narrator**: "We require MFA enrollment immediately. I'm using Google Authenticator."
6.  **Action**: Scan the QR code with your REAL phone (or pretend if mirroring is tricky, but scanning is better).
7.  **Action**: Enter the 6-digit code.
8.  **Result**: Redirected to Home.
9.  **Narrator**: "Identity secured. Session token is now bound to this specific phone's hardware fingerprint."

### [3:00 - 5:00] SCENE 2: THE "GOOD" TENANT (AI & Agreements)
**Goal**: Show Modules 2 (API), 3 (Agreements), and Bonus (AI).

1.  **Narrator**: "I'm looking for a room."
2.  **Action (Phone)**: Browse Properties. Click one.
3.  **Narrator**: "Notice the 'AI Verified' badge? Our Python service analyzed the price vs area market value. It prevents 'bait-and-switch' scams."
4.  **Action (Phone)**: Click "Rent Now".
5.  **Action**: Sign the signature pad. Click "Confirm".
6.  **Narrator**: "When I tap confirm, the system generates a PDF and calculates its SHA-256 hash. This guarantees Non-Repudiation. Neither the landlord nor I can deny this agreement later."

### [5:00 - 7:00] SCENE 3: THE ATTACK (The Climax)
**Goal**: Show Module 4 (Alerts) and Bonus (Adaptive Defense).

1.  **Narrator**: "Now... let's switch hats. I am an attacker. I stole the user's email, but I don't have the password."
2.  **Action (Laptop)**: Open **Incognito Window**. Go to `uitm-devops-challenge-team-one.vercel.app`.
3.  **Narrator**: "I will attempt a Brute Force attack."
4.  **Action**: Enter `judge1@rentverse.com`.
5.  **Action**: Enter WRONG password (`hacker1`). Click Login. (Red Toast: "Invalid").
6.  **Action**: DO IT FAST. "Attempt 2... Attempt 3... Attempt 4... Attempt 5..."
7.  **Action**: **On Attempt 6**: The system pauses. Loading... **"Account Locked due to Suspicious Activity"**.
8.  **Narrator**: "Boom. The Adaptive Defense system kicked in. No human intervention."

### [7:00 - 9:00] SCENE 4: THE DEFENSE (The Payoff)
**Goal**: Show Module 5 (Dashboard) and Slack Integration.

1.  **Narrator**: "What happened in the background? Look at my Slack."
2.  **Action**: Switch to **Slack Tab**.
3.  **Visual**: Point to the new message: `🚨 CRITICAL ALERT: Brute Force Detected for judge1@rentverse.com`.
4.  **Narrator**: "Real-time telemetry. The SecOps team is notified instantly."
5.  **Action**: Switch to **Admin Dashboard (Vercel)**.
6.  **Action**: Refresh the table.
7.  **Visual**: Show the top row. Color: **RED**. Status: **CRITICAL**.
8.  **Narrator**: "Here in the dashboard, we see the Full Impact. IP Address. Device Fingerprint. Risk Score: 100."
9.  **Action**: Click "Unlock".
10. **Narrator**: "As Admin, I verify it's a false alarm or a real threat. I'll unlock it now."

### [9:00 - 10:00] SCENE 5: THE PIPELINE (The "Mic Drop")
**Goal**: Show Module 6 (CI/CD).

1.  **Action**: Switch to **VS Code** (Show `ci.yml`) then **GitHub**.
2.  **Narrator**: "None of this matters if the code is insecure. That's why we use this checked pipeline. 14 stages. We scan for Secrets. We scan for CVEs. We scan for Logic Flaws."
3.  **Closing**: "RentVerse is built fast. But more importantly, it defends smarter. Thank you."

---

## ⚔️ PART 4: THE Q&A BATTLEFIELD (JUDGE PSYCHOLOGY)

**The "Tech Purist" Judge**:
*   *Question*: "Why BCrypt? Why not Argon2?"
*   *Answer*: "We use **BCrypt** (with 12 salt rounds) as it is the industry standard for Node.js implementations, offering excellent resistance to rainbow table attacks while maintaining compatibility with our ecosystem."

**The "Business" Judge**:
*   *Question*: "Is this AI actually running or is it hardcoded?"
*   *Answer*: "It is a live Python Microservice using **Scikit-Learn**. It accepts JSON payloads with property features and returns a predicted price object. I can show you the Swagger docs if you like."

**The "Security Nasty" Judge**:
*   *Question*: "I can just steal the Session Token (JWT). What then?"
*   *Answer*: "That's why we implemented **Device Fingerprinting**. The JWT contains a hash of the user's Browser + Hardware. If you steal the token and use it on your laptop, the fingerprint mismatch will trigger a 'SecurityEvent' and invalidate the session immediately."

**The "UX" Judge**:
*   *Question*: "Two-Factor is annoying. Users will hate it."
*   *Answer*: "Security is a trade-off. However, we only enforce TOTP for 'High Assurance' actions or new devices. For trusted devices, we rely on the fingerprint, reducing friction while maintaining defense."

---

## 🚨 PART 5: EMERGENCY PROTOCOLS (WHEN THINGS BREAK)

**Scenario A: The verification email/OTP never arrives.**
*   *Protocol*: "The email service seems to be throttled by the venue network. Let me switch to the 'Demo Account' which has a pre-verified state." -> Login as `tenant@rentverse.com`.

**Scenario B: The Phone Mirroring freezes.**
*   *Protocol*: "Apologies, the casting software is lagging." -> Physically pick up the phone, walk to the judges, show them the screen. "As you can see, the app is running natively."

**Scenario C: The "Attack" doesn't trigger the lock.**
*   *Protocol*: "It seems the Risk Score threshold hasn't been met yet—our AI learns over time. Let me force a 'High Risk' event via the Admin Panel." -> Use the Dashboard to manually lock the user.

**Scenario D: Internet Failure.**
*   *Protocol*: "We anticipated this. I have a local instance running on 'localhost' which mocks the cloud services." -> Switch to `localhost:3000`.

---

## 📝 PART 6: THE "WINNING" VOCABULARY
Use these words to sound professional:
*   **"Telemetry"** (Not "Logs")
*   **"Non-Repudiation"** (Not "Can't deny it")
*   **"Attack Surface"** (Not "Vulnerabilities")
*   **"Orchestration"** (Not "Running tasks")
*   **"Zero-Trust"** (Not "Secure")
*   **"Velocity Checks"** (Not "Speed checks")

**Go get them, Team One.** 🚀
