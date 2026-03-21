from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/profdnk"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 часа

    # Admin
    ADMIN_EMAIL: str = "admin@profdnk.ru"
    ADMIN_PASSWORD: str = "admin123"

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # Project
    PROJECT_NAME: str = "ПрофДНК API"
    API_V1_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()