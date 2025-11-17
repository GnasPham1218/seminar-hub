from bcrypt import hashpw, gensalt, checkpw
import datetime
def hash_password(password: str) -> str:

    # Mã hóa password thô (str) sang bytes
    password_bytes = password.encode("utf-8")

    # Băm và giải mã (decode) hash bytes về lại string
    return hashpw(password_bytes, gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Chuyển về bytes
    plain_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")

    # So sánh bằng bcrypt
    return checkpw(plain_bytes, hashed_bytes)

def get_iso_now() -> str:
    """Trả về chuỗi ISO 8601 thời gian UTC hiện tại."""
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def get_pagination(page: int, limit: int) -> tuple[int, int, int]:
    """Hàm tiện ích xử lý logic phân trang."""
    if page < 1:
        page = 1
    if limit < 1:
        limit = 1
    skip = (page - 1) * limit
    return page, limit, skip