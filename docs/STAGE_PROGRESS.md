# Project Stage Progress Tracker

This document tracks the actual development progress of the **Cloud-Based IT Service Request & Automation Portal**.

Statuses used:
* **COMPLETED**: Fully implemented, tested, and verified.
* **IN PROGRESS**: Currently being designed, implemented, or tested.
* **NOT STARTED**: Planned for an upcoming stage.
* **PLANNED / FUTURE**: Conceptual cloud or advanced feature.

---

## Stages Overview

### Stage 1 — Local Environment, Configuration & Docker Foundation
* **Status**: **COMPLETED**
* **Completed Date**: October 2026
* **Key Achievements**:
  * Git repository initialized with comprehensive `.gitignore`.
  * Python 3.14 virtual environment configured (`backend/venv`).
  * Backend dependencies installed (`fastapi`, `uvicorn`, `sqlalchemy`, `pymysql`, `pydantic`, `pyjwt`, `bcrypt`).
  * Local MySQL connection verified on port 3306; database `cloud_it_portal` created.
  * Environment variable management setup (`.env.example` and `.env`).
  * Container foundation created (`backend/Dockerfile` and `docker-compose.yml`).

---

### Stage 2 — Database Layer & JWT Authentication
* **Status**: **IN PROGRESS**
* **Goal**:
  * Pydantic Settings configuration (`app/config.py`).
  * SQLAlchemy engine, session maker, and DB base (`app/database.py`).
  * Database ORM models for `User` and `ServiceRequest` (`app/models/`).
  * Password hashing (`bcrypt`) and JWT token utilities (`app/security.py`).
  * Pydantic schemas for input validation & output serialization (`app/schemas/`).
  * Authentication dependencies & role guards (`app/dependencies.py`).
  * Authentication endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
  * System health check endpoint (`/api/health`).

---

### Stage 3 — Service Requests & Simulated Automation Engine
* **Status**: **NOT STARTED**
* **Goal**:
  * Service request lifecycle CRUD endpoints (`POST`, `GET`, `DELETE` on `/api/requests`).
  * Role-based request filtering (Employees see own tickets, Admins see all).
  * Simulated IT Automation Engine (`app/services/automation.py`) generating mock resource IDs and execution logs for simulated VM provisioning, S3 access, DB access, and password resets.

---

### Stage 4 — React Frontend Development
* **Status**: **NOT STARTED**
* **Goal**:
  * React SPA scaffold and UI layout.
  * Authentication context & JWT token management.
  * Login, Register, Role-based Dashboard, Ticket creation form, and Execution log terminal viewer.

---

### Stage 5 — Full Local Integration & End-to-End Testing
* **Status**: **NOT STARTED**
* **Goal**:
  * End-to-end integration between React and FastAPI.
  * Cross-Origin Resource Sharing (CORS) verification.
  * Verification of role restrictions (Employee cannot trigger automation; Admin can).

---

### Stage 6 — Cloud Readiness & AWS Deployment Blueprint (Optional)
* **Status**: **PLANNED / FUTURE**
* **Goal**:
  * Documenting step-by-step migration from local execution to AWS EC2, AWS RDS MySQL, AWS S3, IAM roles, and CloudWatch logs.
  * Zero paid cloud resources launched today.
