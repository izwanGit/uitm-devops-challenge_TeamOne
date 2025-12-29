# ⏱️ RentVerse 7-Minute Live Demo Script

This script is optimized for speed, impact, and high-scoring technical callouts.

---

## 🕒 [0:00 - 1:30] Phase 1: Identity & Zero-Trust (M1)
**Action**: Open Registration page on the mobile app/emulator.
*   **Narrative**: "Welcome judges. We are starting with **Module 1: Secure Identity**. I'm registering a new account. Notice the password field—it's being hashed using **BCrypt with 12 salt rounds** on our backend."
*   **Action**: Submit registration. 
*   **Narrative**: "**Bonus B2: Zero-Trust Logic** starts here. The moment I register, the system fingerprints this specific device. If a hacker steals my session and tries to use it from their laptop, our 'Identity Mismatch' logic will kill the session immediately."
*   **Action**: (If MFA is enabled) "Registering MFA now. This ensures 'True' Authentication—something I know, and something I have."

---

## 🕒 [1:30 - 3:00] Phase 2: Digital Agreements & Non-Repudiation (M3)
**Action**: Go to a property listing. Click 'Rent Now'.
*   **Narrative**: "I'm renting this apartment. Now for **Module 3: Digital Agreements**. Our system doesn't just store an image of my signature."
*   **Action**: Draw signature and click 'Sign'.
*   **Narrative**: "The moment I tap sign, **Puppeteer** on the server generates a 'Gold Master' PDF. We then calculate a **SHA-256 Hash** of that document. This is **Non-Repudiation**—neither I nor the landlord can ever deny the terms of this contract, because any change to the file would break the cryptographic seal."

---

## 🕒 [3:00 - 4:30] Phase 3: AI Intelligence & API Validation (M2 + B1)
**Action**: Navigate to 'Post Listing'. Fill in a fake price (e.g., Luxury house for RM 100).
*   **Narrative**: "Now, let's look at **Module 2: API Gateway** and **Bonus B1: AI Threat Intelligence**. I’m trying to post a listing."
*   **Action**: Hit 'Submit'.
*   **Narrative**: "Our **Joi Validation (M2)** first ensures the data is clean, then our **Python FastAPI service (B1)** analyzes the price. Because this RM 100 price is 90% below market value, it’s flagged as a potential scam and sent to the Admin queue for review."

---

## 🕒 [4:30 - 6:00] Phase 4: Attack & Autonomous Defense (M4, M5, B3)
**Action**: Switch to the **Admin Dashboard** tab. Then, in terminal, run `node pitching-demo.js`.
*   **Narrative**: "Now, let's watch the system defend itself. Switch to our **Activity Dashboard (M5)**. I am now triggering a simulated Brute Force and Impossible Travel attack."
*   **Action**: Run the script. **Check Slack and Dashboard**.
*   **Narrative**: "Look at Slack! **Module 4: Smart Notifications** in action. Real-time alerts for Brute Force. In the dashboard, you see **Bonus B3: Adaptive Defense**. The system didn't wait for me—it **Autonomously Locked** the attacker's account the moment the Risk Score hit 100."

---

## 🕒 [6:00 - 7:00] Phase 5: The Secured Pipeline (M6 + B4)
**Action**: Switch to **GitHub Actions/CI-CD**.
*   **Narrative**: "Finally, **Module 6: The Secured Pipeline**. We used **GitHub Actions** to implement 14 stages of safety."
*   **Action**: Hover over **CodeQL / Gitleaks / Trivy**.
*   **Narrative**: "**Bonus B4: Automated Review**. We use **Gitleaks** to scan for secrets, **Trivy** for OS vulnerabilities, and **CodeQL** for logic flaws. If a developer accidentally adds a backdoor, this pipeline will kill the build before it ever touches our production server."

---

## 💎 The "Winning" Mic Drop
"In 7 minutes, we’ve demonstrated a system that doesn't just manage rentals—it **Detects**, **Defends**, and **Deters** threats autonomously. From Zero-Trust to AI-driven forensics, RentVerse is ready for production. Thank you."
