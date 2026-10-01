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


---

## File: `backend/app/config.py`

### Purpose:
Loads, parses, and validates all environment variables and configuration settings from `backend/.env`.

### Why it exists:
Centralizes application settings into a strongly-typed Pydantic `Settings` class so credentials and URLs are never scattered or hardcoded across the codebase.

### Important code:
* `class Settings(BaseSettings)`: Defines typed configuration variables.
* `@computed_field @property def DATABASE_URL`: Dynamically constructs the SQLAlchemy MySQL connection string.

### What happens when the application starts:
Pydantic reads `.env`, validates types, and creates a singleton `settings` object used throughout the backend.

### What other files interact with it:
* [`backend/app/database.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/database.py)
* [`backend/app/security.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/security.py)
* [`backend/app/main.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/main.py)

### Beginner explanation:
Think of `config.py` as the settings dashboard in your smartphone. All backend settings live in one convenient place.

### Interview explanation:
> "`config.py` implements centralized environment configuration using Pydantic `BaseSettings`, guaranteeing that all required database credentials, security keys, and CORS policies are present and valid before the server accepts traffic."

---

## File: `backend/app/database.py`

### Purpose:
Initializes the SQLAlchemy database engine, session factory (`SessionLocal`), declarative Base, and the `get_db` session generator.

### Why it exists:
To establish and manage pooled database connections to MySQL safely and prevent connection exhaustion.

### Important code:
* `engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)`
* `Base = declarative_base()`: Base class for all ORM models.
* `def get_db()`: Dependency yielding an isolated session and closing it inside a `finally` block.

### What happens when the application starts:
Creates the connection pool. `get_db()` provides a fresh database session whenever an API endpoint requires database access.

### What other files interact with it:
* All ORM models in `backend/app/models/`.
* Injected into routers via `db: Session = Depends(get_db)`.

### Beginner explanation:
It is the water faucet connecting your Python code to the MySQL reservoir. Whenever you need data, it opens the tap, and when you finish, it always turns it off.

### Interview explanation:
> "`database.py` configures our SQLAlchemy connection pool with `pool_pre_ping=True` for resilient connection recovery and provides the `get_db` generator dependency to enforce per-request session lifecycles."

---

## File: `backend/app/models/user.py`

### Purpose:
SQLAlchemy ORM model defining the `users` table in MySQL.

### Why it exists:
Defines user entity attributes, credential storage, role classification (`EMPLOYEE` / `ADMIN`), and relational foreign key linking to tickets.

### Important code:
* `id = Column(Integer, primary_key=True)`
* `email = Column(String(150), unique=True, index=True, nullable=False)`
* `hashed_password = Column(String(255), nullable=False)`
* `role = Column(String(20), default="EMPLOYEE")`
* `service_requests = relationship("ServiceRequest", back_populates="owner", cascade="all, delete-orphan")`

### What happens when the application starts:
SQLAlchemy maps this Python class to the physical `users` table inside MySQL.

### What other files interact with it:
* [`backend/app/models/service_request.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/models/service_request.py)
* [`backend/app/routers/auth.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/routers/auth.py)
* [`backend/app/dependencies.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/dependencies.py)

### Beginner explanation:
The Python blueprint describing what a user account looks like in our database.

### Interview explanation:
> "`user.py` defines our User entity in SQLAlchemy with indexed unique email constraints, bcrypt hashed credentials, and a one-to-many relationship with cascade deletion for owned service requests."

---

## File: `backend/app/models/service_request.py`

### Purpose:
SQLAlchemy ORM model defining the `service_requests` table in MySQL.

### Why it exists:
Tracks IT ticket lifecycles, user ownership, priority levels, status, and simulated cloud execution transcripts.

### Important code:
* `user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)`
* `service_type = Column(String(50), nullable=False)`
* `status = Column(String(20), default="PENDING")`
* `automation_log = Column(Text, nullable=True)`

