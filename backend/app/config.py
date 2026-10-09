"""
BondBack — Application Settings
Loaded from environment variables / .env file via pydantic-settings.
"""
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── AI ──────────────────────────────────────────────────────────────────
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    ai_provider: str = "mock"  # "anthropic" | "openai" | "mock"

    # ── Security ─────────────────────────────────────────────────────────────
    jwt_secret_key: str = "dev-secret-CHANGE-ME"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    internal_api_key: str = "bondback-dev-api-key-change-in-production"

    # ── Rate Limits ───────────────────────────────────────────────────────────
    rate_limit_upload: str = "10/minute"
    rate_limit_analyze: str = "20/minute"
    rate_limit_global: str = "200/minute"

    # ── File Upload ───────────────────────────────────────────────────────────
    max_upload_size_mb: int = 20
    allowed_mime_types: str = "image/jpeg,image/png,image/webp,image/heic,application/pdf,text/plain"

    # ── Storage ───────────────────────────────────────────────────────────────
    upload_dir: str = "./uploads"
    log_dir: str = "./logs"

    # ── CORS ─────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:3000,http://localhost:3001"

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"
    log_level: str = "DEBUG"

    @property
    def allowed_mime_list(self) -> List[str]:
        return [m.strip() for m in self.allowed_mime_types.split(",")]

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def upload_path(self) -> Path:
        p = Path(self.upload_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def log_path(self) -> Path:
        p = Path(self.log_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
