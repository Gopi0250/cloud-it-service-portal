# API Endpoint Documentation Guide

This guide documents every currently implemented REST API endpoint in the application.

---

## 1. System Health Check

```text
Endpoint:
GET /api/health

Purpose:
Verifies that the FastAPI application is alive and can query the MySQL database.

Who can access it:
Public (No authentication required)

Request method:
GET

Request URL:
http://localhost:8000/api/health

Headers:
Accept: application/json

Request body:
None

Example request:
curl -X GET http://localhost:8000/api/health

Expected response (200 OK):
{
  "status": "healthy",
  "database": "connected",
  "environment": "development",
  "project": "Cloud-Based IT Service Request Portal"
}

Possible errors:
- 500 Internal Server Error (if MySQL connection fails, database field indicates error)

Backend flow:
1. Route handler is invoked.
2. Acquires database session from get_db dependency.
3. Executes lightweight query: SELECT 1.
4. Returns health status object.

Database interaction:
Executes 'SELECT 1' via SQLAlchemy session.

Authentication:
None

Authorization:
Public

Simple explanation:
Like a doctor checking a patient's pulse. It proves the API server is alive and can talk to MySQL.

Interview explanation:
"We provide a dedicated /api/health endpoint used by load balancers and container orchestrators to probe application liveness and database connectivity."
```

---

## 2. Register New User

```text
Endpoint:
POST /api/auth/register

Purpose:
Creates a new user account with a hashed password in MySQL.

Who can access it:
Public

Request method:
POST

Request URL:
http://localhost:8000/api/auth/register

Headers:
Content-Type: application/json

Request body:
{
  "full_name": "John Doe",
  "email": "john.doe@company.com",
  "password": "SecurePassword123!",
  "department": "Engineering",
  "role": "EMPLOYEE"
}

Expected response (201 Created):
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john.doe@company.com",
  "role": "EMPLOYEE",
  "department": "Engineering",
  "created_at": "2026-10-01T21:06:51"
}

Possible errors:
- 400 Bad Request: "A user with this email address already exists"
- 422 Unprocessable Entity: Validation error (e.g., password < 6 chars, invalid email format)

Backend flow:
1. Pydantic validates input format and normalizes email to lowercase.
2. Checks MySQL if email already exists.
3. Hashes password using bcrypt.gensalt(12).
4. Commits new User record to MySQL.
5. Returns public UserResponse (hashed_password is omitted).

Database interaction:
SELECT on users WHERE email = :email; followed by INSERT INTO users (...).

Authentication:
None

Authorization:
Public

Simple explanation:
Sign-up form endpoint. It registers your account safely without saving your plain password.

Interview explanation:
"The registration endpoint validates input schemas via Pydantic, checks for email uniqueness, hashes the password with bcrypt, and commits the user to MySQL, returning a sanitized response."
```

---

## 3. User Login

```text
Endpoint:
POST /api/auth/login

Purpose:
Authenticates user credentials and returns a signed JWT access token.

Who can access it:
Public

Request method:
POST

Request URL:
http://localhost:8000/api/auth/login

Headers:
Content-Type: application/json

Request body:
{
  "email": "john.doe@company.com",
  "password": "SecurePassword123!"
}

Expected response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john.doe@company.com",
    "role": "EMPLOYEE",
    "department": "Engineering",
    "created_at": "2026-10-01T21:06:51"
  }
}

Possible errors:
- 401 Unauthorized: "Invalid email or password"

Backend flow:
1. Looks up User record by email.
2. Verifies incoming password against stored hash using bcrypt.checkpw().
3. Creates signed JWT containing sub (user ID), role, and expiration timestamp.
4. Returns token and user profile.

Database interaction:
SELECT on users WHERE email = :email LIMIT 1.

Authentication:
Validates credentials

Authorization:
Public

Simple explanation:
Login gate. If your password matches, you get a digitally signed badge (JWT) to use for future requests.

Interview explanation:
"The login endpoint verifies user credentials using bcrypt and issues a stateless HMAC-SHA256 signed JWT containing the user ID and role, valid for 60 minutes."
```

---

## 4. Get Current User Profile

