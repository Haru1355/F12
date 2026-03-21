from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/profdnk"
    SECRET_KEY: str = "super-secret-key-123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ADMIN_EMAIL: str = "admin@profdnk.ru"
    ADMIN_PASSWORD: str = "admin123"
    FRONTEND_URL: str = "http://localhost:5173"
    PROJECT_NAME: str = "ПрофДНК API"
    API_V1_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()