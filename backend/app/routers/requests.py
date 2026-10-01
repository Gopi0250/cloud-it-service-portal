from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.service_request import ServiceRequest
from app.models.user import User
from app.schemas.service_request import RequestCreate, RequestResponse
from app.dependencies import get_current_user, require_admin
from app.services.automation import execute_service_request

router = APIRouter(prefix="/requests", tags=["Service Requests"])


@router.post(
    "",
    response_model=RequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new service request",
    description="Submits a new IT service request. The ticket is initialized in PENDING status."
)
def create_request(
    request_in: RequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_request = ServiceRequest(
        user_id=current_user.id,
        title=request_in.title,
        service_type=request_in.service_type,
        priority=request_in.priority,
        description=request_in.description,
        status="PENDING"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@router.get(
    "",
    response_model=List[RequestResponse],
    status_code=status.HTTP_200_OK,
    summary="List service requests",
    description="Returns service requests. Employees see only their own requests; Admins see all requests across the organization."
)
def list_requests(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (PENDING, IN_PROGRESS, COMPLETED, FAILED)"),
    service_type: Optional[str] = Query(None, description="Filter by service type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ServiceRequest)

    # RBAC: Employees view only their own requests; Admins view all
    if current_user.role != "ADMIN":
        query = query.filter(ServiceRequest.user_id == current_user.id)

    # Optional status filter
    if status_filter:
        query = query.filter(ServiceRequest.status == status_filter.upper())

    # Optional service type filter
    if service_type:
        query = query.filter(ServiceRequest.service_type == service_type.upper())

    # Return most recent requests first
    requests = query.order_by(ServiceRequest.created_at.desc()).all()
    return requests


@router.get(
    "/{request_id}",
    response_model=RequestResponse,
    status_code=status.HTTP_200_OK,
    summary="Get service request details",
    description="Returns detailed information and execution logs for a specific request."
)
def get_request_details(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service request #{request_id} not found"
        )

    # Security check: Non-admins cannot inspect tickets belonging to other users
    if current_user.role != "ADMIN" and request.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this ticket"
        )

    return request


@router.post(
    "/{request_id}/execute",
    response_model=RequestResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute simulated automation (Admin only)",
    description="Triggers the simulated IT automation engine to fulfill the request. Restricted to Administrators."
)
def execute_request_automation(
    request_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service request #{request_id} not found"
        )

    if request.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only tickets with PENDING status can be executed. Current status: {request.status}"
        )

    # Trigger the simulated automation engine
    updated_request = execute_service_request(request, db)
    return updated_request


@router.delete(
    "/{request_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel / Delete a service request",
    description="Cancels a pending request (owner) or deletes a request (Admin)."
)
def delete_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service request #{request_id} not found"
        )

    if current_user.role != "ADMIN":
        if request.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this ticket"
            )
        if request.status != "PENDING":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only PENDING tickets can be cancelled by employees. Current status: {request.status}"
            )

    db.delete(request)
    db.commit()
    return None