```text
Endpoint:
GET /api/auth/me

Purpose:
Returns profile details of the currently authenticated user.

Who can access it:
Authenticated Users (EMPLOYEE or ADMIN)

Request method:
GET

Request URL:
http://localhost:8000/api/auth/me

Headers:
Authorization: Bearer <jwt_access_token>

Request body:
None

Expected response (200 OK):
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john.doe@company.com",
  "role": "EMPLOYEE",
  "department": "Engineering",
  "created_at": "2026-10-01T21:06:51"
}

Possible errors:
- 401 Unauthorized: "Not authenticated" or "Could not validate credentials or token expired"

Backend flow:
1. HTTPBearer extracts token from Authorization header.
2. decode_access_token() validates cryptographic signature and expiration.
3. Retrieves User by ID from MySQL.
4. Returns sanitized User profile.

Database interaction:
SELECT on users WHERE id = :user_id LIMIT 1.

Authentication:
Requires valid JWT Bearer token

Authorization:
Any authenticated role

Simple explanation:
Asks the server: "Who am I based on the badge I am showing you?"

Interview explanation:
"A protected route demonstrating dependency injection: it verifies the JWT Bearer token, extracts the subject claim, queries the database, and injects the active User object into the route handler."
```


---

## 5. Create Service Request

```text
Endpoint:
POST /api/requests

Purpose:
Submits a new IT service request. The ticket is initialized in PENDING status.

Who can access it:
Authenticated Users (EMPLOYEE or ADMIN)

Request method:
POST

Request URL:
http://localhost:8000/api/requests

Headers:
Authorization: Bearer <jwt_access_token>
Content-Type: application/json

Request body:
{
  "title": "Need Ubuntu Dev Server for Microservices",
  "service_type": "VM_PROVISION",
  "priority": "HIGH",
  "description": "Requires t3.micro Ubuntu 22.04 LTS instance"
}

Expected response (201 Created):
{
  "id": 1,
  "user_id": 1,
  "title": "Need Ubuntu Dev Server for Microservices",
  "service_type": "VM_PROVISION",
  "priority": "HIGH",
  "status": "PENDING",
  "description": "Requires t3.micro Ubuntu 22.04 LTS instance",
  "automation_log": null,
  "created_at": "2026-10-01T21:35:01",
  "updated_at": "2026-10-01T21:35:01",
  "owner": null
}

Possible errors:
- 401 Unauthorized: Missing or invalid JWT
- 422 Unprocessable Entity: Invalid service_type or priority value

Backend flow:
1. Validates JWT and retrieves current_user.
2. Validates RequestCreate schema (service_type in allowed list, priority in allowed list).
3. Creates ServiceRequest entity with status="PENDING" and user_id=current_user.id.
4. Commits to MySQL and returns created ticket.

Database interaction:
INSERT INTO service_requests (user_id, title, service_type, priority, status, description, created_at, updated_at) VALUES (...).

Authentication:
Required (Bearer Token)

Authorization:
EMPLOYEE, ADMIN

Simple explanation:
Submits an IT help desk ticket.

Interview explanation:
"The ticket submission endpoint extracts the authenticated user ID from the validated JWT token, enforces allowable service types and priorities via Pydantic validators, and records the request in MySQL with an initial PENDING state."
```

---

## 6. List Service Requests

```text
Endpoint:
GET /api/requests

Purpose:
Returns service requests. Employees see only their own requests; Admins see all requests across the organization.

Who can access it:
Authenticated Users (EMPLOYEE or ADMIN)

Request method:
GET

Request URL:
http://localhost:8000/api/requests?status=PENDING&service_type=VM_PROVISION

Headers:
Authorization: Bearer <jwt_access_token>

Query Parameters:
- status (optional): Filter by PENDING, IN_PROGRESS, COMPLETED, FAILED
- service_type (optional): Filter by VM_PROVISION, S3_ACCESS, DB_ACCOUNT, PASSWORD_RESET

Expected response (200 OK):
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Need Ubuntu Dev Server for Microservices",
    "service_type": "VM_PROVISION",
    "priority": "HIGH",
    "status": "PENDING",
    "description": "Requires t3.micro Ubuntu 22.04 LTS instance",
    "automation_log": null,
    "created_at": "2026-10-01T21:35:01",
    "updated_at": "2026-10-01T21:35:01",
    "owner": null
  }
]

Possible errors:
- 401 Unauthorized: Missing or invalid JWT

Backend flow:
1. Validates JWT and retrieves current_user.
2. Checks user role:
   - If EMPLOYEE: Adds filter ServiceRequest.user_id == current_user.id
   - If ADMIN: Allows unfiltered organizational query
3. Applies optional status and service_type query filters.
4. Orders by created_at DESC and returns list.

Database interaction:
SELECT * FROM service_requests WHERE ... ORDER BY created_at DESC.

Authentication:
Required (Bearer Token)

Authorization:
EMPLOYEE (own tickets), ADMIN (all tickets)

Simple explanation:
Shows your dashboard list of tickets.

Interview explanation:
"This endpoint enforces data isolation at the ORM query level: standard employees are constrained to their own user ID, while administrators receive an organization-wide view with support for status and service-type filtering."
```

