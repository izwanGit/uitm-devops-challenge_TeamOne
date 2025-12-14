# RentVerse DevSecOps & Cloud Resilience Strategy

This document outlines the architecture designed to ensure "Exceptional" DevSecOps maturity, high availability, and security compliance for the RentVerse application.

## 1. Containerization Strategy (Docker)

We utilize **Multi-Stage Builds** for all services to separate build-time dependencies from the runtime environment. This significantly reduces image size and attack surface.

- **Frontend (`rentverse-frontend/Dockerfile`)**: Uses `oven/bun` for efficient dependency management and building. The final image contains only production assets and runs as a non-root `nextjs` user.
- **Backend (`rentverse-backend/Dockerfile`)**: Uses `node:20-alpine`. Builds with `pnpm`. Runs as a non-root `expressjs` user. Includes a `HEALTHCHECK` to ensure the API is responsive.
- **AI Service (`rentverse-ai-service/Dockerfile`)**: Optimized multi-stage Python build. Installs `poetry` and build tools (gcc) in the builder stage. The runner stage only contains the virtual environment and application code, running as a non-root `appuser`.

## 2. CI/CD Pipeline (GitHub Actions)

The pipeline defined in `.github/workflows/ci-cd.yml` enforces quality and security at every stage:

### Continuous Integration (CI)
- **Trigger**: Pushes and Pull Requests to `main`.
- **Parallel Jobs**:
  - `security-scan`: Runs **Gitleaks** (secret detection) and **Trivy** (vulnerability scanning). Fails on CRITICAL/HIGH severities.
  - `frontend-ci`: Installs dependencies, runs Linting.
  - `backend-ci`: Installs dependencies, runs Linting.
  - `ai-service-ci`: Installs dependencies, runs `pytest`.

### Continuous Delivery (CD)
- **Trigger**: Only on push to `main` and after successful CI jobs.
- **Build & Push**: Uses `docker/build-push-action` to build optimized images and push them to **GitHub Container Registry (GHCR)**.
- **Caching**: Docker layer caching is enabled to speed up builds.

## 3. Resilience & High Availability

- **Health Checks**: Every service in `docker-compose.yml` has a configured `healthcheck`.
  - Frontend: Checks `/api/health`
  - Backend: Checks `/api/health`
  - AI Service: Checks `/api/v1/health`
  - Database: Checks `pg_isready`
- **Restart Policies**: All services utilize `restart: always` to ensure self-healing capabilities in case of crashes or node reboots.
- **Orchestration**: `depends_on` with `condition: service_healthy` ensures dependent services (like Backend relying on DB) only start when the dependency is fully ready, preventing startup race conditions.

## 4. Security Compliance

- **Secret Scanning**: Integrated into the pipeline to prevent credential leaks.
- **Vulnerability Management**: Container images and filesystem are scanned for CVEs before deployment.
- **Least Privilege**: All containers run as **non-root users**, preventing potential container escape attacks significantly.
- **Environment Handling**: Secrets are injected via environment variables (using GitHub Secrets in CI/CD) and referenced in `docker-compose.yml`, ensuring no hardcoded credentials exist in the codebase.
