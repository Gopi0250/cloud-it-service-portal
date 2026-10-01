from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ServiceRequest(Base):
    """
    SQLAlchemy ORM Model representing the 'service_requests' table in MySQL.
    Tracks IT service requests, user ownership, request lifecycle status,
    and simulated cloud automation execution transcripts.
    """
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    service_type = Column(String(50), nullable=False)  # VM_PROVISION, S3_ACCESS, DB_ACCOUNT, PASSWORD_RESET
    priority = Column(String(20), nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH
    status = Column(String(20), nullable=False, default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, FAILED
    description = Column(Text, nullable=True)
    automation_log = Column(Text, nullable=True)  # Stores simulated execution transcript
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Many-to-One Relationship: Multiple requests belong to one User
    owner = relationship("User", back_populates="service_requests")

    def __repr__(self) -> str:
        return f"<ServiceRequest id={self.id} title='{self.title}' status='{self.status}' user_id={self.user_id}>"
