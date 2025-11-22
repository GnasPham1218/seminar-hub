from pydantic import BaseModel, Field
from typing import Optional, List
import strawberry

# --- Pydantic Models (Tương ứng với MongoDB) ---
# Sử dụng 'id: str' làm alias cho '_id' trong MongoDB


class User(BaseModel):
    # Sử dụng _id trực tiếp để khớp với document từ Motor
    id: str = Field(alias="_id")
    name: str
    email: str
    password: Optional[str] = None
    role: str
    organization: str
    phone: str
    registered_events: List[str]
    created_at: str
    updated_at: str


class Event(BaseModel):
    id: str = Field(alias="_id")
    title: str
    fee: int
    description: str
    start_date: str
    end_date: str
    location: str
    organizer_id: str
    max_participants: int
    current_participants: int
    fee: Optional[int] = 0
    status: str
    created_at: str
    updated_at: str


class Session(BaseModel):
    id: str = Field(alias="_id")
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


class Registration(BaseModel):

    id: str = Field(alias="_id")
    event_id: str
    user_id: str
    registration_date: str
    status: str
    payment_status: str
    payment_amount: int
    created_at: str
    updated_at: str


class Feedback(BaseModel):

    id: str = Field(alias="_id")
    event_id: str
    user_id: str
    rating: int
    created_at: str

    # Phản hồi có thể cho cả sự kiện (session_id = None) hoặc một phiên cụ thể
    session_id: Optional[str] = None
    # Người dùng có thể chỉ đánh giá sao mà không bình luận
    comment: Optional[str] = None


class Paper(BaseModel):
    id: str = Field(alias="_id")
    title: str
    author_ids: List[str]
    abstract: str
    keywords: List[str]
    file_url: str
    status: str
    submission_date: str
    created_at: str
    updated_at: str

    # Bài báo có thể được nộp cho sự kiện nói chung trước khi được gán vào một phiên
    session_id: Optional[str] = None


@strawberry.input
class CreateUserInput:
    name: str
    email: str
    role: str
    organization: str
    phone: str
    password: str


@strawberry.input
class UpdateUserInput:
    name: Optional[str] = strawberry.UNSET
    email: Optional[str] = strawberry.UNSET
    role: Optional[str] = strawberry.UNSET
    organization: Optional[str] = strawberry.UNSET
    phone: Optional[str] = strawberry.UNSET
    password: Optional[str] = strawberry.UNSET


@strawberry.input
class CreateEventInput:
    title: str
    fee: int
    description: str
    start_date: str
    end_date: str
    location: str
    organizer_id: str  # Thường sẽ là user đang login
    max_participants: int
    status: Optional[str] = "upcoming"
    current_participants: Optional[int] = 0


@strawberry.input
class UpdateEventInput:
    """Input để cập nhật thông tin một Event đã có."""

    fee: Optional[int] = strawberry.UNSET
    title: Optional[str] = strawberry.UNSET
    description: Optional[str] = strawberry.UNSET
    start_date: Optional[str] = strawberry.UNSET
    end_date: Optional[str] = strawberry.UNSET
    location: Optional[str] = strawberry.UNSET
    max_participants: Optional[int] = strawberry.UNSET
    status: Optional[str] = strawberry.UNSET
    organizer_id: Optional[str] = strawberry.UNSET
    # organizer_id và current_participants thường không được cập nhật trực tiếp
    # current_participants sẽ thay đổi khi có đăng ký mới


# --- Input cho Session ---


@strawberry.input
class CreateSessionInput:
    """Input để tạo một Session mới cho một Event."""

    event_id: str
    title: str
    description: str
    speaker_id: str
    start_time: str
    end_time: str
    room: str
    topics: List[str]
    # id, created_at, updated_at sẽ được tạo tự động


@strawberry.input
class UpdateSessionInput:
    """Input để cập nhật một Session."""

    title: Optional[str] = strawberry.UNSET
    description: Optional[str] = strawberry.UNSET
    speaker_id: Optional[str] = strawberry.UNSET
    start_time: Optional[str] = strawberry.UNSET
    end_time: Optional[str] = strawberry.UNSET
    room: Optional[str] = strawberry.UNSET
    topics: Optional[List[str]] = strawberry.UNSET
    # event_id không nên thay đổi


# --- Input cho Registration ---


@strawberry.input
class CreateRegistrationInput:
    """Input để tạo một lượt đăng ký Event mới."""

    event_id: str
    payment_amount: int
    payment_status: Optional[str] = "pending"
    # user_id sẽ được lấy từ context (người dùng đang login)
    # id, registration_date, status, created_at, updated_at sẽ được set ở server


@strawberry.input
class UpdateRegistrationInput:
    """
    Input để cập nhật trạng thái đăng ký (thường dùng cho Admin
    hoặc webhook thanh toán).
    """

    status: Optional[str] = strawberry.UNSET
    payment_status: Optional[str] = strawberry.UNSET
    # user_id và event_id không được thay đổi


# --- Input cho Feedback ---


@strawberry.input
class CreateFeedbackInput:
    """Input để tạo một Feedback mới."""

    event_id: str
    rating: int
    session_id: Optional[str] = None
    comment: Optional[str] = None
    # user_id sẽ được lấy từ context (người dùng đang login)
    # id, created_at sẽ được set ở server


@strawberry.input
class UpdateFeedbackInput:
    """Input để người dùng cập nhật Feedback của họ."""

    rating: Optional[int] = strawberry.UNSET
    comment: Optional[str] = strawberry.UNSET
    # Các trường id, user_id, event_id, session_id không được thay đổi


# --- Input cho Paper ---


@strawberry.input
class CreatePaperInput:
    """Input để nộp một bài báo (Paper)."""

    title: str
    author_ids: List[str]  # Bao gồm id của người nộp (lấy từ context)
    abstract: str
    keywords: List[str]
    file_url: str
    status: str
    session_id: str
    # id, status ('submitted'), submission_date, created_at, updated_at
    # sẽ được set ở server
    # session_id sẽ được gán sau bởi admin


@strawberry.input
class UpdatePaperInput:
    """Input để cập nhật thông tin Paper."""

    # Các trường người dùng có thể tự sửa đổi (trước khi duyệt)
    title: Optional[str] = strawberry.UNSET
    author_ids: Optional[List[str]] = strawberry.UNSET
    abstract: Optional[str] = strawberry.UNSET
    keywords: Optional[List[str]] = strawberry.UNSET
    file_url: Optional[str] = strawberry.UNSET

    # Các trường Admin/Reviewer có thể cập nhật
    status: Optional[str] = strawberry.UNSET
    session_id: Optional[str] = strawberry.UNSET  # Gán paper vào 1 session
