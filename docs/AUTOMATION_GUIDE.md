# IT Infrastructure Automation Engine Guide (Simulated)

This guide documents the architecture, workflows, and implementation of the **Simulated IT Automation Engine** used in the portal.

> [!IMPORTANT]
> **SIMULATION TRANSPARENCY NOTICE**:
> The automation engine in this application is **strictly simulated**. It runs locally in Python, models realistic cloud provisioning logic, and produces mock cloud identifiers (e.g. `i-0a81c72f4e3b1` and `arn:aws:s3:...`).
> It does **NOT** make real AWS API calls (`boto3`) and does **NOT** create paid cloud resources.

---

## 1. Automation Lifecycle Flow

```text
End-User (Employee)
       ↓
Submits Service Request via Portal
       ↓
Request saved in MySQL with status: PENDING
       ↓
IT Administrator
       ↓
Reviews ticket on Admin Dashboard
       ↓
Clicks "Execute Automated Fulfillment" (POST /api/requests/{id}/execute)
       ↓
FastAPI RBAC Guard verifies 'ADMIN' role
       ↓
Simulated Automation Engine (app/services/automation.py)
       ↓
1. Updates status to IN_PROGRESS
2. Selects appropriate workflow by service_type
3. Generates mock resource identifiers & configuration parameters
4. Formats timestamped audit logs: [SIMULATED-AWS-ENGINE] [STEP] Message
5. Appends log to request.automation_log in MySQL
6. Updates status to COMPLETED
       ↓
Client (React Portal) receives real-time response and displays execution logs
```

---

## 2. Simulated Service Workflows

### 1. `VM_PROVISION` (Virtual Compute Instance)
* **Status**: **SIMULATED**
* **Real-World Equivalent**: AWS EC2 `RunInstances` API call.
* **Simulation Steps**:
  1. `AMI_SELECT`: Selects Ubuntu 22.04 LTS base image (`ami-0c7217cdde317cfec`).
  2. `VPC_CONFIG`: Assigns target private subnet (`subnet-0a1b2c3d`) and security group (`sg-0987654321fedcba0`).
  3. `PROVISIONING`: Generates random mock Instance ID: `i-0` + 16 random hex characters (e.g. `i-0a81c72f4e3b1`).
  4. `STORAGE`: Generates mock EBS root volume (`vol-0...`) of size 20 GB (gp3).
  5. `NETWORK`: Allocates mock private IPv4 address (`10.0.1.X`).
  6. `HEALTH_CHECK`: Confirms instance entered `running` state with 2/2 system status checks passed.

---

### 2. `S3_ACCESS` (Cloud Object Storage Permissions)
* **Status**: **SIMULATED**
* **Real-World Equivalent**: AWS IAM `PutUserPolicy` and S3 bucket ACL modification.
* **Simulation Steps**:
  1. `IAM_EVALUATE`: Analyzes user identity and department credentials.
  2. `POLICY_GEN`: Generates mock IAM policy ARN: `arn:aws:iam::123456789012:policy/ITPortal-S3ReadWrite-...`.
  3. `PERMISSIONS`: Configures permitted S3 actions: `[s3:GetObject, s3:PutObject, s3:ListBucket]`.
  4. `ATTACHMENT`: Attaches scoped policy to target bucket: `arn:aws:s3:::corp-data-lake-prod`.
  5. `COMPLETION`: Logs active access path: `s3://corp-data-lake-prod/user_{id}/`.

---

### 3. `DB_ACCOUNT` (Database Credentials Provisioning)
* **Status**: **SIMULATED**
* **Real-World Equivalent**: AWS RDS database user provisioning and permission assignment.
* **Simulation Steps**:
  1. `RDS_DISCOVER`: Identifies target managed RDS MySQL cluster (`rds-mysql-prod-cluster...`).
  2. `USER_CREATE`: Creates dedicated service account username (`usr_...`).
  3. `PRIVILEGES`: Grants `SELECT`, `INSERT`, `UPDATE` on schema `cloud_it_portal`.
  4. `ENCRYPTION`: Enforces TLS 1.3 encrypted SSL connection requirement.
  5. `COMPLETION`: Generates sanitized connection URI with password redacted.

---

### 4. `PASSWORD_RESET` (Security Credential Reset)
* **Status**: **SIMULATED**
* **Real-World Equivalent**: Enterprise Active Directory / IAM credential revocation and one-time password generation.
* **Simulation Steps**:
  1. `AUTH_AUDIT`: Validates user account standing.
  2. `TOKEN_REVOKE`: Invalidates active JWT refresh tokens and existing sessions.
  3. `CREDENTIAL_GEN`: Generates cryptographically secure one-time token (`tmp_...`).
  4. `NOTIFICATION`: Simulates dispatching email delivery to user.
  5. `COMPLETION`: Flags user account for mandatory password update on next sign-in.

---

## 3. How to Explain This in an Interview

> **Interview Question**: *"How does the automation engine work in your project?"*

> **Professional Answer**:
> "In our portal, the automation engine is currently implemented as a deterministic simulation. When an administrator approves a request, the engine models the step-by-step infrastructure workflows that would occur in AWS—such as subnet allocation, security group binding, and mock EC2 instance ID generation. We intentionally kept it simulated locally so the application can be built, tested, and demonstrated with zero cloud cost. The architecture is modular, meaning the simulation functions can be cleanly swapped with real AWS SDK (`boto3`) calls when deployed to AWS."
