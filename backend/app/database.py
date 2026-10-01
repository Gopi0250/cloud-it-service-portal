from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Create the SQLAlchemy Engine connected to MySQL.
# pool_pre_ping=True: Tests connection liveness before executing queries, preventing
# "MySQL server has gone away" errors if an idle connection was terminated.
# pool_recycle=3600: Recycles connections after 1 hour to stay within MySQL timeout limits.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # Set to True if you want to see raw SQL queries in stdout during development
)

# SessionLocal is a factory for database sessions.
# autocommit=False ensures transactions are explicitly committed when operations succeed.
# autoflush=False prevents premature writes to the database before committing.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base class from which all SQLAlchemy database models will inherit
Base = declarative_base()


def get_db():
    """
    FastAPI Dependency that yields an isolated database session per request,
    and guarantees that the session is closed when the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
