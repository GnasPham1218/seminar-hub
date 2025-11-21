from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import (
    CreateUserInput,
    UpdateUserInput,
    CreateEventInput,
    UpdateEventInput,
    CreateSessionInput,
    UpdateSessionInput,
    CreateRegistrationInput,
    UpdateRegistrationInput,
    CreateFeedbackInput,
    UpdateFeedbackInput,
    CreatePaperInput,
    UpdatePaperInput,
)
from typing import List, Dict, Any
import strawberry
import asyncio
from .utils import *
import datetime


USER_COLLECTION = "users"


async def login_user(
    db: AsyncIOMotorDatabase, email: str, password: str
) -> Dict[str, Any] | None:
    user = await db[USER_COLLECTION].find_one({"email": email})
    if user and verify_password(password, user["password"]):
        user = dict(user)
        user["id"] = user["_id"]  # Strawberry dùng "id" thay vì "_id"
        if "password" in user:
            del user["password"]
        return user
    return None


async def get_users(
    db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 10
) -> tuple[List[Dict[str, Any]], int]:
    users_cursor = db[USER_COLLECTION].find().skip(skip).limit(limit)
    users_task = users_cursor.to_list(length=limit)
    count_task = db[USER_COLLECTION].count_documents({})

    users, total_count = await asyncio.gather(users_task, count_task)
    return users, total_count


async def get_user_by_id(
    db: AsyncIOMotorDatabase, user_id: str
) -> Dict[str, Any] | None:
    user = await db[USER_COLLECTION].find_one({"_id": user_id})
    return user


async def create_user(
    db: AsyncIOMotorDatabase, user_in: CreateUserInput
) -> Dict[str, Any]:

    # Get the last user ID and increment
    last_user = await db[USER_COLLECTION].find_one(sort=[("_id", -1)])
    if last_user:
        last_id = last_user["_id"]
        num = int(last_id[1:]) + 1
        new_id = f"u{num:03d}"
    else:
        new_id = "u001"

    user_data = user_in.__dict__
    user_data["_id"] = new_id
    user_data["password"] = hash_password(user_data["password"])
    user_data["registered_events"] = []
    now = datetime.datetime.now(datetime.timezone.utc)
    now_str = get_iso_now()
    user_data["created_at"] = now_str
    user_data["updated_at"] = now_str  # Khi tạo mới, created_at == updated_at
    await db[USER_COLLECTION].insert_one(user_data)
    return user_data


async def update_user(
    db: AsyncIOMotorDatabase, user_id: str, user_in: UpdateUserInput
) -> Dict[str, Any] | None:
    update_data = strawberry.asdict(user_in)
    update_data = {k: v for k, v in update_data.items() if v is not strawberry.UNSET}

    # 1. Hash mật khẩu nếu có
    if "password" in update_data:
        new_password = update_data["password"]
        if new_password:
            update_data["password"] = hash_password(new_password)
        else:
            del update_data["password"]

    # 2. Kiểm tra xem có gì để cập nhật không
    if not update_data:
        return await get_user_by_id(db, user_id)

    # 3. Cập nhật DB
    result = await db[USER_COLLECTION].update_one(
        {"_id": user_id}, {"$set": update_data}
    )

    # 4. Trả về
    if result.matched_count:
        return await get_user_by_id(db, user_id)
    return None


async def delete_user(db: AsyncIOMotorDatabase, user_id: str) -> bool:
    result = await db[USER_COLLECTION].delete_one({"_id": user_id})
    return result.deleted_count > 0


# --- 🚀 CRUD cho Event ---

EVENT_COLLECTION = "events"


async def get_events(
    db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 10
) -> tuple[List[Dict[str, Any]], int]:
    """Lấy danh sách các sự kiện (phân trang)."""
    events_cursor = db[EVENT_COLLECTION].find().skip(skip).limit(limit)
    events_task = events_cursor.to_list(length=limit)
    count_task = db[EVENT_COLLECTION].count_documents({})

    events, total_count = await asyncio.gather(events_task, count_task)
    return events, total_count


async def get_event_by_id(
    db: AsyncIOMotorDatabase, event_id: str
) -> Dict[str, Any] | None:
    """Lấy một sự kiện bằng ID."""
    event = await db[EVENT_COLLECTION].find_one({"_id": event_id})
    return event