### What happens when the application starts:
Maps to `service_requests` table in MySQL with foreign key constraints.

### What other files interact with it:
* [`backend/app/models/user.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/models/user.py)
* Upcoming requests router and automation service.

### Beginner explanation:
The Python blueprint describing an IT ticket in our database.

### Interview explanation:
> "`service_request.py` defines the ticket entity with relational foreign keys to users, status tracking from PENDING to COMPLETED, and text storage for automation engine execution logs."

---

## File: `backend/app/security.py`

### Purpose:
Cryptographic utilities for password hashing (`bcrypt`) and JWT token management (`pyjwt`).

### Why it exists:
Guarantees that plaintext passwords are never stored and provides stateless token authentication.

### Important code:
* `hash_password(password)`: Hashes plaintext with `bcrypt.gensalt(12)`.
* `verify_password(plain, hashed)`: Constant-time password verification.
* `create_access_token(data, delta)`: Generates signed JWT with expiration.
* `decode_access_token(token)`: Validates JWT signature.

### What happens when called:
Used during user registration, login, and authorization checks.

### What other files interact with it:
* [`backend/app/routers/auth.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/routers/auth.py)
* [`backend/app/dependencies.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/dependencies.py)

### Beginner explanation:
The security guard of the application. It creates unforgeable digital badges (JWT) and encodes passwords.

### Interview explanation:
> "`security.py` encapsulates our cryptographic operations, providing salted bcrypt password hashing and HMAC-SHA256 JWT encoding/decoding with automated expiration enforcement."

---

## File: `backend/app/schemas/user.py`

### Purpose:
Pydantic validation schemas for user input payloads and sanitized responses.

### Why it exists:
Filters data crossing the HTTP boundary to prevent malformed data from reaching the database and prevent passwords from leaking in API responses.

### Important code:
* `UserRegister`: Validates name, email format, and password length.
* `UserResponse`: Returns public user attributes (`hashed_password` is excluded).
* `Token`: Structure for login response containing JWT string and user object.

### What other files interact with it:
* [`backend/app/routers/auth.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/routers/auth.py)

### Beginner explanation:
The security scanner at an airport. It checks bags coming in to make sure nothing bad enters, and checks what leaves to make sure secrets don't escape.

### Interview explanation:
> "Pydantic user schemas enforce input contracts on registration and login payloads while sanitizing outbound user data via response models to prevent password hash leakage."

---

## File: `backend/app/schemas/service_request.py`

### Purpose:
Pydantic validation schemas for IT service requests.

### Why it exists:
Ensures tickets submitted by clients contain valid service types (`VM_PROVISION`, `S3_ACCESS`, etc.) and valid priority levels (`LOW`, `MEDIUM`, `HIGH`).

### Important code:
* `RequestCreate`: Validates title, service type, and priority.
* `RequestResponse`: Serializes ticket information and execution logs for the frontend.

### What other files interact with it:
* Upcoming service request router.

### Beginner explanation:
A structured form template that ensures every required field on an IT ticket is filled out correctly.

### Interview explanation:
> "`service_request.py` schemas validate ticket creation parameters against predefined allowable service types and priorities using Pydantic field validators."

---

## File: `backend/app/dependencies.py`

### Purpose:
FastAPI dependency injection functions for JWT Bearer token authentication and role verification.

### Why it exists:
Secures endpoints so that unauthenticated or unauthorized users are blocked with HTTP 401 or 403 errors before the endpoint logic executes.

### Important code:
* `get_current_user`: Extracts token from `Authorization: Bearer <token>`, decodes it, and retrieves the User from MySQL.
* `require_admin`: Confirms that `current_user.role == 'ADMIN'`, raising HTTP 403 Forbidden otherwise.

### What other files interact with it:
* Injected into protected routes in `backend/app/routers/`.

### Beginner explanation:
The security checkpoint inside the building. It checks your badge before you can enter restricted rooms.

