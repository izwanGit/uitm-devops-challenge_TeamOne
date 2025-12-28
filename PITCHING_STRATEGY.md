# 🎙️ Pitching & Demo Strategy: Team One

Congratulations on making it to the finals! This guide is designed to help you dominate the **Final Pitching Session** on 29th December.

---

## 1. 📅 Presentation Schedule (Reminder)
*   **Time**: 3:00 PM – 4:00 PM (Arrive by 2:30 PM)
*   **Venue**: PTAR Meeting Room (Ground Floor), UiTM Tapah
*   **Format**: 5–10 min Demo | 20–25 min Q&A | 30 min Bug Fixing Challenge

---

## 2. 🚀 The Winning Pitch Structure (10 Mins)

**Theme**: *"Mobile Defense and Intelligence: Build Fast, Defend Smarter"*

1.  **The Hook (1 min)**:
    *   "RentVerse isn't just a property app. It's a military-grade rental ecosystem where security is baked into every line of code."
    *   Mention the challenge theme immediately.

2.  **Modules Overview (2 mins)**:
    *   **M1-M3**: Core security (MFA, JWT Rotation, SHA-256 Leases).
    *   **M4-M6**: Proactive Defense (Slack Alerts, Admin Dashboard, 14-Stage CI/CD).

3.  **Innovation Highlights (3 mins)**:
    *   **Impossible Travel Detection**: Tracking login velocity (Haversine Formula).
    *   **Device Fingerprinting**: binding sessions to specific hardware hashes.
    *   **AI Intelligence**: Python FastAPI predicting rent prices to detect "Bait-and-Switch" scams.

4.  **Architecture & Scalability (2 mins)**:
    *   Explain the Microservices setup (Node.js + Python + Postgres).
    *   Show off the **14-Stage Pipeline** (Trivy, Gitleaks, CodeQL).

5.  **Conclusion (1 min)**:
    *   "We didn't just meet requirements; we exceeded them with production-ready innovations."

---

## 3. 🖥️ Live Demo Flow (Smooth & Professional)

*Before the demo, run `node prisma/seed-security-demo.js` in the backend to populate the dashboard.*

| Step | Action | What to Say |
| :--- | :--- | :--- |
| **1. Login & MFA** | Log in as `tenant@rentverse.com` (MFA: `000000`) | "We utilize Argon2id hashing and mandatory TOTP MFA. Even with a stolen password, an attacker can't get in." |
| **2. AI Property** | Add a property (e.g., Room in Tapah). | "Our AI service analyzes the listing in real-time. It suggests a fair market price to prevent fraudulent overpricing." |
| **3. Crypto Signing** | Complete a lease signing. | "The agreement is hashed using SHA-256. Any alteration to the PDF file after signing will invalidate the cryptographic seal." |
| **4. Admin Control** | Switch to Admin Dashboard (`admin@rentverse.com`). | "This is our SecOps Command Center. We have 100% visibility into system telemetry." |
| **5. The 'Wow' Moment** | Trigger a lock. Attempt 5 wrong passwords. | "Watch our Slack. Immediately, the admin gets a critical alert. The account is now auto-locked via our Adaptive Defense logic." |

---

## 4. 🛡️ Q&A Battle Bank (Prepare for These!)

**Q1: Why use Argon2id for passwords?**
*   *Answer*: "It's the winner of the Password Hashing Competition. It’s memory-hard, making it resistant to GPU/ASIC cracking and side-channel attacks unlike older hashes like SHA256."

**Q2: How do you handle JWT Session Hijacking?**
*   *Answer*: "We use **Device Fingerprinting**. If a stolen token is used on a device with a different hardware signature, our middleware rejects it immediately. We also implement **Refresh Token Rotation**."

**Q3: Explain the 'Impossible Travel' logic.**
*   *Answer*: "We use the Haversine formula to calculate the distance between current and last login IPs. If the velocity > 800km/h (e.g., KL to London in 1 hour), we flag it as an impossible travel anomaly."

**Q4: Is the AI local or cloud? How is it secured?**
*   *Answer*: "It's a separate microservice (FastAPI). It communication over internal networks/HTTPS and is included in our **Trivy Container Scans** for vulnerabilities."

**Q5: What is the 14-stage pipeline?**
*   *Answer*: "It's a 'Zero-Trust' deployment. We use **Gitleaks** (secret scan), **Trivy** (vulnerability scan), and **CodeQL** (semantic analysis). If one check fails, the build is blocked."

---

## 5. 🛠️ Bug-Fixing Challenge (30 Mins)

The judges will likely introduce a bug or vulnerability. Use this checklist:

1.  **Look for Injection**: Check if any data goes into a raw SQL query or `dangerouslySetInnerHTML`.
2.  **Check Middleware**: Ensure the `auth` middleware is actually applied to the new route.
3.  **Validate Inputs**: If they add a new form, ensure there is a `Joi` schema for it in the backend.
4.  **Session Secrets**: Ensure secrets aren't hardcoded in the code (check `.env`).
5.  **CORS**: If the frontend can't talk to the backend, check `cors` settings in `index.js`.

**Commands to remember**:
*   `npm run build` (Check for build errors)
*   `npx prisma studio` (Quickly view/edit database data)
*   `tail -f logs/security.log` (Watch real-time errors)

---

## 📝 Final Checklist Before 29th Dec
- [ ] Laptop charged?
- [ ] Internet hotspot ready? (UiTM WiFi can be flaky)
- [ ] `seed-security-demo.js` tested?
- [ ] Slack app installed on phone for live notifications?
- [ ] Presentation slides exported to PDF (as backup)?

**Bro, you've got this. Team One is ready!** 🚀
