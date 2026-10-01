from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """
    SQLAlchemy ORM Model representing the 'users' table in MySQL.
    Stores account credentials, role-based authorization level, and department.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="EMPLOYEE")  # EMPLOYEE or ADMIN
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # One-to-Many Relationship: One user can have multiple service requests.
    # cascade="all, delete-orphan" ensures if a user is deleted, their tickets are cleanly cleaned up.
    service_requests = relationship(
        "ServiceRequest",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email='{self.email}' role='{self.role}'>"
