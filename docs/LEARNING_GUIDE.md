# Beginner Learning Guide

This document is your core conceptual textbook for the **Cloud-Based IT Service Request & Automation Portal**. Every technical concept introduced in this project is explained here in simple, interview-ready terms.

---

## 1. Python Virtual Environment (`venv`)

### Simple meaning
Think of a virtual environment like an isolated sandbox or a separate toolbox for a specific project. It prevents the libraries you install for this project from conflicting with libraries used by other projects on your computer.

### Why does our project need it?
Our backend uses specific versions of libraries (such as `fastapi`, `sqlalchemy`, and `pydantic`). If another project on your machine uses older or different versions, installing them globally would cause library clashes and break projects.

### Technical explanation
When you run `python -m venv venv`, Python creates a folder containing its own copy of the Python interpreter, pip package manager, and a dedicated `site-packages/` directory. When the virtual environment is activated, your terminal uses this local Python binary instead of your system's global Python.

### Where is it used?
Located at [`backend/venv/`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/venv).

### Example
Without a virtual environment:
* Project A installs `pydantic v1.10`.
* Project B installs `pydantic v2.10` and overwrites Project A's version, breaking Project A.

With a virtual environment:
* Project A has `venv_a/` with `pydantic v1.10`.
* Project B has `venv_b/` with `pydantic v2.10`. Both work smoothly side-by-side.

### How it connects to other components
`backend/venv/` houses the executable binaries for `uvicorn` (the web server) and all modules imported by FastAPI.

### Interview explanation
> "A virtual environment in Python provides an isolated runtime and dependency sandbox for a specific project, ensuring reproducible package versions and preventing version conflicts across different applications."

---

## 2. Environment Variables & `.env` Files

### Simple meaning
An environment variable is a piece of configuration data stored outside your application's source code. Think of it like your computer's settings dial—you can change how the app behaves without touching a single line of code.

### Why does our project need it?
We need to connect to MySQL using passwords, and we need secret keys to sign security tokens. If we hardcoded `password = "stem"` into Python code, anyone viewing our Git repository would see our private credentials.

### Technical explanation
The operating system maintains key-value pairs in memory for any running process. The `python-dotenv` and `pydantic-settings` libraries read the `.env` file upon startup and populate Python configuration classes.

### Where is it used?
* Template: [`backend/.env.example`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/.env.example) (committed to Git)
* Active local secrets: [`backend/.env`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/.env) (ignored by Git)

### Example
```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=stem
DB_NAME=cloud_it_portal
```

### How it connects to other components
The FastAPI backend reads these values to establish the SQLAlchemy database connection and configure CORS allowed origins for React.

### Interview explanation
> "We use environment variables to decouple configuration from application logic. This keeps sensitive credentials such as database passwords and JWT secrets out of source control and makes the application cloud-ready, allowing different values in development and production."

---

## 3. Relational Database Management System (MySQL)

### Simple meaning
A relational database is an organized digital filing cabinet where data is stored in structured tables made up of rows (records) and columns (attributes), connected together by relationships.

### Why does our project need it?
Our portal needs to persistently remember user accounts, their roles, and IT service request tickets even when the server restarts.

### Technical explanation
MySQL uses Structured Query Language (SQL) to execute atomic, consistent, isolated, and durable (ACID) transactions. It enforces constraints such as unique email addresses and foreign key links between users and their submitted tickets.

### Where is it used?
Runs locally as Windows service `MySQL80` on port 3306 with the database name `cloud_it_portal`.

### Example
* Table `users`: Stores user ID, email, name, role (`EMPLOYEE` or `ADMIN`).
* Table `service_requests`: Stores ticket ID, service type, status, and the `user_id` of who created it.

### How it connects to other components
FastAPI talks to MySQL via the `pymysql` database driver, abstracted through SQLAlchemy ORM.

### Interview explanation
> "MySQL is our relational database engine. We use it to ensure strict schema enforcement, relational integrity through foreign keys between users and requests, and durable ACID-compliant data storage."

---

## 4. Git & Version Control

### Simple meaning
Git is like a time machine for your codebase. It saves snapshots of your project so you can see every change you made, roll back mistakes, and collaborate with others without overwriting each other's work.

### Why does our project need it?
To track our incremental development stage by stage, document every commit message cleanly, and prepare a professional repository for your resume portfolio on GitHub.

### Technical explanation
Git tracks content as a directed acyclic graph (DAG) of commits. The `.gitignore` file instructs Git to completely ignore temporary build files, virtual environments, and `.env` secret files.

### Where is it used?
Project root directory [`.git/`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/.git) and [`.gitignore`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/.gitignore).

### Example
Command: `git commit -m "feat: complete Stage 1 - project foundation"` saves a permanent snapshot of Stage 1.

### How it connects to other components
Protects secrets in `.env` from ever being uploaded, while tracking source code and documentation.

### Interview explanation
> "We use Git for version control to manage feature progression incrementally, maintain a clean commit history, and prevent sensitive environment files from leaking into public repositories."

---

## 5. Docker & Containerization

### Simple meaning
Docker is like a shipping container for software. Just as a physical shipping container allows goods to be transported by truck, train, or ship without repacking, Docker packages code, runtime, system tools, and libraries into one container that runs identically on any computer or cloud server.

### Why does our project need it?
To avoid the classic problem: *"It works on my computer, but not on yours or in the cloud."* Docker defines the exact Python version, system packages, and dependencies required to run the backend and database.

