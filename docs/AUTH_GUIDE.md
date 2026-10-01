# Authentication & Role-Based Authorization Guide

This document explains the security architecture of the portal, detailing authentication, password hashing, JWT generation, and Role-Based Access Control (RBAC).

---

## 1. Authentication vs. Authorization

* **Authentication (AuthN)**: *"Who are you?"*
  * Proves identity through credentials (e.g., verifying that the provided email and password match a registered user).
  * Implemented via: `POST /api/auth/login`.
* **Authorization (AuthZ)**: *"What are you allowed to do?"*
  * Enforces permissions based on the user's role (`EMPLOYEE` vs. `ADMIN`).
  * Implemented via: FastAPI dependency guards like `require_admin`.

---

## 2. Security Flow Architecture

```text
User
 ↓
Enters Email & Password in React Form
 ↓
POST /api/auth/login
 ↓
Backend queries User by email in MySQL
 ↓
Bcrypt verifies password hash (constant-time comparison)
 ↓
If valid: Backend signs JWT with HMAC-SHA256 (payload: sub=user_id, role=role, exp=60m)
 ↓
Client receives and stores JWT in memory / local storage
 ↓
Client makes subsequent requests with Header:
   Authorization: Bearer <token>
 ↓
FastAPI Dependency (get_current_user) intercepts request:
   1. Validates signature with JWT_SECRET_KEY
   2. Checks if token has expired
   3. Extracts user_id (sub)
   4. Queries User from MySQL
 ↓
FastAPI RBAC Guard (require_admin):
   - If role == "ADMIN": Allows execution
   - If role != "ADMIN": Halts with HTTP 403 Forbidden
```

---

## 3. Password Hashing with Bcrypt

Plaintext passwords are never written to disk, stored in MySQL, or logged.

### How Bcrypt Works:
1. **Salt Generation**: Bcrypt generates 16 cryptographically random bytes (the "salt").
2. **Key Derivation**: The password and salt are hashed together through $2^{12}$ (4,096) iterations (`rounds=12`).
3. **Format**: The resulting hash string encodes algorithm, cost, salt, and hash together:
   ```text
   $2b$12$e8x...[salt]...[hash]
   ```
4. **Verification**: During login, `bcrypt.checkpw(plain_bytes, hash_bytes)` re-hashes the attempt with the extracted salt and compares the two hashes in constant time to prevent timing side-channel attacks.

---

## 4. JSON Web Tokens (JWT)

A JWT is a compact, URL-safe means of representing claims to be transferred between two parties.

### JWT Structure (Three Parts separated by dots):
```text
[Header].[Payload].[Signature]
```

1. **Header**:
   ```json
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   ```
2. **Payload (Claims)**:
   ```json
   {
     "sub": "1",
     "role": "EMPLOYEE",
     "exp": 1740000000
   }
   ```
3. **Signature**:
   ```text
   HMACSHA256(
     base64UrlEncode(header) + "." + base64UrlEncode(payload),
     JWT_SECRET_KEY
   )
   ```

> [!NOTE]
> **No Secrets in Documentation**:
> Real secret keys are stored only in the local `.env` file (which is git-ignored).
> In configuration templates, use safe placeholders such as `JWT_SECRET_KEY=your_secret_key_here`.

---

## 5. Role-Based Access Control (RBAC) Permissions Matrix

| Endpoint | Method | `EMPLOYEE` | `ADMIN` | Public |
| :--- | :--- | :---: | :---: | :---: |
| `/api/health` | `GET` | ✅ | ✅ | ✅ |
| `/api/auth/register` | `POST` | ✅ | ✅ | ✅ |
| `/api/auth/login` | `POST` | ✅ | ✅ | ✅ |
| `/api/auth/me` | `GET` | ✅ | ✅ | ❌ |
| `/api/requests` (Create) | `POST` | ✅ | ✅ | ❌ |
| `/api/requests` (View) | `GET` | ✅ (Own tickets only) | ✅ (All org tickets) | ❌ |
| `/api/requests/{id}/execute` | `POST` | ❌ (HTTP 403) | ✅ (Triggers Automation) | ❌ |
