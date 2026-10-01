import random
import secrets
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.service_request import ServiceRequest


def _format_log_line(step: str, message: str) -> str:
    """Helper to format a timestamped audit log line."""
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    return f"[{timestamp}] [SIMULATED-AWS-ENGINE] [{step}] {message}"


def execute_service_request(request: ServiceRequest, db: Session) -> ServiceRequest:
    """
    Simulated IT Infrastructure Automation Engine.
    
    Executes mock cloud provisioning and IT service fulfillment routines without
    making external API calls or incurring costs.
    
    Generates realistic cloud identifiers (mock EC2 instance IDs, mock S3 ARNs,
    mock IAM policies) and records a step-by-step execution transcript in MySQL.
    """
    request.status = "IN_PROGRESS"
    db.commit()

    logs = []
    logs.append(_format_log_line("INIT", f"Starting automated fulfillment for Ticket #{request.id} ({request.title})"))
    logs.append(_format_log_line("VALIDATION", f"Service Type: {request.service_type} | Priority: {request.priority}"))

    service_type = request.service_type.upper()

    if service_type == "VM_PROVISION":
        # 1. Mock EC2 Instance Provisioning
        mock_instance_id = f"i-0{secrets.token_hex(8)}"
        mock_private_ip = f"10.0.1.{random.randint(15, 240)}"
        mock_volume_id = f"vol-0{secrets.token_hex(8)}"
        
        logs.append(_format_log_line("AMI_SELECT", "Selected base image: ami-0c7217cdde317cfec (Ubuntu 22.04 LTS)"))
        logs.append(_format_log_line("VPC_CONFIG", "Target Subnet: subnet-0a1b2c3d (us-east-1a) | Security Group: sg-0987654321fedcba0"))
        logs.append(_format_log_line("PROVISIONING", f"Allocating virtual compute instance: {mock_instance_id} (Type: t3.micro)"))
        logs.append(_format_log_line("STORAGE", f"Attaching 20GB gp3 root volume: {mock_volume_id}"))
        logs.append(_format_log_line("NETWORK", f"Assigned internal VPC IPv4 address: {mock_private_ip}"))
        logs.append(_format_log_line("HEALTH_CHECK", f"Instance {mock_instance_id} state changed to 'running' (2/2 system checks passed)"))
        logs.append(_format_log_line("COMPLETION", f"Virtual Server successfully provisioned. Hostname: ip-{mock_private_ip.replace('.', '-')}.ec2.internal"))

    elif service_type == "S3_ACCESS":
        # 2. Mock S3 & IAM Permission Grant
        mock_bucket_name = "corp-data-lake-prod"
        mock_policy_arn = f"arn:aws:iam::123456789012:policy/ITPortal-S3ReadWrite-{secrets.token_hex(4)}"
        
        logs.append(_format_log_line("IAM_EVALUATE", f"Evaluating IAM permissions for User ID #{request.user_id}"))
        logs.append(_format_log_line("POLICY_GEN", f"Generated scoped IAM Policy: {mock_policy_arn}"))
        logs.append(_format_log_line("PERMISSIONS", "Allowed actions: [s3:GetObject, s3:PutObject, s3:ListBucket]"))
        logs.append(_format_log_line("ATTACHMENT", f"Attached policy to Target Bucket: arn:aws:s3:::{mock_bucket_name}"))
        logs.append(_format_log_line("COMPLETION", f"S3 Bucket access successfully granted. Target URI: s3://{mock_bucket_name}/user_{request.user_id}/"))

    elif service_type == "DB_ACCOUNT":
        # 3. Mock Database Credential Creation
        mock_db_user = f"usr_{secrets.token_hex(4)}"
        mock_db_host = "rds-mysql-prod-cluster.c123456.us-east-1.rds.amazonaws.com"
        
        logs.append(_format_log_line("RDS_DISCOVER", f"Targeting RDS MySQL Cluster: {mock_db_host}"))
        logs.append(_format_log_line("USER_CREATE", f"Created database user account: '{mock_db_user}'@'10.0.%.%'"))
        logs.append(_format_log_line("PRIVILEGES", f"Granted: [SELECT, INSERT, UPDATE] on schema 'cloud_it_portal'"))
        logs.append(_format_log_line("ENCRYPTION", "TLS 1.3 requirement enforced (require SSL = TRUE)"))
        logs.append(_format_log_line("COMPLETION", f"Database credentials provisioned. Connection string: mysql://{mock_db_user}:[REDACTED]@{mock_db_host}:3306/cloud_it_portal"))

    elif service_type == "PASSWORD_RESET":
        # 4. Mock Password Reset & Security Revocation
        mock_temp_token = f"tmp_{secrets.token_urlsafe(16)}"
        
        logs.append(_format_log_line("AUTH_AUDIT", f"Initiating identity verification for User ID #{request.user_id}"))
        logs.append(_format_log_line("TOKEN_REVOKE", "Invalidated all active JWT refresh tokens and active sessions"))
        logs.append(_format_log_line("CREDENTIAL_GEN", f"Generated secure one-time activation token: {mock_temp_token}"))
        logs.append(_format_log_line("NOTIFICATION", "Simulated email notification dispatched to user with temporary link"))
        logs.append(_format_log_line("COMPLETION", "Password reset workflow successfully completed. User flagged for password change on next login."))

    else:
        logs.append(_format_log_line("ERROR", f"Unrecognized service type '{request.service_type}'. No automated workflow configured."))
        request.status = "FAILED"
        request.automation_log = "\n".join(logs)
        db.commit()
        db.refresh(request)
        return request

    logs.append(_format_log_line("SUCCESS", f"All automation steps executed successfully. Ticket #{request.id} marked COMPLETED."))
    
    # Commit execution results
    request.status = "COMPLETED"
    request.automation_log = "\n".join(logs)
    db.commit()
    db.refresh(request)
    
    return request