### Technical explanation
Docker uses operating-system-level virtualization (Linux cgroups and namespaces) to run isolated processes called containers. A `Dockerfile` provides the build recipe for an image, while `docker-compose.yml` orchestrates multiple interconnected containers (FastAPI, React, and MySQL) on a shared virtual network.

### Where is it used?
* [`backend/Dockerfile`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/Dockerfile)
* [`docker-compose.yml`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/docker-compose.yml)

### Example
`docker compose up` starts the MySQL database container and the FastAPI backend container together with one command.

### How it connects to other components
Allows the local multi-tier application to be deployed directly onto an AWS EC2 instance without manual server setup.

### Interview explanation
> "Docker containerizes our application tiers into isolated, portable images. We use Docker Compose locally to orchestrate the backend, frontend, and MySQL containers together, ensuring identical environments between development and production."

---

## 6. FastAPI (Preview for Stage 2)

### Simple meaning
FastAPI is a modern, fast Python web framework used to build REST APIs. It acts like a restaurant waiter: it takes requests from the frontend client, brings them to the kitchen (business logic & database), and returns the finished response to the client.

### Why does our project need it?
It handles user registration, login authentication, ticket creation, and triggers our simulated automation workflows while providing automatic interactive API documentation (`/docs`).

### Technical explanation
FastAPI is built on ASGI (Asynchronous Server Gateway Interface) via Starlette and uses standard Python type hints via Pydantic. Because it is asynchronous, it can handle thousands of concurrent requests efficiently.

### Where is it used?
Will be implemented inside `backend/app/main.py`.

### Interview explanation
> "FastAPI is our backend REST API framework. We chose it because of its high asynchronous performance, built-in data validation via Pydantic, and automatic OpenAPI documentation generation."

---

## 7. Object-Relational Mapping (SQLAlchemy) (Preview for Stage 2)

### Simple meaning
An ORM lets you talk to your database using regular Python objects and classes instead of writing raw SQL strings by hand.

### Why does our project need it?
Instead of writing `SELECT * FROM service_requests WHERE id = 1;`, you write `db.query(ServiceRequest).filter(ServiceRequest.id == 1).first()`. It prevents SQL injection attacks and makes your code cleaner and easier to maintain.

### Technical explanation
SQLAlchemy maps Python classes to database tables, and class instances to table rows. It maintains a database session (Unit of Work pattern) that tracks changes and generates optimized SQL statements automatically.

### Where is it used?
Will be implemented inside `backend/app/database.py` and `backend/app/models/`.

### Interview explanation
> "SQLAlchemy is our ORM. It translates Python model classes into MySQL tables and queries, abstracting the raw SQL layer, enforcing data models in code, and preventing SQL injection vulnerabilities."

---

## 8. Password Hashing & Bcrypt (Preview for Stage 2)

### Simple meaning
Hashing is a one-way mathematical function that scrambles a plain password (like `mysecret123`) into a permanent jumble of characters. It cannot be decoded or reversed back into the original password.

### Why does our project need it?
If an attacker ever gained read access to our database, they would only see hashed strings, never the user's actual password.

### Technical explanation
Bcrypt uses an adaptive cryptographic hashing algorithm with a random salt (extra random characters added to the password before hashing) and a configurable computational work factor. This makes brute-force attacks computationally impractical.

### Where is it used?
Will be implemented inside `backend/app/security.py`.

### Interview explanation
> "We use bcrypt for one-way password hashing with per-user salt generation. Plaintext passwords are never stored or logged in our system, protecting user credentials against database breach leaks."

---

## 9. JSON Web Tokens (JWT) (Preview for Stage 2)

### Simple meaning
A JWT is a digitally signed security badge. When a user logs in with their email and password, the server hands them this badge. For every future request, the user presents this badge to prove who they are, without having to re-enter their password every time.

### Why does our project need it?
To implement stateless authentication. The server doesn't need to keep a list of active login sessions in its RAM. It just inspects the badge's cryptographic signature to verify it is genuine.

### Technical explanation
A JWT consists of three parts separated by dots (`.`):
1. **Header**: Algorithm used (e.g., `HS256`).
2. **Payload**: User claims (e.g., `user_id`, `role`, expiration time `exp`).
3. **Signature**: Cryptographic signature created using the server's private secret key.

### Where is it used?
Generated in `backend/app/security.py` upon login, and validated via FastAPI dependencies in `backend/app/dependencies.py`.

### Interview explanation
> "We use JWT for stateless token-based authentication. The client stores the signed token and sends it in the HTTP Authorization header. The backend verifies the signature on each request, extracting the user ID and role without querying session memory."

---

## 10. Role-Based Access Control (RBAC) (Preview for Stage 2)

### Simple meaning
RBAC means giving different people different keys based on their job role. An employee can only see and manage their own tickets, while an IT administrator can see all tickets and trigger simulated cloud provisioning.

### Why does our project need it?
To enforce security boundaries. Regular staff should not have the ability to approve infrastructure requests or alter other users' service requests.

### Technical explanation
The user's assigned role (`EMPLOYEE` or `ADMIN`) is embedded in their JWT payload and verified in the database. FastAPI route dependencies check whether the authenticated user possesses the required role before granting execution of protected endpoints.

### Where is it used?
Enforced in `backend/app/dependencies.py` via guards such as `require_admin`.

### Interview explanation
> "We implement Role-Based Access Control to restrict endpoint execution based on the user's role. Regular employees have permissions to create and view their own tickets, while administrators have elevated permissions to execute automated fulfillment and view organization-wide requests."
