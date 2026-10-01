from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database import engine, Base, get_db
from app.routers import auth
import app.models  # Ensures all models are registered with Base.metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events: runs when the FastAPI application starts up and shuts down.
    Creates any missing database tables automatically on startup.
    """
    # Startup: ensure tables exist
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown logic (if any cleanup is needed in the future)


# Create FastAPI application instance with rich OpenAPI metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="REST API for the Cloud-Based IT Service Request & Automation Portal. "
                "Provides JWT authentication, role-based authorization, and simulated IT automation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS Middleware so React (running on port 3000 or 5173) can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(auth.router, prefix="/api")


@app.get("/", include_in_schema=False)
def root_redirect():
    """
    Redirects root requests to the interactive OpenAPI Swagger documentation.
    """
    return RedirectResponse(url="/docs")


@app.get(
    "/api/health",
    tags=["System"],
    summary="Health check probe",
    description="Verifies that the FastAPI application is alive and can query the MySQL database.",
    status_code=status.HTTP_200_OK
)
def health_check(db: Session = Depends(get_db)):
    """
    Executes a lightweight 'SELECT 1' query on MySQL to verify database health.
    """
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "project": settings.PROJECT_NAME
    }
