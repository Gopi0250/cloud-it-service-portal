# Project Troubleshooting & Debugging Log

This document records every error or obstacle encountered during the development of this project, how it was diagnosed, and the exact resolution.

---

## Issue 1: Local MySQL Authentication Failure

### Problem:
The backend script could not establish a connection to the running MySQL 8.0 server on `localhost:3306`.

### Error message:
```text
pymysql.err.OperationalError: (1045, "Access denied for user 'root'@'localhost' (using password: YES)")
```

### What caused it:
The initial `.env` assumed default MySQL passwords such as `root`, `admin`, or empty string. The user's local MySQL instance had a custom administrative root password set during their initial MySQL installation.

### How we diagnosed it:
We ran an automated connection test script testing common default passwords. All returned `Access denied (using password: YES)`, confirming that MySQL was listening on port 3306 and actively rejecting the password credentials, rather than being offline. The user provided the active password (`stem`).

### Fix:
Updated [`backend/.env`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/.env) to specify:
```ini
DB_PASSWORD=stem
```
Tested again via Python `pymysql.connect()`: connection succeeded immediately, and the database `cloud_it_portal` was verified.

### How to prevent it:
Always use environment variables (`.env`) for database credentials so passwords can be adjusted per machine without modifying application code.

### What I learned:
In software engineering, authentication errors (`1045 Access denied`) are fundamentally different from network errors (`2003 Can't connect to MySQL server`). An access denied error proves the server is alive and reachable, but requires the correct secret key.

---

## Issue 2: Docker CLI Not Present in System PATH

### Problem:
Running `docker --version` in PowerShell failed with command not found.

### Error message:
```text
docker : The term 'docker' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

### What caused it:
Docker Desktop or Docker Engine is not installed or not added to the Windows system `PATH` on this developer machine.

### How we diagnosed it:
We queried PowerShell using `Get-Command docker -ErrorAction SilentlyContinue`, which returned null.

### Fix:
We acknowledged the physical environment constraint honestly:
1. Docker configuration files ([`backend/Dockerfile`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/Dockerfile) and [`docker-compose.yml`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/docker-compose.yml)) remain authored and syntactically correct for portability and future cloud deployment.
2. Local development and verification runs natively using Python in `backend/venv` and Node for the frontend, avoiding blocked development.

### How to prevent it:
Design applications to be container-friendly (using environment variables and standard directory layouts) while retaining the ability to run directly on the host machine.

### What I learned:
Do not assume every developer or CI environment has Docker active. Writing decoupled code that runs both in Docker containers and directly in a virtual environment provides maximum resilience.


---

## Issue 3: NameError on Router Registration in `main.py`

### Problem:
When starting the test server after creating `requests.py` and `users.py`, the application failed to boot with a `NameError`.

### Error message:
```text
File "backend/app/main.py", line 47, in <module>
    app.include_router(requests.router, prefix="/api")
NameError: name 'requests' is not defined
```

### What caused it:
`main.py` called `app.include_router(requests.router)` and `app.include_router(users.router)`, but the import statement at the top of `main.py` was only importing `auth`:
`from app.routers import auth`

### How we diagnosed it:
Inspecting the top of `backend/app/main.py` showed that `requests` and `users` were missing from the import tuple.

### Fix:
Updated line 9 of [`backend/app/main.py`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/app/main.py) to:
```python
from app.routers import auth, requests, users
```
Re-ran the automated integration test: all 8 test suites passed with zero errors.

### How to prevent it:
When adding new routers or submodules, always update both the router mounting calls AND the top-level import statement in `main.py`.

### What I learned:
In Python, variables or modules must be imported in the same file where they are referenced. Even if `app/routers/__init__.py` exports them, `main.py` must explicitly import them into its local namespace.
