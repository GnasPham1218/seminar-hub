import os
import shutil
import json
import datetime
import glob
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from strawberry.fastapi import GraphQLRouter
from bson import json_util

from .schema import schema
from .database import get_context, db  # Import db để thao tác trực tiếp

# --- CẤU HÌNH ---
UPLOAD_DIR = "uploads"
BACKUP_DIR = "backups"  # Thư mục chứa file backup

for dir_path in [UPLOAD_DIR, BACKUP_DIR]:
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)

graphql_app = GraphQLRouter(schema, context_getter=get_context, graphiql=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router GraphQL
app.include_router(graphql_app, prefix="/graphql")

# Mount thư mục static để xem file PDF bài báo
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")


# --- API UPLOAD FILE BÀI BÁO (Giữ nguyên logic cũ) ---
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


# ============================================================
# 🚀 BACKUP & RESTORE API (Tương thích Frontend)
# ============================================================


@app.get("/api/backups")
async def list_backups():
    """Lấy danh sách các file backup hiện có."""
    files = []
    # Quét tất cả file .json trong thư mục backups
    file_paths = glob.glob(os.path.join(BACKUP_DIR, "*.json"))

    # Sắp xếp theo thời gian tạo mới nhất
    file_paths.sort(key=os.path.getmtime, reverse=True)

    for file_path in file_paths:
        stat = os.stat(file_path)
        filename = os.path.basename(file_path)

        # Xác định loại backup dựa trên tên (logic đơn giản)
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
    """
    Tạo backup: Dump toàn bộ collections ra file JSON.
    Sử dụng json_util để giữ lại kiểu dữ liệu MongoDB (ObjectId, Date).
    """
    try:
        collections = await db.list_collection_names()
        backup_data = {}

        for col_name in collections:
            cursor = db[col_name].find({})
            docs = await cursor.to_list(length=None)
            backup_data[col_name] = docs

        # Tạo tên file: backup_YYYY-MM-DD_HH-MM-SS.json
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"backup_{timestamp}.json"
        filepath = os.path.join(BACKUP_DIR, filename)

        # Ghi file (dùng json_util.dumps để xử lý BSON)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(json_util.dumps(backup_data, indent=2))

        return {"message": "Backup created successfully", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")


@app.post("/api/backups/restore/{filename}")
async def restore_backup(filename: str):
    """
    Phục hồi: Đọc file JSON, xóa dữ liệu cũ và insert dữ liệu từ file.
    """
    filepath = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Backup file not found")

    try:
        # 1. Đọc file backup
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            backup_data = json_util.loads(content)  # Convert JSON -> BSON types

        # 2. Xóa dữ liệu cũ và Insert dữ liệu mới
        # Lưu ý: Thứ tự quan trọng nếu có ràng buộc khóa ngoại (MongoDB ít bị hơn SQL)
        collection_names = await db.list_collection_names()

        # Xóa sạch dữ liệu hiện tại
        for col_name in collection_names:
            await db[col_name].delete_many({})

        # Insert dữ liệu từ backup
        for col_name, docs in backup_data.items():
            if docs:  # Chỉ insert nếu có dữ liệu
                await db[col_name].insert_many(docs)

        return {"message": f"Restored from {filename} successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")


@app.delete("/api/backups/{filename}")
async def delete_backup(filename: str):
    """Xóa file backup khỏi ổ cứng."""
    filepath = os.path.join(BACKUP_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return {"message": "Deleted successfully"}
    raise HTTPException(status_code=404, detail="File not found")


@app.get("/backups/download/{filename}")
async def download_backup(filename: str):
    """Tải file backup về máy."""
    filepath = os.path.join(BACKUP_DIR, filename)
    if os.path.exists(filepath):
        return FileResponse(
            path=filepath, filename=filename, media_type="application/json"
        )
    raise HTTPException(status_code=404, detail="File not found")


@app.post("/api/backups/upload")
async def upload_backup(file: UploadFile = File(...)):
    """Upload file backup từ máy lên server."""
    try:
        # Kiểm tra đuôi file (chỉ chấp nhận .json hoặc .sql tùy logic, ở đây ta dùng .json)
        if not file.filename.endswith(".json"):
            raise HTTPException(
                status_code=400,
                detail="Only .json files are allowed for this system restore",
            )

        file_location = f"{BACKUP_DIR}/{file.filename}"

        # Lưu file
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "API Quản lý Hội thảo Khoa học", "docs": "/graphql"}