async def create_event(
    db: AsyncIOMotorDatabase, event_in: CreateEventInput, user_id: str
) -> Dict[str, Any]:
    """Tạo một sự kiện mới."""
    last_event = await db[EVENT_COLLECTION].find_one(sort=[("_id", -1)])
    if last_event:
        last_id = last_event["_id"]
        num = int(last_id[1:]) + 1
        new_id = f"e{num:03d}"
    else:
        new_id = "e001"

    event_data = event_in.__dict__
    event_data["_id"] = new_id
    event_data["organizer_id"] = user_id

    now_str = get_iso_now()
    event_data["created_at"] = now_str
    event_data["updated_at"] = now_str

    await db[EVENT_COLLECTION].insert_one(event_data)
    return event_data


async def update_event(
    db: AsyncIOMotorDatabase, event_id: str, event_in: UpdateEventInput
) -> Dict[str, Any] | None:
    """Cập nhật một sự kiện."""
    update_data = strawberry.asdict(event_in)
    update_data = {k: v for k, v in update_data.items() if v is not strawberry.UNSET}

    if not update_data:
        return await get_event_by_id(db, event_id)

    # Tự động cập nhật 'updated_at'
    update_data["updated_at"] = get_iso_now()

    result = await db[EVENT_COLLECTION].update_one(
        {"_id": event_id}, {"$set": update_data}
    )

    if result.matched_count:
        return await get_event_by_id(db, event_id)
    return None


async def delete_event(db: AsyncIOMotorDatabase, event_id: str) -> bool:
    """Xóa một sự kiện."""
    result = await db[EVENT_COLLECTION].delete_one({"_id": event_id})
    return result.deleted_count > 0


# --- 📅 CRUD cho Session ---

SESSION_COLLECTION = "sessions"


async def get_sessions(
    db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 10
) -> tuple[List[Dict[str, Any]], int]:
    """Lấy danh sách các phiên (phân trang)."""
    sessions_cursor = db[SESSION_COLLECTION].find().skip(skip).limit(limit)
    sessions_task = sessions_cursor.to_list(length=limit)
    count_task = db[SESSION_COLLECTION].count_documents({})

    sessions, total_count = await asyncio.gather(sessions_task, count_task)
    return sessions, total_count


async def get_session_by_id(
    db: AsyncIOMotorDatabase, session_id: str
) -> Dict[str, Any] | None:
    """Lấy một phiên bằng ID."""
    session = await db[SESSION_COLLECTION].find_one({"_id": session_id})
    return session


async def create_session(
    db: AsyncIOMotorDatabase, session_in: CreateSessionInput
) -> Dict[str, Any]:
    """Tạo một phiên mới."""
    last_session = await db[SESSION_COLLECTION].find_one(sort=[("_id", -1)])
    if last_session:
        last_id = last_session["_id"]
        num = int(last_id[1:]) + 1
        new_id = f"s{num:03d}"
    else:
        new_id = "s001"

    session_data = session_in.__dict__
    session_data["_id"] = new_id

    now_str = get_iso_now()
    session_data["created_at"] = now_str
    session_data["updated_at"] = now_str

    await db[SESSION_COLLECTION].insert_one(session_data)
    return session_data


async def update_session(
    db: AsyncIOMotorDatabase, session_id: str, session_in: UpdateSessionInput
) -> Dict[str, Any] | None:
    """Cập nhật một phiên."""
    update_data = strawberry.asdict(session_in)
    update_data = {k: v for k, v in update_data.items() if v is not strawberry.UNSET}

    if not update_data:
        return await get_session_by_id(db, session_id)

    update_data["updated_at"] = get_iso_now()

    result = await db[SESSION_COLLECTION].update_one(
        {"_id": session_id}, {"$set": update_data}
    )

    if result.matched_count:
        return await get_session_by_id(db, session_id)
    return None


async def delete_session(db: AsyncIOMotorDatabase, session_id: str) -> bool:
    """Xóa một phiên."""
    result = await db[SESSION_COLLECTION].delete_one({"_id": session_id})
    return result.deleted_count > 0


# --- 🎟️ CRUD cho Registration ---

REGISTRATION_COLLECTION = "registrations"


# src/crud.py

# ... (các import giữ nguyên)


