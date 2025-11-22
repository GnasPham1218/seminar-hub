import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_DB_URI")
DB_NAME = os.getenv("MONGO_DB_NAME")

# Sử dụng PyMongo (sync) cho script import 1 lần
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print(f"Kết nối tới MongoDB (DB: {DB_NAME})...")

# Xóa collection cũ để tránh trùng lặp
print("Đang xóa collections cũ...")
for collection_name in db.list_collection_names():
    db[collection_name].drop()

# Mở file JSON
with open("dbQLSK.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Import từng collection
for collection_name, documents in data.items():
    if documents:
        print(f"Importing {len(documents)} tài liệu vào collection '{collection_name}'...")
        db[collection_name].insert_many(documents)
    else:
        print(f"Skipping empty collection '{collection_name}'")

print("\nHoàn tất import dữ liệu!")
client.close()