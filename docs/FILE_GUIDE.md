# Project File Guide

This guide documents every important file in the project. Whenever a file is added or significantly changed, this guide is updated.

---

## File: `.gitignore`

### Purpose:
Specifies files and folders that Git should intentionally ignore and never track in version control.

### Why it exists:
To keep the repository clean and prevent sensitive secrets (like `.env` containing database passwords) and heavy folders (like `venv/` and `node_modules/`) from leaking into public Git repositories.

### Important content:
* `backend/venv/` & `venv/` — Ignores local Python virtual environments.
* `*.env` & `!.env.example` — Ignores actual environment secret files while allowing public templates.
* `__pycache__/` — Ignores compiled Python bytecode cache.
* `frontend/node_modules/` — Ignores client JavaScript packages.

### What happens when Git runs:
Git checks this file before staging changes. Any file or directory pattern matching `.gitignore` is skipped during `git status` and `git add`.

### What other files interact with it:
Interacts with all files in the repository.

### Beginner explanation:
Think of `.gitignore` as a bouncer at the club door. It decides who is allowed into Git history and who must stay local on your computer.

### Interview explanation:
> "We maintain a strict `.gitignore` to prevent sensitive credentials and machine-specific build artifacts from entering version control, adhering to security and repository hygiene best practices."

---

## File: `docker-compose.yml`

### Purpose:
Orchestrates multi-container execution for the database (MySQL), backend (FastAPI), and frontend (React).

### Why it exists:
Allows running the entire distributed architecture with a single command (`docker compose up`) on any machine with Docker installed.

### Important content:
* `services.db`: Specifies the MySQL 8.0 container, environment credentials, volume persistence, and a healthcheck probe (`mysqladmin ping`).
* `services.backend`: Builds the FastAPI backend image and waits for `db` to pass healthchecks before starting.
* `services.frontend`: Builds and serves the React frontend, mapped to port 3000.
* `volumes.mysql_data`: Persists MySQL database data on the host disk even when containers are stopped.

### What happens when Docker Compose runs:
Docker pulls required base images, builds custom Dockerfiles, creates a shared internal bridge network, starts MySQL, waits for it to become healthy, and then boots the backend and frontend.

### What other files interact with it:
* [`backend/Dockerfile`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/Dockerfile)
* [`backend/.env`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/.env)

### Beginner explanation:
Instead of opening three separate terminal windows to manually start MySQL, Python, and React, Docker Compose is like an orchestra conductor that starts all three in harmony.

### Interview explanation:
> "Our `docker-compose.yml` orchestrates our multi-tier architecture locally. It defines service dependencies, shared bridge networking, volume persistence for MySQL, and health check dependencies for resilient startup sequencing."

---

## File: `backend/requirements.txt`

### Purpose:
Declares the exact Python libraries and dependencies required by the FastAPI backend.

### Why it exists:
Ensures reproducibility so that any developer, CI/CD pipeline, or Docker container can install the exact same package versions using `pip install -r requirements.txt`.

### Important content:
* `fastapi`: Modern web framework for REST API endpoints.
* `uvicorn[standard]`: ASGI server to run FastAPI.
* `sqlalchemy`: Object-Relational Mapper for MySQL database management.
* `pymysql` & `cryptography`: MySQL database driver and authentication encryption.
* `pydantic` & `pydantic-settings`: Data validation and environment variable parsing.
* `pyjwt`: JSON Web Token generation and validation.
* `bcrypt`: Secure password hashing algorithm.

### What happens when pip runs:
`pip` reads this list, downloads the wheel packages from PyPI, and installs them into `backend/venv/Lib/site-packages/`.

### What other files interact with it:
* [`backend/Dockerfile`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/Dockerfile) uses it during image build.
* All backend code files import libraries installed from this file.

### Beginner explanation:
Think of `requirements.txt` like an ingredient list for a recipe. Without it, you wouldn't know which packages Python needs to run the project.

### Interview explanation:
> "We declare our pinned backend dependencies in `requirements.txt` to guarantee deterministic package installation across local virtual environments, Docker containers, and future cloud servers."

---

## File: `backend/.env.example`

### Purpose:
Serves as an example template for required environment variables.

### Why it exists:
Because `.env` is kept private and git-ignored, new developers or automated deployment scripts need to know what configuration keys the application expects without revealing real passwords.

### Important content:
Contains placeholder keys:
* `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
* `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`
* `CORS_ORIGINS`

### What happens when a developer clones the project:
They copy `.env.example` to `.env` and fill in their own local credentials.

### What other files interact with it:
Reference for [`backend/.env`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/.env).

### Beginner explanation:
It's like a blank job application form showing which fields need to be filled in, without showing anyone's actual personal answers.

### Interview explanation:
> "We check `.env.example` into version control as a safe configuration contract so collaborators know what environment variables must be defined, while keeping our actual `.env` secret."

---

## File: `backend/.env`

### Purpose:
Stores active local configuration values and secret credentials for the running application on this machine.

### Why it exists:
To keep local MySQL credentials (`DB_PASSWORD=stem`) and secret keys accessible to Python while strictly keeping them out of Git history.

### Important content:
* `DB_PASSWORD=stem`: Local MySQL root password.
* `DB_NAME=cloud_it_portal`: Target database name.
* `JWT_SECRET_KEY`: Signing key for JWT auth tokens.

### What happens when the backend starts:
`pydantic-settings` reads this file from disk into memory, populating the `Settings` object in `app/config.py`.

### What other files interact with it:
* Read by `app/config.py` in Stage 2.
* Protected by `.gitignore`.

### Beginner explanation:
This is your private key locker on your computer. It holds the passwords your code needs to do its job.

### Interview explanation:
> "The `.env` file provides environment-level configuration on the host, decoupling secrets and environment-specific parameters from the application source code."

---

## File: `backend/Dockerfile`

### Purpose:
Defines the instructions for building a standalone container image for the FastAPI backend.

### Why it exists:
Enables packaging the FastAPI application, its Python runtime, and its dependencies into an immutable container image that runs identically anywhere Docker is installed.

### Important content:
* `FROM python:3.11-slim`: Lightweight, secure Linux base image.
* `WORKDIR /app`: Working directory inside the container.
* `COPY requirements.txt .` and `RUN pip install`: Installs dependencies inside the image.
* `COPY . .`: Copies application source code into the image.
* `CMD ["uvicorn", "app.main:app", ...]`: Entrypoint command executed when the container starts.

### What happens when Docker builds:
Docker executes each layer in sequence, caching unchanged layers, and produces an image tag ready to be run or pushed to an image registry.

### What other files interact with it:
* Referenced by [`docker-compose.yml`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/docker-compose.yml).
* Consumes [`backend/requirements.txt`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/requirements.txt).

### Beginner explanation:
It's the blueprint for building our backend container. It tells Docker how to set up the kitchen before cooking the meal.

### Interview explanation:
> "Our backend Dockerfile creates a lean Python 3.11 slim image. It uses layered caching for dependencies and sets up the Uvicorn ASGI server as the container entrypoint."
