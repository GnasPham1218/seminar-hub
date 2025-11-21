import os
from typing import Optional
from fastapi import Header
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_db_uri: str
    mongo_db_name: str
    
    class Config:
        env_file = ".env"


settings = Settings()

# Khởi tạo client 1 lần
client = AsyncIOMotorClient(settings.mongo_db_uri)
db: AsyncIOMotorDatabase = client[settings.mongo_db_name]


# Hàm này sẽ được dùng bởi Strawberry để "tiêm" (inject) db vào resolvers
async def get_context(user_id: Optional[str] = Header(None, alias="X-User-ID")):
    return {"db": db, "user_id": user_id}
