# 📘 Rentverse User Manual

**Rentverse** is a secure, AI-powered rental platform designed for the modern real estate market. This guide covers all functionality for Tenants, Landlords, and Administrators, including our advanced security and mobile features.

---

## 🚀 Getting Started

### 1. Registration & Security
Rentverse prioritizes security from day one.
1.  **Sign Up**: Click "Sign Up" and enter your details.
2.  **Email Verification**: You will receive a verification link (simulated in Dev mode).
3.  **MFA Setup (Recommended)**:
    - Go to **Account Settings > Security**.
    - Click **"Enable 2FA"**.
    - Scan the QR code with your authenticator app (Google Auth, Authy).
    - Enter the verification code to confirm.
    - *Note:* Future logins will require this code.

### 2. Mobile App (Android)
If using the mobile app:
- **Permissions**: Grant "Location" and "Notification" permissions when prompted to enable:
    - **Nearby Search**: Find properties around you.
    - **Smart Alerts**: Receive booking updates and security warnings instantly.

---

## 👤 For Tenants

### 🏠 Finding a Home
1.  **Search**: Use the search bar for City, Price, or Property Type.
2.  **AI Recommendations**: The platform highlights "Best Value" properties using our AI Pricing Engine.
3.  **Map View**: Click the **Map Toggle** to browse by location.
4.  **Wishlist**: Tap the ❤️ icon to save properties. Access them later in the **Wishlist** tab.

### 📝 Booking & Leasing (The Digital Flow)
Rentverse offers a fully digital leasing experience:
1.  **Request Booking**:
    - Select dates on the property page.
    - Click **"Check Availability"** then **"Book Now"**.
    - The landlord will receive your request.
2.  **Approval**:
    - Once approved (or Auto-Approved), the status changes to **"APPROVED"**.
3.  **Digital Signature**:
    - Go to **"My Rents"** -> Click the property.
    - Click **"Sign Agreement"**.
    - Review the generated PDF contract.
    - Sign in the signature box and submit.
4.  **Download Agreement**:
    - After signing, click **"Download Agreement"**.
    - The PDF will be securely downloaded to your device.
    - *Note:* You can always access this legal document from your dashboard.

---

## 🔑 For Landlords

### 📢 Listing a Property
1.  **Add New Property**:
    - Go to **"My Properties"** -> **"Add Property"**.
    - **Step 1 (Details)**: Enter title, description, and amenities.
    - **Step 2 (Location)**: Enter address. *Mobile users: Use "Current Location" for precision.*
    - **Step 3 (Images)**: Upload high-quality photos.
2.  **AI Price Prediction**:
    - On the pricing step, click **"Predict Price"**.
    - Our AI analyzes market data to suggest an optimal rental price range.
    - Use this to maximize occupancy and revenue.

### 💼 Managing Rentals
1.  **Owner Dashboard**:
    - View all your active listings and pending requests.
2.  **Booking Requests**:
    - Receive notifications for new bookings.
    - **Approve/Reject**: Review tenant profile and make a decision.
    - *Note:* An approved booking automatically generates a draft lease for the tenant.

---

## 🛡️ For Administrators

### ⚡ Security Dashboard (SecOps)
The **Admin Dashboard** is the command center for security monitoring.
1.  **Access**: Login with admin credentials.
2.  **Security Logs Settings**:
    - Monitor **Login Events** (Success/Failure).
    - Choose **"Anomaly Detection"** to see flagged suspicious activities (e.g., rapid login attempts, new IP addresses).
3.  **User Management**:
    - View active users.
    - Disable suspicious accounts if necessary.

---

## 📱 Tech Features & Troubleshooting

### Mobile-Specific Features
- **Geolocation**: "Show properties near me" uses your device's GPS.
- **Push Notifications**: Receive alerts for:
    - Booking Status Changes (Approved/Rejected)
    - Security Alerts (New Device Login)
    - Promotional Offers.

### Common Issues
| Issue | Solution |
|-------|----------|
| **"Internal Server Error" on Verify** | Ensure you opened the *latest* verification link. Tokens expire in 1 hour. |
| **PDF Download Fails** | On mobile, ensure you are not in "Private Mode" which might block downloads. |
| **Map Not Loading** | Check if Location Permissions are granted in your browser/app settings. |

---

*Rentverse - Secure, Smart, Simple.*