import os
from typing import List
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings loaded from environment variables or .env file.
    Uses Pydantic BaseSettings to automatically parse and validate types.
    """
    PROJECT_NAME: str = "Cloud-Based IT Service Request Portal"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database Configuration (MySQL)
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "stem"
    DB_NAME: str = "cloud_it_portal"

    # Security & JWT Configuration
    JWT_SECRET_KEY: str = "cloud_it_service_portal_super_secret_jwt_key_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS Allowed Origins
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    model_config = SettingsConfigDict(
        # Looks for .env in current working directory or backend/
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        """
        Constructs the SQLAlchemy MySQL connection string:
        mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>
        """
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


# Global singleton instance of settings
settings = Settings()
