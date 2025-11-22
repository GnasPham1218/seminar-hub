import os
import shutil
import json
import datetime
import glob
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from strawberry.fastapi import GraphQLRouter
from bson import json_util
from pydantic import BaseModel

# 👇 Import Scheduler
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from .schema import schema
from .database import get_context, db

# --- CẤU HÌNH ---
UPLOAD_DIR = "uploads"
BACKUP_DIR = "backups"
CONFIG_FILE = "backup_schedule.json"  # File lưu cấu hình lịch

for dir_path in [UPLOAD_DIR, BACKUP_DIR]:
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)

graphql_app = GraphQLRouter(schema, context_getter=get_context, graphiql=True)

app = FastAPI()

# Khởi tạo Scheduler
scheduler = AsyncIOScheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/graphql")
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")


# --- MODELS ---
class ScheduleConfig(BaseModel):
    enabled: bool
    time: str  # Format "HH:MM"
    frequency: str  # "daily" hoặc "weekly" (mặc định daily)


# --- HELPERS ---
def load_schedule_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    return {"enabled": False, "time": "00:00", "frequency": "daily"}


def save_schedule_config(config: dict):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f)


# --- BACKUP LOGIC (Tách ra để dùng chung) ---
async def perform_backup(auto=False):
    try:
        collections = await db.list_collection_names()
        backup_data = {}
        for col_name in collections:
            cursor = db[col_name].find({})
            docs = await cursor.to_list(length=None)
            backup_data[col_name] = docs

        prefix = "backup_auto" if auto else "backup"
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"{prefix}_{timestamp}.json"
        filepath = os.path.join(BACKUP_DIR, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(json_util.dumps(backup_data, indent=2))
        print(f"✅ [Auto-Backup] Created: {filename}")
        return filename
    except Exception as e:
        print(f"❌ [Auto-Backup] Failed: {e}")
        return None


# --- SCHEDULER SETUP ---
def update_scheduler_job():
    config = load_schedule_config()
    # Xóa job cũ nếu có
    if scheduler.get_job("auto_backup_job"):
        scheduler.remove_job("auto_backup_job")

    if config.get("enabled"):
        time_str = config.get("time", "00:00")
        hour, minute = map(int, time_str.split(":"))

        # Tạo trigger (Daily)
        trigger = CronTrigger(hour=hour, minute=minute)

        # Nếu weekly (ví dụ: thứ 2 hàng tuần) - Ở đây demo daily cho đơn giản
        # if config['frequency'] == 'weekly': trigger = CronTrigger(day_of_week='mon', hour=hour, minute=minute)

        scheduler.add_job(perform_backup, trigger, args=[True], id="auto_backup_job")
        print(f"🕒 Scheduled backup enabled at {time_str} daily")
    else:
        print("🕒 Scheduled backup disabled")


@app.on_event("startup")
async def start_scheduler():
    update_scheduler_job()
    scheduler.start()


# --- API UPLOAD (Giữ nguyên) ---
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        import uuid

        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_location = f"{UPLOAD_DIR}/{unique_filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": unique_filename}
    except Exception as e:
        return {"error": str(e)}


# --- BACKUP APIS ---


@app.get("/api/backups")
async def list_backups():
    files = []
    file_paths = glob.glob(os.path.join(BACKUP_DIR, "*.json"))
    file_paths.sort(key=os.path.getmtime, reverse=True)

    for file_path in file_paths:
        stat = os.stat(file_path)
        filename = os.path.basename(file_path)
        backup_type = "auto" if "auto" in filename else "manual"
        files.append(
            {
                "filename": filename,
                "size": stat.st_size,
                "createdAt": datetime.datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "type": backup_type,
            }
        )
    return files


@app.post("/api/backups/create")
async def create_backup():
    filename = await perform_backup(auto=False)
    if filename:
        return {"message": "Backup created successfully", "filename": filename}
    raise HTTPException(status_code=500, detail="Backup failed")


# 👇 API MỚI: Lấy cấu hình lịch
@app.get("/api/backups/schedule")
async def get_schedule():
    return load_schedule_config()


# 👇 API MỚI: Lưu cấu hình lịch
@app.post("/api/backups/schedule")
async def set_schedule(config: ScheduleConfig):
    try:
        save_schedule_config(config.dict())
        update_scheduler_job()  # Cập nhật lại job ngay lập tức
        return {"message": "Schedule updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/backups/restore/{filename}")
async def restore_backup(filename: str):
    filepath = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Backup file not found")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            backup_data = json_util.loads(content)

        collection_names = await db.list_collection_names()
        for col_name in collection_names:
            await db[col_name].delete_many({})

        for col_name, docs in backup_data.items():
            if docs:
                await db[col_name].insert_many(docs)
        return {"message": f"Restored from {filename} successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")


@app.delete("/api/backups/{filename}")
async def delete_backup(filename: str):
    filepath = os.path.join(BACKUP_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return {"message": "Deleted successfully"}
    raise HTTPException(status_code=404, detail="File not found")


@app.get("/backups/download/{filename}")
async def download_backup(filename: str):
    filepath = os.path.join(BACKUP_DIR, filename)
    if os.path.exists(filepath):
        return FileResponse(
            path=filepath, filename=filename, media_type="application/json"
        )
    raise HTTPException(status_code=404, detail="File not found")


@app.post("/api/backups/upload")
async def upload_backup(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".json"):
            raise HTTPException(status_code=400, detail="Only .json files are allowed")
        file_location = f"{BACKUP_DIR}/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "API Quản lý Hội thảo Khoa học", "docs": "/graphql"}
