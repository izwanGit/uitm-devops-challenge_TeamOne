# Deploying RentVerse to Railway

This guide outlines the steps to deploy the RentVerse application (Backend, Frontend, and AI Service) to Railway.

## Prerequisites

- A [Railway](https://railway.app/) account.
- GitHub repository connected to Railway.

## 1. Database Setup (PostgreSQL)

1.  Create a **New Project** in Railway.
2.  Choose **Provision PostgreSQL**.
3.  Once provisioned, click on the **Postgres** service -> **Variables**.
4.  Copy the `DATABASE_URL`. You will need this for the Backend.

## 2. Backend Service (`rentverse-backend`)

1.  In your Railway project, click **New** -> **GitHub Repo**.
2.  Select your repository.
3.  Click **Variables** and add the following:
    - `DATABASE_URL`: (Paste the URL from step 1)
    - `NODE_ENV`: `production`
    - `AI_SERVICE_URL`: `https://<YOUR_AI_SERVICE_DOMAIN>` (You will update this later after deploying the AI service)
    - `PORT`: `3001` (Railway usually auto-assigns, but good to be explicit or let it default. Railway injects `PORT`)
    - Add other env vars from your `.env.example` (e.g., `JWT_SECRET`, `CLOUDINARY_*`, `SMTP_*`, `GOOGLE_*`).
4.  **Settings** -> **Root Directory**: Set to `/rentverse-backend`.
5.  **Settings** -> **Networking**: Click **Generate Domain**.
6.  **Deploy**.

## 3. AI Service (`rentverse-ai-service`)

1.  Click **New** -> **GitHub Repo** (Select the same repo again).
2.  **Settings** -> **Root Directory**: Set to `/rentverse-ai-service`.
3.  **Variables**:
    - `PORT`: `8000` (Optional, Railway injects its own PORT which our Dockerfile now respects).
    - Any other required env vars.
4.  **Settings** -> **Networking**: Click **Generate Domain**.
5.  **Deploy**.
6.  **Update Backend**: Go back to your Backend Service -> **Variables**. Update `AI_SERVICE_URL` with the domain you just generated for the AI Service (e.g., `https://ai-production.up.railway.app`). Redisploy Backend.

## 4. Frontend Service (`rentverse-frontend`)

> [!IMPORTANT]
> The Frontend is a Next.js app that requires the Backend URL at **Build Time**.

1.  Click **New** -> **GitHub Repo** (Select the same repo).
2.  **Settings** -> **Root Directory**: Set to `/rentverse-frontend`.
3.  **Variables**:
    - `NEXT_PUBLIC_API_BASE_URL`: The domain of your deployed **Backend Service** (e.g., `https://backend-production.up.railway.app`).
    - `API_BASE_URL`: Same as above (for server-side calls).
4.  **Deploy**.

## Troubleshooting

-   **Process Exited**: Check `View Logs`.
-   **Connection Refused**: Ensure services are communicating over the public domains (HTTPS) since they are separate services in Railway (unless you use Railway's internal private networking, but public domains are easier for initial setup).
-   **Frontend Build Fails**: Ensure `NEXT_PUBLIC_API_BASE_URL` is set in Variables *before* you trigger the build.


