import os
import shutil
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from .schema import schema
from .database import get_context
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
import uuid

# --- 1. CẤU HÌNH THƯ MỤC UPLOAD ---
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
graphql_app = GraphQLRouter(schema, context_getter=get_context, graphiql=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Origin của Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Gắn router GraphQL vào app FastAPI
app.include_router(graphql_app, prefix="/graphql")
# Giúp truy cập file qua đường dẫn: http://localhost:8000/static/ten_file.pdf
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")


# --- 4. API UPLOAD FILE (REST API) ---
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Lấy đuôi file (ví dụ: .pdf)
        file_extension = os.path.splitext(file.filename)[1]
        # Tạo tên ngẫu nhiên: e.g., "f47ac10b-58cc-4372-a567-0e02b2c3d479.pdf"
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        file_location = f"{UPLOAD_DIR}/{unique_filename}"

        # Lưu file từ bộ nhớ xuống ổ cứng
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": unique_filename}
    except Exception as e:
        return {"error": str(e)}


@app.get("/")
async def root():
    return {"message": "API Quản lý Hội thảo Khoa học", "docs": "/graphql"}
