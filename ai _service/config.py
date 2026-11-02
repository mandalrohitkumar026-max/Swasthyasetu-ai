import os
from pydantic import BaseModel

class Settings(BaseModel):
    HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    SERVICE_NAME: str = "SwasthyaSetu AI Intelligence Core"
    VERSION: str = "1.0.0"
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5000",
    ]
    ENABLE_DEBUG: bool = os.getenv("AI_DEBUG", "True").lower() == "true"

settings = Settings()
