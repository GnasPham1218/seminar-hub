# src/schema.py

import math
import strawberry
from strawberry.types import Info
from typing import List, Optional, Callable, Tuple, Any, Type
from .utils import get_pagination

# Import Pydantic models & CRUD
from .models import (
    User,
    Event,
    Session,
    Registration,
    Feedback,
    Paper,
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
from . import crud
from .database import AsyncIOMotorDatabase

# Context type for resolvers (Info[Root, Context])
Context = Info[None, dict[str, AsyncIOMotorDatabase]]

# -----------------------
# Helper functions
# -----------------------


def _to_type(pydantic_cls: Type[Any], data: dict, type_cls: Type[Any]) -> Any:
    # 1. Validate và convert dữ liệu bằng Pydantic
    pydantic_obj = pydantic_cls(**data)

    # 2. Chuyển dữ liệu thành dictionary
    data_dict = pydantic_obj.model_dump()

    # 3. --- BƯỚC QUAN TRỌNG: LỌC DỮ LIỆU ---
    # Chỉ lấy những field nào thực sự tồn tại trong GraphQL Type (type_cls)
    # Điều này sẽ tự động loại bỏ 'password' hoặc các field thừa khác
    valid_fields = type_cls.__annotations__.keys()
    clean_data = {k: v for k, v in data_dict.items() if k in valid_fields}

    # 4. Trả về object GraphQL với dữ liệu đã làm sạch
    return type_cls(**clean_data)


async def _resolve_paginated(
    db,
    crud_fetch_fn: Callable[..., Any],
    pydantic_cls: Type[Any],
    type_cls: Type[Any],
    page: int,
    limit: int,
) -> Tuple[List[Any], int, int]:
    """
    Generic pagination resolver:
    - crud_fetch_fn: async function(db, skip, limit) -> (list_of_dicts, total_count)
    Returns: (list_of_converted_items, total_count, total_pages)
    """
    page, limit, skip = get_pagination(page, limit)
    items_data, total_count = await crud_fetch_fn(db, skip=skip, limit=limit)
    total_pages = math.ceil(total_count / limit) if limit > 0 else 1
    items = [_to_type(pydantic_cls, d, type_cls) for d in items_data]
    return items, total_count, total_pages


async def _resolve_one(
    db,
    crud_get_fn: Callable[..., Any],
    pydantic_cls: Type[Any],
    type_cls: Type[Any],
    id: str,
) -> Optional[Any]:
    data = await crud_get_fn(db, id)
    if data:
        return _to_type(pydantic_cls, data, type_cls)
    return None


def get_db(info: Context) -> AsyncIOMotorDatabase:
    """Utility to get DB from context - raises helpful error if missing."""
    try:
        return info.context["db"]
    except Exception as e:
        raise Exception(
            "Database not found in context. Make sure you add 'db' to context."
        ) from e


# -----------------------
# Strawberry GraphQL Types
# -----------------------


@strawberry.type
class UserType:
    id: str
    name: str
    email: str
    role: str
    organization: str
    phone: str
    registered_events: List[str]
    created_at: str
    updated_at: str


@strawberry.type
class EventType:
    id: str
    title: str
    description: str
    start_date: str
    end_date: str
    location: str
    organizer_id: str
    max_participants: int
    current_participants: int
    status: str
    created_at: str
    updated_at: str


@strawberry.type
class SessionType:
    id: str
    event_id: str
    title: str
    description: str
    speaker_id: str
    start_time: str
    end_time: str
    room: str
    topics: List[str]
    created_at: str
    updated_at: str


@strawberry.type
class RegistrationType:
    id: str
    event_id: str
    user_id: str
    registration_date: str
    status: str
    payment_status: str
    payment_amount: int
    created_at: str
    updated_at: str


@strawberry.type
class FeedbackType:
    id: str
    event_id: str
    user_id: str
    rating: int
    created_at: str
    session_id: Optional[str]
    comment: Optional[str]


@strawberry.type
class PaperType:
    id: str
    title: str
    author_ids: List[str]
    abstract: str
    keywords: List[str]
    file_url: str
    status: str
    submission_date: str
    created_at: str
    updated_at: str
    session_id: Optional[str]


# -----------------------
# Pagination Types
# -----------------------


@strawberry.type
class PageInfo:
    total_count: int
    total_pages: int
    current_page: int
    limit: int


@strawberry.type
class UserPage:
    users: List[UserType]
    page_info: PageInfo


@strawberry.type
class EventPage:
    events: List[EventType]
    page_info: PageInfo


@strawberry.type
class SessionPage:
    sessions: List[SessionType]
    page_info: PageInfo


@strawberry.type
class RegistrationPage:
    registrations: List[RegistrationType]
    page_info: PageInfo


@strawberry.type
class FeedbackPage:
    feedbacks: List[FeedbackType]
    page_info: PageInfo


@strawberry.type
class PaperPage:
    papers: List[PaperType]
    page_info: PageInfo


# -----------------------
# Query Root
# -----------------------


@strawberry.type
class Query:

    # --- Users ---
    @strawberry.field
    async def users(self, info: Context, page: int = 1, limit: int = 10) -> UserPage:
        db = get_db(info)
        items, total_count, total_pages = await _resolve_paginated(
            db, crud.get_users, User, UserType, page, limit
        )
        page_info = PageInfo(
            total_count=total_count,
            total_pages=total_pages,
            current_page=page,
            limit=limit,
        )
        return UserPage(users=items, page_info=page_info)

    @strawberry.field
    async def user(self, info: Context, id: str) -> Optional[UserType]:
        return await _resolve_one(get_db(info), crud.get_user_by_id, User, UserType, id)

    # --- Events ---
    @strawberry.field
    async def events(self, info: Context, page: int = 1, limit: int = 10) -> EventPage:
        db = get_db(info)
        items, total_count, total_pages = await _resolve_paginated(
            db, crud.get_events, Event, EventType, page, limit
        )
        page_info = PageInfo(
            total_count=total_count,
            total_pages=total_pages,
            current_page=page,
            limit=limit,
        )
        return EventPage(events=items, page_info=page_info)

    @strawberry.field
    async def event(self, info: Context, id: str) -> Optional[EventType]:
        return await _resolve_one(
            get_db(info), crud.get_event_by_id, Event, EventType, id
        )

    # --- Sessions ---
    @strawberry.field
    async def sessions(
        self, info: Context, page: int = 1, limit: int = 10
    ) -> SessionPage:
        db = get_db(info)
        items, total_count, total_pages = await _resolve_paginated(
            db, crud.get_sessions, Session, SessionType, page, limit
        )
        page_info = PageInfo(
            total_count=total_count,
            total_pages=total_pages,
            current_page=page,
            limit=limit,
        )
        return SessionPage(sessions=items, page_info=page_info)

    @strawberry.field
    async def session(self, info: Context, id: str) -> Optional[SessionType]:
        return await _resolve_one(
            get_db(info), crud.get_session_by_id, Session, SessionType, id
        )

    # --- Registrations ---
    @strawberry.field
    async def registrations(
        self,
        info: Context,
        page: int = 1,
        limit: int = 10,
        event_id: Optional[str] = None,  # <--- Thêm dòng này
        user_id: Optional[str] = None,  # <--- Thêm dòng này
    ) -> RegistrationPage:
        db = get_db(info)

        # Tính toán phân trang (giữ nguyên logic cũ, chỉ cần gọi hàm crud mới)
        page_num, limit_num, skip = get_pagination(page, limit)

        # Gọi hàm crud đã sửa ở Bước 1
        items_data, total_count = await crud.get_registrations(
            db, skip=skip, limit=limit_num, event_id=event_id, user_id=user_id
        )

        total_pages = math.ceil(total_count / limit_num) if limit_num > 0 else 1
        items = [_to_type(Registration, d, RegistrationType) for d in items_data]

        page_info = PageInfo(
            total_count=total_count,
            total_pages=total_pages,
            current_page=page,
            limit=limit,
        )
        return RegistrationPage(registrations=items, page_info=page_info)

    @strawberry.field
    async def registration(self, info: Context, id: str) -> Optional[RegistrationType]:
        return await _resolve_one(
            get_db(info),
            crud.get_registration_by_id,
            Registration,
            RegistrationType,
            id,
        )

    # --- Feedbacks ---
    @strawberry.field
    async def feedbacks(
        self, info: Context, page: int = 1, limit: int = 10
    ) -> FeedbackPage:
        db = get_db(info)
        items, total_count, total_pages = await _resolve_paginated(
            db, crud.get_feedbacks, Feedback, FeedbackType, page, limit
        )
        page_info = PageInfo(
            total_count=total_count,
            total_pages=total_pages,
            current_page=page,
            limit=limit,
        )
        return FeedbackPage(feedbacks=items, page_info=page_info)

    @strawberry.field
    async def feedback(self, info: Context, id: str) -> Optional[FeedbackType]:
        return await _resolve_one(
            get_db(info), crud.get_feedback_by_id, Feedback, FeedbackType, id
        )

    # --- Papers ---
    @strawberry.field
    async def papers(self, info: Context, page: int = 1, limit: int = 10) -> PaperPage:
        db = get_db(info)
        items, total_count, total_pages = await _resolve_paginated(
            db, crud.get_papers, Paper, PaperType, page, limit
        )
        page_info = PageInfo(
            total_count=total_count,
            total_pages=total_pages,
            current_page=page,
            limit=limit,
        )
        return PaperPage(papers=items, page_info=page_info)

    @strawberry.field
    async def paper(self, info: Context, id: str) -> Optional[PaperType]:
        return await _resolve_one(
            get_db(info), crud.get_paper_by_id, Paper, PaperType, id
        )


# -----------------------
# Mutation Root
# -----------------------


@strawberry.type
class Mutation:

    # --- User Mutations ---
    @strawberry.mutation
    async def login(self, info: Context, email: str, password: str) -> UserType:
        db = get_db(info)
        user_data = await crud.login_user(db, email, password)
        if not user_data:
            raise ValueError("Email hoặc mật khẩu không đúng")
        return _to_type(User, user_data, UserType)

    @strawberry.mutation
    async def create_user(self, info: Context, input: CreateUserInput) -> UserType:
        db = get_db(info)
        new_user = await crud.create_user(db, input)
        return _to_type(User, new_user, UserType)

    @strawberry.mutation
    async def update_user(
        self, info: Context, id: str, input: UpdateUserInput
    ) -> Optional[UserType]:
        db = get_db(info)
        updated = await crud.update_user(db, id, input)
        if updated:
            return _to_type(User, updated, UserType)
        return None

    @strawberry.mutation
    async def delete_user(self, info: Context, id: str) -> bool:
        return await crud.delete_user(get_db(info), id)

    # --- Event Mutations ---
    @strawberry.mutation
    async def create_event(self, info: Context, input: CreateEventInput) -> EventType:
        db = get_db(info)
        user_id = info.context.get("user_id")
        data = await crud.create_event(db, input, user_id=user_id)
        return _to_type(Event, data, EventType)

    @strawberry.mutation
    async def update_event(
        self, info: Context, id: str, input: UpdateEventInput
    ) -> Optional[EventType]:
        db = get_db(info)
        data = await crud.update_event(db, id, input)
        if data:
            return _to_type(Event, data, EventType)
        return None

    @strawberry.mutation
    async def delete_event(self, info: Context, id: str) -> bool:
        return await crud.delete_event(get_db(info), id)

    # --- Session Mutations ---
    @strawberry.mutation
    async def create_session(
        self, info: Context, input: CreateSessionInput
    ) -> SessionType:
        db = get_db(info)
        data = await crud.create_session(db, input)
        return _to_type(Session, data, SessionType)

    @strawberry.mutation
    async def update_session(
        self, info: Context, id: str, input: UpdateSessionInput
    ) -> Optional[SessionType]:
        db = get_db(info)
        data = await crud.update_session(db, id, input)
        if data:
            return _to_type(Session, data, SessionType)
        return None

    @strawberry.mutation
    async def delete_session(self, info: Context, id: str) -> bool:
        return await crud.delete_session(get_db(info), id)

    # --- Registration Mutations ---
    @strawberry.mutation
    async def create_registration(
        self, info: Context, input: CreateRegistrationInput
    ) -> RegistrationType:
        db = get_db(info)

        # Authentication: prefer user_id from auth middleware/context.
        # If you have middleware (JWT) that sets info.context["user_id"], use that.
        user_id = info.context.get("user_id")
        if not user_id:
            # For development/testing fallback - change/remove in production.
            user_id = "u000"

        data = await crud.create_registration(db, input, user_id=user_id)
        return _to_type(Registration, data, RegistrationType)

    @strawberry.mutation
    async def update_registration(
        self, info: Context, id: str, input: UpdateRegistrationInput
    ) -> Optional[RegistrationType]:
        db = get_db(info)
        data = await crud.update_registration(db, id, input)
        if data:
            return _to_type(Registration, data, RegistrationType)
        return None

    @strawberry.mutation
    async def delete_registration(self, info: Context, id: str) -> bool:
        return await crud.delete_registration(get_db(info), id)

    # --- Feedback Mutations ---
    @strawberry.mutation
    async def create_feedback(
        self, info: Context, input: CreateFeedbackInput
    ) -> FeedbackType:
        db = get_db(info)
        user_id = info.context.get("user_id")
        if not user_id:
            user_id = "u000"

        data = await crud.create_feedback(db, input, user_id=user_id)
        return _to_type(Feedback, data, FeedbackType)

    @strawberry.mutation
    async def update_feedback(
        self, info: Context, id: str, input: UpdateFeedbackInput
    ) -> Optional[FeedbackType]:
        db = get_db(info)
        data = await crud.update_feedback(db, id, input)
        if data:
            return _to_type(Feedback, data, FeedbackType)
        return None

    @strawberry.mutation
    async def delete_feedback(self, info: Context, id: str) -> bool:
        return await crud.delete_feedback(get_db(info), id)

    # --- Paper Mutations ---
    @strawberry.mutation
    async def create_paper(self, info: Context, input: CreatePaperInput) -> PaperType:
        db = get_db(info)
        data = await crud.create_paper(db, input)
        return _to_type(Paper, data, PaperType)

    @strawberry.mutation
    async def update_paper(
        self, info: Context, id: str, input: UpdatePaperInput
    ) -> Optional[PaperType]:
        db = get_db(info)
        data = await crud.update_paper(db, id, input)
        if data:
            return _to_type(Paper, data, PaperType)
        return None

    @strawberry.mutation
    async def delete_paper(self, info: Context, id: str) -> bool:
        return await crud.delete_paper(get_db(info), id)


# -----------------------
# Schema initialization
# -----------------------

schema = strawberry.Schema(query=Query, mutation=Mutation)
