from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    dynamodb_table_name: str = "stickgen_animations"
    api_url: str = "http://localhost:8000"
    node_env: str = "development"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()