async def get_registrations(
    db: AsyncIOMotorDatabase,
    skip: int = 0,
    limit: int = 10,
    event_id: str = None,  # <--- Thêm tham số này
    user_id: str = None,  # <--- Thêm tham số này
) -> tuple[List[Dict[str, Any]], int]:

    # 1. Tạo bộ lọc query
    filter_query = {}
    if event_id:
        filter_query["event_id"] = event_id
    if user_id:
        filter_query["user_id"] = user_id

    # 2. Truyền filter_query vào find() và count_documents()
    registrations_cursor = (
        db[REGISTRATION_COLLECTION].find(filter_query).skip(skip).limit(limit)
    )
    registrations_task = registrations_cursor.to_list(length=limit)
    count_task = db[REGISTRATION_COLLECTION].count_documents(
        filter_query
    )  # <--- Nhớ thêm filter vào đây để đếm đúng

    registrations, total_count = await asyncio.gather(registrations_task, count_task)
    return registrations, total_count


async def get_registration_by_id(
    db: AsyncIOMotorDatabase, registration_id: str
) -> Dict[str, Any] | None:
    """Lấy một đăng ký bằng ID."""
    registration = await db[REGISTRATION_COLLECTION].find_one({"_id": registration_id})
    return registration


async def create_registration(
    db: AsyncIOMotorDatabase,
    registration_in: CreateRegistrationInput,
    user_id: str,  # Lấy từ context (user login)
) -> Dict[str, Any]:
    """Tạo một đăng ký mới."""
    last_reg = await db[REGISTRATION_COLLECTION].find_one(sort=[("_id", -1)])
    if last_reg:
        last_id = last_reg["_id"]
        num = int(last_id[1:]) + 1
        new_id = f"r{num:03d}"
    else:
        new_id = "r001"

    registration_data = registration_in.__dict__
    registration_data["_id"] = new_id

    # Các trường được set ở server theo ghi chú model
    registration_data["user_id"] = user_id
    registration_data["status"] = "pending"  # Hoặc "pending_payment" tùy logic

    now_str = get_iso_now()
    registration_data["registration_date"] = now_str
    registration_data["created_at"] = now_str
    registration_data["updated_at"] = now_str

    await db[REGISTRATION_COLLECTION].insert_one(registration_data)

    # TODO: Lý tưởng, bạn nên tăng 'current_participants' của Event
    await db[EVENT_COLLECTION].update_one(
        {"_id": registration_data["event_id"]}, {"$inc": {"current_participants": 1}}
    )

    return registration_data


async def update_registration(
    db: AsyncIOMotorDatabase,
    registration_id: str,
    registration_in: UpdateRegistrationInput,
) -> Dict[str, Any] | None:
    """Cập nhật một đăng ký (thường là status)."""
    update_data = strawberry.asdict(registration_in)
    update_data = {k: v for k, v in update_data.items() if v is not strawberry.UNSET}

    if not update_data:
        return await get_registration_by_id(db, registration_id)

    update_data["updated_at"] = get_iso_now()

    result = await db[REGISTRATION_COLLECTION].update_one(
        {"_id": registration_id}, {"$set": update_data}
    )

    if result.matched_count:
        return await get_registration_by_id(db, registration_id)
    return None


async def delete_registration(db: AsyncIOMotorDatabase, registration_id: str) -> bool:
    """Xóa một đăng ký."""
    # TODO: Cân nhắc: khi xóa, bạn có nên giảm
    # 'current_participants' của Event không?
    reg = await get_registration_by_id(db, registration_id)
    if reg:
        await db[EVENT_COLLECTION].update_one(
            {"_id": reg["event_id"]}, {"$inc": {"current_participants": -1}}
        )

    result = await db[REGISTRATION_COLLECTION].delete_one({"_id": registration_id})
    return result.deleted_count > 0


# --- ⭐ CRUD cho Feedback ---

FEEDBACK_COLLECTION = "feedbacks"


async def get_feedbacks(
    db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 10
) -> tuple[List[Dict[str, Any]], int]:
    """Lấy danh sách feedback (phân trang)."""
    feedbacks_cursor = db[FEEDBACK_COLLECTION].find().skip(skip).limit(limit)
    feedbacks_task = feedbacks_cursor.to_list(length=limit)
    count_task = db[FEEDBACK_COLLECTION].count_documents({})

    feedbacks, total_count = await asyncio.gather(feedbacks_task, count_task)
    return feedbacks, total_count


async def get_feedback_by_id(
    db: AsyncIOMotorDatabase, feedback_id: str
) -> Dict[str, Any] | None:
    """Lấy một feedback bằng ID."""
    feedback = await db[FEEDBACK_COLLECTION].find_one({"_id": feedback_id})
    return feedback


