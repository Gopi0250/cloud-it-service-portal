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