---

## 7. Execute Request Automation

```text
Endpoint:
POST /api/requests/{id}/execute

Purpose:
Triggers the simulated IT automation engine to fulfill the request. Restricted to Administrators.

Who can access it:
ADMIN only

Request method:
POST

Request URL:
http://localhost:8000/api/requests/1/execute

Headers:
Authorization: Bearer <admin_jwt_access_token>

Request body:
None

Expected response (200 OK):
{
  "id": 1,
  "user_id": 1,
  "title": "Need Ubuntu Dev Server for Microservices",
  "service_type": "VM_PROVISION",
  "priority": "HIGH",
  "status": "COMPLETED",
  "description": "Requires t3.micro Ubuntu 22.04 LTS instance",
  "automation_log": "[2026-10-01 16:05:01 UTC] [SIMULATED-AWS-ENGINE] [INIT] Starting automated fulfillment...\n...",
  "created_at": "2026-10-01T21:35:01",
  "updated_at": "2026-10-01T21:35:02",
  "owner": null
}

Possible errors:
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: "Administrative privileges required to perform this action" (when an employee calls this)
- 404 Not Found: Service request does not exist
- 400 Bad Request: "Only tickets with PENDING status can be executed"

Backend flow:
1. require_admin dependency checks current_user.role == 'ADMIN'.
2. Fetches ticket by ID from MySQL.
3. Verifies ticket is currently PENDING.
4. Calls execute_service_request() in services/automation.py.
5. Updates status to COMPLETED and saves generated execution transcript.
6. Returns updated ticket.

Database interaction:
SELECT on service_requests; followed by UPDATE service_requests SET status='COMPLETED', automation_log='...' WHERE id=:id.

Authentication:
Required (Bearer Token)

Authorization:
ADMIN only

Simple explanation:
The "Approve & Run" button for IT admins.

Interview explanation:
"The execute endpoint demonstrates strict RBAC: non-administrative attempts are rejected with HTTP 403. Upon authorization, it triggers the simulated cloud automation engine, recording an audit log and transitioning the ticket to COMPLETED."
```

---

## 8. Cancel / Delete Service Request

```text
Endpoint:
DELETE /api/requests/{id}

Purpose:
Cancels a pending request (owner) or deletes a request (Admin).

Who can access it:
Authenticated Users (Ownership or Admin rules apply)

Request method:
DELETE

Request URL:
http://localhost:8000/api/requests/1

Headers:
Authorization: Bearer <jwt_access_token>

Request body:
None

Expected response (204 No Content):
Empty response body

Possible errors:
- 401 Unauthorized: Missing token
- 403 Forbidden: Employee trying to delete another user's ticket
- 400 Bad Request: Employee trying to cancel a ticket that is already COMPLETED or IN_PROGRESS
- 404 Not Found: Ticket does not exist

Database interaction:
DELETE FROM service_requests WHERE id = :id.

Authentication:
Required (Bearer Token)

Authorization:
Owner (if PENDING) or ADMIN (any)

Simple explanation:
Cancels a ticket you submitted if it hasn't been executed yet.

Interview explanation:
"Enforces stateful business rules on resource deletion: employees are permitted to cancel their own tickets only while in the PENDING state, whereas administrators hold broad deletion privileges."
```

---

## 9. List All Registered Users

```text
Endpoint:
GET /api/users

Purpose:
Returns a list of all registered users in the organization.

Who can access it:
ADMIN only

Request method:
GET

Request URL:
http://localhost:8000/api/users

Headers:
Authorization: Bearer <admin_jwt_access_token>

Expected response (200 OK):
[
  {
    "id": 1,
    "full_name": "John Doe",
    "email": "john.doe@company.com",
    "role": "EMPLOYEE",
    "department": "Engineering",
    "created_at": "2026-10-01T21:06:51"
  }
]

Possible errors:
- 401 Unauthorized
- 403 Forbidden: Non-admin users

Database interaction:
SELECT id, full_name, email, role, department, created_at FROM users ORDER BY id ASC.

Authentication:
Required (Bearer Token)

Authorization:
ADMIN only

Simple explanation:
Staff directory for IT administrators.

Interview explanation:
"An administrative management endpoint protected by the require_admin dependency guard, serializing sanitized user profiles without password hashes."
```