async def create_feedback(
    db: AsyncIOMotorDatabase,
    feedback_in: CreateFeedbackInput,
    user_id: str,  # Lấy từ context
) -> Dict[str, Any]:
    """Tạo một feedback mới."""
    last_feedback = await db[FEEDBACK_COLLECTION].find_one(sort=[("_id", -1)])
    if last_feedback:
        last_id = last_feedback["_id"]
        num = int(last_id[1:]) + 1
        new_id = f"f{num:03d}"
    else:
        new_id = "f001"

    feedback_data = feedback_in.__dict__
    feedback_data["_id"] = new_id

    # Trường set ở server
    feedback_data["user_id"] = user_id
    feedback_data["created_at"] = get_iso_now()
    # Model Feedback không có 'updated_at'

    await db[FEEDBACK_COLLECTION].insert_one(feedback_data)
    return feedback_data


async def update_feedback(
    db: AsyncIOMotorDatabase, feedback_id: str, feedback_in: UpdateFeedbackInput
) -> Dict[str, Any] | None:
    """Cập nhật một feedback."""
    update_data = strawberry.asdict(feedback_in)
    update_data = {k: v for k, v in update_data.items() if v is not strawberry.UNSET}

    if not update_data:
        return await get_feedback_by_id(db, feedback_id)

    # Model Pydantic 'Feedback' không có trường 'updated_at',
    # vì vậy chúng ta không cập nhật nó.

    result = await db[FEEDBACK_COLLECTION].update_one(
        {"_id": feedback_id}, {"$set": update_data}
    )

    if result.matched_count:
        return await get_feedback_by_id(db, feedback_id)
    return None


async def delete_feedback(db: AsyncIOMotorDatabase, feedback_id: str) -> bool:
    """Xóa một feedback."""
    result = await db[FEEDBACK_COLLECTION].delete_one({"_id": feedback_id})
    return result.deleted_count > 0


# --- 📄 CRUD cho Paper ---

PAPER_COLLECTION = "papers"


async def get_papers(
    db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 10
) -> tuple[List[Dict[str, Any]], int]:
    """Lấy danh sách bài báo (phân trang)."""
    papers_cursor = db[PAPER_COLLECTION].find().skip(skip).limit(limit)
    papers_task = papers_cursor.to_list(length=limit)
    count_task = db[PAPER_COLLECTION].count_documents({})

    papers, total_count = await asyncio.gather(papers_task, count_task)
    return papers, total_count


async def get_paper_by_id(
    db: AsyncIOMotorDatabase, paper_id: str
) -> Dict[str, Any] | None:
    """Lấy một bài báo bằng ID."""
    paper = await db[PAPER_COLLECTION].find_one({"_id": paper_id})
    return paper


async def create_paper(
    db: AsyncIOMotorDatabase, paper_in: CreatePaperInput
) -> Dict[str, Any]:
    """Tạo (nộp) một bài báo mới."""
    last_paper = await db[PAPER_COLLECTION].find_one(sort=[("_id", -1)])
    if last_paper:
        last_id = last_paper["_id"]
        num = int(last_id[1:]) + 1
        new_id = f"p{num:03d}"
    else:
        new_id = "p001"

    paper_data = paper_in.__dict__
    paper_data["_id"] = new_id

    # # Các trường set ở server
    # paper_data["status"] = "submitted"
    # paper_data["session_id"] = None  # Sẽ được gán sau

    now_str = get_iso_now()
    paper_data["submission_date"] = now_str
    paper_data["created_at"] = now_str
    paper_data["updated_at"] = now_str

    await db[PAPER_COLLECTION].insert_one(paper_data)
    return paper_data


async def update_paper(
    db: AsyncIOMotorDatabase, paper_id: str, paper_in: UpdatePaperInput
) -> Dict[str, Any] | None:
    """Cập nhật một bài báo (bởi user hoặc admin)."""
    update_data = strawberry.asdict(paper_in)
    update_data = {k: v for k, v in update_data.items() if v is not strawberry.UNSET}

    if not update_data:
        return await get_paper_by_id(db, paper_id)

    update_data["updated_at"] = get_iso_now()

    result = await db[PAPER_COLLECTION].update_one(
        {"_id": paper_id}, {"$set": update_data}
    )

    if result.matched_count:
        return await get_paper_by_id(db, paper_id)
    return None


async def delete_paper(db: AsyncIOMotorDatabase, paper_id: str) -> bool:
    """Xóa một bài báo."""
    result = await db[PAPER_COLLECTION].delete_one({"_id": paper_id})
    return result.deleted_count > 0
