from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    telegram_bot_token: str = ""
    telegram_bot_username: str = "EnchantedPawsBot"
    secret_key: str = "dev_secret_change_in_production_minimum_32_chars"
    database_url: str = "sqlite:///./enchanted_paws.db"
    frontend_url: str = "http://localhost:5173"
    groq_api_key: str = ""
    payment_provider_token: str = ""
    environment: str = "development"
    debug: bool = True

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
