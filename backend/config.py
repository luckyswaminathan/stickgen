from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "stickgenusers"
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    dynamodb_table_name: str = "stickgen_animations"
    api_url: str = "http://localhost:8000"
    node_env: str = "development"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

