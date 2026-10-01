# Technical Interview Preparation Guide

This guide prepares you to explain the **Cloud-Based IT Service Request & Automation Portal** confidently in technical interviews, structured around what has actually been implemented.

---

## Level 1: Basic Technology Questions

### Q1: What is FastAPI and why did you choose it over Django or Flask?
> **Answer**:
> "FastAPI is a modern, high-performance Python web framework built on standard type hints and ASGI. I chose it over Flask because FastAPI provides automatic request data validation via Pydantic, asynchronous concurrency out of the box, and generates interactive OpenAPI documentation (`/docs`) automatically. Compared to Django, FastAPI is much leaner, avoiding monolithic overhead while giving us precise control over our architecture."

### Q2: What is an ORM and why did you use SQLAlchemy?
> **Answer**:
> "An ORM (Object-Relational Mapper) maps database tables to Python classes and rows to object instances. I used SQLAlchemy because it abstracts raw SQL syntax, enforces our relational schema in code, and prevents SQL injection vulnerabilities by automatically parameterizing queries."

---

## Level 2: Project Architecture Questions

### Q3: Can you walk me through the high-level architecture of your portal?
> **Answer**:
> "Our portal follows a decoupled multi-tier architecture:
> 1. A **Frontend Tier** built with React for user interactions.
> 2. A **REST API Tier** built with FastAPI that handles routing, business logic, and automated service request workflows.
> 3. A **Relational Data Tier** using MySQL 8.0 for ACID-compliant persistence.
> The backend is stateless, relying on JWT tokens for authentication, and is packaged with Docker for seamless containerized deployment."

### Q4: How does data flow when a user logs in?
> **Answer**:
> "The client sends a JSON `POST` request to `/api/auth/login`. FastAPI validates the payload with Pydantic, queries the user by email in MySQL, and verifies the password hash using `bcrypt`. If valid, the server signs an HMAC-SHA256 JWT containing the user's ID, role, and a 60-minute expiration timestamp, returning it to the client. The client attaches this token in the `Authorization: Bearer` header for subsequent requests."

---

## Level 3: Database & Data Integrity Questions

### Q5: What database relationships exist in your application?
> **Answer**:
> "We have a One-to-Many relationship between the `users` table and the `service_requests` table. One user can submit multiple service requests, but each request belongs to exactly one owner via a foreign key `service_requests.user_id` referencing `users.id`. We also enforce `ON DELETE CASCADE` so that if an account is removed, orphaned tickets are cleaned up automatically."

### Q6: Why did you add `pool_pre_ping=True` to your SQLAlchemy engine?
> **Answer**:
> "MySQL servers terminate idle connections after an inactivity timeout. Without connection pooling health checks, an application attempting to use a dead connection will crash with `MySQL server has gone away`. `pool_pre_ping=True` sends a lightweight 'ping' before issuing a query, automatically recycling closed connections transparently."

---

## Level 4: Security & Authentication Questions

### Q7: Why do you store passwords as bcrypt hashes instead of encrypting them?
> **Answer**:
> "Encryption is two-way and reversible if a key is compromised. Hashing is a one-way mathematical function. We use `bcrypt` with salt rounds because it is computationally intensive, rendering dictionary and rainbow-table attacks unfeasible even if our database were leaked."

### Q8: What is Role-Based Access Control (RBAC) and how did you implement it?
> **Answer**:
> "RBAC restricts endpoint access based on assigned user roles. We support two roles: `EMPLOYEE` and `ADMIN`. In FastAPI, we implemented a custom dependency `require_admin` that inspects the decoded JWT token. Regular employees can only submit and view their own tickets, while administrators have elevated permissions to view all organization requests and trigger simulated infrastructure provisioning."

---

## Level 5: Cloud & Docker Questions

### Q9: How would you deploy this application onto AWS?
> **Answer**:
> "Because our application is containerized with Docker and driven entirely by environment variables, we would:
> 1. Provision a custom VPC with public and private subnets across two Availability Zones.
> 2. Launch an AWS EC2 instance running our Docker containers in the public subnet behind an Application Load Balancer (ALB).
> 3. Provision a managed Amazon RDS MySQL instance in the private subnet, restricting port 3306 inbound traffic strictly to the EC2 security group.
> 4. Use an IAM instance profile on EC2 so the host can securely write logs to Amazon CloudWatch without hardcoding AWS access keys."

---

## Level 6: Troubleshooting Scenario Questions

### Q10: What happens if your MySQL database temporarily goes offline?
> **Answer**:
> "Our `/api/health` endpoint actively monitors database connectivity by executing a `SELECT 1` query. If MySQL goes down, `/api/health` reports the database as unhealthy. Furthermore, incoming requests to protected routes will receive clean HTTP 500 error responses handled by FastAPI rather than unhandled server crashes."
