# Export models so they can be imported from app.models
from app.models.user import User
from app.models.service_request import ServiceRequest

__all__ = ["User", "ServiceRequest"]