### Interview explanation:
> "`dependencies.py` implements reusable authentication and RBAC guards via FastAPI's dependency injection system, enforcing stateless JWT validation and role requirements cleanly across route handlers."

---

## File: `backend/app/routers/auth.py`

### Purpose:
FastAPI router handling user registration, login, and current user profile retrieval.

### Why it exists:
Exposes HTTP endpoints for account creation and session authentication.

### Important code:
* `POST /register`: Registers user with hashed password.
* `POST /login`: Verifies password and returns signed JWT.
* `GET /me`: Returns profile of the logged-in user.

### What other files interact with it:
* Mounted onto the main application in [`backend/app/main.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/main.py).

### Beginner explanation:
The front desk where new users sign up, registered users log in, and users ask for their profile details.

### Interview explanation:
> "`routers/auth.py` provides the REST controllers for user lifecycle management, returning standardized HTTP status codes (201 Created, 200 OK, 401 Unauthorized) and JWT credentials."

---

## File: `backend/app/main.py`

### Purpose:
Entrypoint for the FastAPI application.

### Why it exists:
Initializes the FastAPI instance, configures CORS middleware, registers routers under `/api`, creates tables on startup, and provides `/api/health`.

### Important code:
* `lifespan`: Startup context manager ensuring MySQL tables exist via `Base.metadata.create_all(bind=engine)`.
* `CORSMiddleware`: Allows browser requests from `http://localhost:3000`.
* `GET /api/health`: Probes database health via `SELECT 1`.

### What happens when the application starts:
Uvicorn loads `main.py`, connects to MySQL, ensures tables are ready, mounts routers, and begins listening for HTTP requests on port 8000.

### What other files interact with it:
The central coordinator for all routers, configs, and models.

### Beginner explanation:
The front door and brain of the backend server.

### Interview explanation:
> "`main.py` bootstraps the FastAPI application, configuring lifespan lifecycle hooks, CORS middleware for frontend communication, router aggregation, and the operational `/api/health` probe."


---

## File: `backend/app/services/automation.py`

### Purpose:
Simulated IT automation engine that executes mock cloud provisioning and IT infrastructure fulfillment routines.

### Why it exists:
Models real-world cloud service workflows (`VM_PROVISION`, `S3_ACCESS`, `DB_ACCOUNT`, `PASSWORD_RESET`) in Python without incurring cloud costs or requiring AWS credentials.

### Important code:
* `def execute_service_request(request: ServiceRequest, db: Session) -> ServiceRequest`:
  * Sets status to `IN_PROGRESS`.
  * Generates mock cloud IDs (`i-0...`, `vol-0...`, `arn:aws:...`).
  * Formats audit lines with `[SIMULATED-AWS-ENGINE]`.
  * Saves transcript to `request.automation_log` and transitions status to `COMPLETED`.

### What other files interact with it:
* Called by [`backend/app/routers/requests.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/routers/requests.py) inside the `/execute` endpoint.

### Beginner explanation:
The automated robot worker. When an admin clicks "Execute", this file runs the mock provisioning steps and writes the transcript.

### Interview explanation:
> "`automation.py` encapsulates our infrastructure fulfillment simulation. It models real AWS provisioning lifecycles with mock resource identifiers and timestamped audit logs, designed for seamless replacement with the AWS `boto3` SDK in the future."

---

## File: `backend/app/routers/requests.py`

### Purpose:
REST API router for service request ticket management (`POST`, `GET`, `/execute`, `DELETE`).

### Why it exists:
Exposes HTTP endpoints for submitting tickets, filtering requests by role, triggering automated fulfillment, and cancelling pending requests.

### Important code:
* `POST /requests`: Submits new ticket in `PENDING` status.
* `GET /requests`: Role-based filtering (Employees see own tickets; Admins see all).
* `POST /requests/{id}/execute`: Locked to `ADMIN` only; triggers `execute_service_request()`.
* `DELETE /requests/{id}`: Cancels pending tickets (employee) or deletes tickets (admin).

### What other files interact with it:
* Uses models in [`backend/app/models/`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/models).
* Uses dependencies in [`backend/app/dependencies.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/dependencies.py).
* Mounted onto the FastAPI app in [`backend/app/main.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/main.py).

### Beginner explanation:
The ticketing window where employees hand in their requests, check on their status, and admins approve them.

### Interview explanation:
> "`routers/requests.py` manages ticket lifecycles and implements data isolation, enforcing ownership rules for standard users and privileged execution guards for administrators."

---

## File: `backend/app/routers/users.py`

### Purpose:
REST API router for administrative user management.

### Why it exists:
Provides an administrative directory endpoint to inspect registered user accounts and their assigned roles.

### Important code:
* `GET /users`: Locked to `require_admin`, returns `List[UserResponse]`.

### What other files interact with it:
* Injected with `require_admin` from `app.dependencies`.
* Mounted in `app.main`.

### Beginner explanation:
The staff directory view for administrators.

### Interview explanation:
> "`routers/users.py` provides administrative user inspection endpoints protected by the `require_admin` dependency."


---

## File: `frontend/package.json`

### Purpose:
Declares frontend package dependencies, metadata, and build scripts for the React application.

### Why it exists:
Defines dependencies including React 18, ReactDOM, Vite 5, and Lucide-React icons for UI rendering.

### Important code:
* `"scripts": { "dev": "vite --port 3000", "build": "vite build" }`

---

## File: `frontend/vite.config.js`

### Purpose:
Vite build tool configuration and local development server proxy.

### Why it exists:
Proxies requests from `/api` to `http://localhost:8000` during local development, preventing cross-origin CORS friction in the browser.

---

## File: `frontend/src/api/client.js`

### Purpose:
Centralized HTTP client helper wrapping the native browser `fetch` API.

### Why it exists:
Automatically injects the stored JWT token into the `Authorization: Bearer <token>` header for every outgoing request and triggers automatic logout if the backend returns HTTP 401 Unauthorized.

---

## File: `frontend/src/context/AuthContext.jsx`

### Purpose:
Global React Context managing user authentication state, token storage, and session synchronization.

### Why it exists:
Persists user login state across page reloads via `localStorage`, verifies token freshness on app boot, and provides `useAuth()` to all components.

---

## File: `frontend/src/components/Navbar.jsx`

### Purpose:
Application header component with user identity greeting, role badge, server health indicator, and logout action.

---

## File: `frontend/src/components/StatusBadge.jsx`

### Purpose:
Status indicator pill component featuring glowing, animated status dots and humanized state labels (`Pending Approval`, `Automating...`, `Fulfilled / Ready`).

---

## File: `frontend/src/components/StatCard.jsx`

### Purpose:
Dashboard summary card displaying metrics (Total Tickets, Pending Approval, Fulfilled, Access Level) with visual icons.

---

## File: `frontend/src/components/AutomationTerminal.jsx`

### Purpose:
Dark-themed cloud console modal displaying simulated AWS infrastructure provisioning transcripts with timestamp highlighting and a copy-to-clipboard button.

---

## File: `frontend/src/components/NewRequestModal.jsx`

### Purpose:
Interactive modal dialog allowing users to select infrastructure services (EC2, S3, RDS, Password Reset) with plain-English descriptions and submit new tickets.

---

## File: `frontend/src/pages/AuthPage.jsx`

### Purpose:
Unified authentication view with tabbed Sign In and Register forms, including one-click Demo Fill buttons for rapid testing of Employee and Admin roles.

---

## File: `frontend/src/pages/Dashboard.jsx`

### Purpose:
Main authenticated portal view featuring metric cards, status tabs, search filter, ticket list with administrative automation execution triggers, and log inspection.

---

## File: `frontend/Dockerfile`

### Purpose:
Multi-stage container definition that compiles the React application with Node.js and serves the production static bundle using a lightweight Nginx image.
