# Conference Management System API

Hệ thống quản lý hội thảo khoa học với GraphQL API, hỗ trợ quản lý người dùng, sự kiện, phiên họp, đăng ký, phản hồi và bài báo.

---

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Import dữ liệu mẫu](#import-dữ-liệu-mẫu)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [API Documentation](#api-documentation)
  - [User APIs](#1-user-apis)
  - [Event APIs](#2-event-apis)
  - [Session APIs](#3-session-apis)
  - [Registration APIs](#4-registration-apis)
  - [Feedback APIs](#5-feedback-apis)
  - [Paper APIs](#6-paper-apis)
  - [File Upload API](#7-file-upload-api)
  - [Backup & Restore APIs](#8-backup--restore-apis)

---

## 🔧 Yêu cầu hệ thống

- Python 3.8+
- MongoDB 4.0+
- pip (Python package manager)

---

## 📦 Cài đặt

### 1. Clone repository và tạo môi trường ảo

```bash
# Clone project (hoặc giải nén source code)
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Trên Windows:
venv\Scripts\activate
# Trên macOS/Linux:
source venv/bin/activate
```

### 2. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

**Nội dung file `requirements.txt`:**

```
annotated-doc==0.0.4
annotated-types==0.7.0
anyio==4.11.0
APScheduler==3.11.1
bcrypt==5.0.0
click==8.3.0
colorama==0.4.6
dnspython==2.8.0
exceptiongroup==1.3.0
fastapi==0.121.1
graphql-core==3.2.7
h11==0.16.0
idna==3.11
lia-web==0.2.3
motor==3.7.1
packaging==25.0
pydantic==2.12.4
pydantic-settings==2.12.0
pydantic_core==2.41.5
PyJWT==2.10.1
pymongo==4.15.4
python-dateutil==2.9.0.post0
python-dotenv==1.2.1
python-multipart==0.0.20
six==1.17.0
sniffio==1.3.1
starlette==0.49.3
strawberry-graphql==0.285.0
typing-inspection==0.4.2
typing_extensions==4.15.0
tzdata==2025.2
tzlocal==5.3.1
uvicorn==0.38.0

```

---

## ⚙️ Cấu hình

### Tạo file `.env` trong thư mục gốc:

```env
MONGO_DB_URI=mongodb://localhost:27017
MONGO_DB_NAME=QLSK
```

**Lưu ý:** Thay đổi `MONGO_DB_URI` và `MONGO_DB_NAME` theo cấu hình MongoDB của bạn.

---

## 📊 Import dữ liệu mẫu

Sau khi cài đặt xong, chạy script sau để tạo dữ liệu mẫu:

```bash
python import_data.py
```

Script này sẽ tạo:

- 10 users (admin, researcher, attendee)
- 5 events với các trạng thái khác nhau
- 10 sessions
- 15 registrations
- 20 feedbacks
- 12 papers

---

## 🚀 Chạy ứng dụng

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Ứng dụng sẽ chạy tại:

- **API:** http://localhost:8000
- **GraphQL Playground:** http://localhost:8000/graphql
- **Docs:** http://localhost:8000/docs

---

## 📚 API Documentation

### Authentication

Một số API yêu cầu xác thực bằng header:

```
X-User-ID: u001
```

---

## 1. USER APIs

### 1.1. Đăng nhập

```graphql
mutation {
  login(email: "admin@conference.com", password: "admin123") {
    id
    name
    email
    role
    organization
    phone
    registeredEvents
    createdAt
    updatedAt
  }
}
```

**Mô tả:** Xác thực người dùng bằng email và mật khẩu.

**Response:**

```json
{
  "data": {
    "login": {
      "id": "u001",
      "name": "Admin User",
      "email": "admin@conference.com",
      "role": "admin",
      "organization": "Conference Organizer",
      "phone": "+84901234567",
      "registeredEvents": [],
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### 1.2. Lấy danh sách Users (có phân trang)

```graphql
query {
  users(page: 1, limit: 10) {
    users {
      id
      name
      email
      role
      organization
      phone
      registeredEvents
      events {
        id
        title
        startDate
      }
    }
    pageInfo {
      totalCount
      totalPages
      currentPage
      limit
    }
  }
}
```

**Parameters:**

- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng kết quả mỗi trang (mặc định: 10)

**Nested field `events`:** Lấy thông tin chi tiết các sự kiện mà user đã đăng ký.

---

### 1.3. Lấy thông tin 1 User

```graphql
query {
  user(id: "u001") {
    id
    name
    email
    role
    organization
    phone
    registeredEvents
    events {
      id
      title
      startDate
      endDate
      location
    }
    createdAt
    updatedAt
  }
}
```

---

### 1.4. Tạo User mới

```graphql
mutation {
  createUser(
    input: {
      name: "Nguyen Van A"
      email: "nguyenvana@example.com"
      password: "password123"
      role: "attendee"
      organization: "ABC University"
      phone: "+84912345678"
    }
  ) {
    id
    name
    email
    role
    createdAt
  }
}
```

**Input fields:**

- `name`: Tên người dùng (bắt buộc)
- `email`: Email (bắt buộc, phải unique)
- `password`: Mật khẩu (bắt buộc, sẽ được hash)
- `role`: Vai trò - "admin" | "researcher" | "attendee" (bắt buộc)
- `organization`: Tổ chức (bắt buộc)
- `phone`: Số điện thoại (bắt buộc)

---

### 1.5. Cập nhật User

```graphql
mutation {
  updateUser(
    id: "u001"
    input: {
      name: "Updated Name"
      phone: "+84987654321"
      organization: "New Organization"
    }
  ) {
    id
    name
    phone
    organization
    updatedAt
  }
}
```

**Lưu ý:** Chỉ cập nhật các field được truyền vào, các field khác giữ nguyên.

---

### 1.6. Xóa User

```graphql
mutation {
  deleteUser(id: "u010")
}
```

**Response:** `true` nếu xóa thành công, `false` nếu không tìm thấy.

---

## 2. EVENT APIs

### 2.1. Lấy danh sách Events (có filter)

```graphql
query {
  events(page: 1, limit: 10, status: "upcoming", date: "2025-03") {
    events {
      id
      title
      description
      startDate
      endDate
      location
      organizerId
      maxParticipants
      currentParticipants
      fee
      status
      createdAt
      updatedAt
    }
    pageInfo {
      totalCount
      totalPages
      currentPage
      limit
    }
  }
}
```

**Filter parameters:**

- `status`: Lọc theo trạng thái - "upcoming" | "ongoing" | "completed" | "cancelled"
- `date`: Lọc theo ngày bắt đầu (format: "YYYY-MM-DD" hoặc "YYYY-MM")

**Ví dụ filter:**

```graphql
# Lấy tất cả events sắp diễn ra
events(status: "upcoming")

# Lấy events trong tháng 3/2025
events(date: "2025-03")

# Lấy events ngày cụ thể
events(date: "2025-03-15")

# Kết hợp cả 2
events(status: "upcoming", date: "2025-03")
```

---

### 2.2. Lấy thông tin 1 Event

```graphql
query {
  event(id: "e001") {
    id
    title
    description
    startDate
    endDate
    location
    organizerId
    maxParticipants
    currentParticipants
    fee
    status
    createdAt
    updatedAt
  }
}
```

---

### 2.3. Tạo Event mới

```graphql
mutation {
  createEvent(
    input: {
      title: "International AI Conference 2025"
      description: "Leading conference on Artificial Intelligence"
      startDate: "2025-06-15T09:00:00Z"
      endDate: "2025-06-17T18:00:00Z"
      location: "Hanoi Convention Center"
      organizerId: "u001"
      maxParticipants: 500
      fee: 2000000
      status: "upcoming"
    }
  ) {
    id
    title
    startDate
    endDate
    createdAt
  }
}
```

**Input fields:**

- `title`: Tiêu đề sự kiện (bắt buộc)
- `description`: Mô tả (bắt buộc)
- `startDate`: Ngày bắt đầu ISO 8601 (bắt buộc)
- `endDate`: Ngày kết thúc ISO 8601 (bắt buộc)
- `location`: Địa điểm (bắt buộc)
- `organizerId`: ID người tổ chức (bắt buộc)
- `maxParticipants`: Số người tối đa (bắt buộc)
- `fee`: Phí tham dự (bắt buộc, VNĐ)
- `status`: Trạng thái (mặc định: "upcoming")
- `currentParticipants`: Tự động = 0

**Cần header:** `X-User-ID`

---

### 2.4. Cập nhật Event

```graphql
mutation {
  updateEvent(
    id: "e001"
    input: {
      title: "Updated Conference Title"
      maxParticipants: 600
      status: "ongoing"
      fee: 2500000
    }
  ) {
    id
    title
    maxParticipants
    status
    fee
    updatedAt
  }
}
```

---

### 2.5. Xóa Event

```graphql
mutation {
  deleteEvent(id: "e005")
}
```

**Lưu ý:** Nên kiểm tra và xóa các sessions, registrations, feedbacks liên quan trước.

---

## 3. SESSION APIs

### 3.1. Lấy danh sách Sessions (có filter theo Event)

```graphql
query {
  sessions(page: 1, limit: 10, eventId: "e001") {
    sessions {
      id
      eventId
      title
      description
      speakerId
      startTime
      endTime
      room
      topics
      papers {
        id
        title
        authorIds
        status
      }
      createdAt
      updatedAt
    }
    pageInfo {
      totalCount
      totalPages
      currentPage
      limit
    }
  }
}
```

**Filter:**

- `eventId`: Lọc sessions theo sự kiện cụ thể

**Nested field `papers`:** Lấy danh sách bài báo được trình bày trong session này.

---

### 3.2. Lấy thông tin 1 Session

```graphql
query {
  session(id: "s001") {
    id
    eventId
    title
    description
    speakerId
    startTime
    endTime
    room
    topics
    papers {
      id
      title
      abstract
      authors {
        id
        name
        email
      }
    }
  }
}
```

---

### 3.3. Tạo Session mới

```graphql
mutation {
  createSession(
    input: {
      eventId: "e001"
      title: "Opening Keynote"
      description: "Welcome speech and introduction"
      speakerId: "u002"
      startTime: "2025-03-15T09:00:00Z"
      endTime: "2025-03-15T10:30:00Z"
      room: "Hall A"
      topics: ["AI", "Machine Learning", "Deep Learning"]
    }
  ) {
    id
    title
    startTime
    endTime
    room
  }
}
```

**Input fields:**

- `eventId`: ID sự kiện (bắt buộc)
- `title`: Tiêu đề phiên (bắt buộc)
- `description`: Mô tả (bắt buộc)
- `speakerId`: ID diễn giả (bắt buộc)
- `startTime`: Thời gian bắt đầu ISO 8601 (bắt buộc)
- `endTime`: Thời gian kết thúc ISO 8601 (bắt buộc)
- `room`: Phòng họp (bắt buộc)
- `topics`: Danh sách chủ đề (bắt buộc)

---

### 3.4. Cập nhật Session

```graphql
mutation {
  updateSession(
    id: "s001"
    input: {
      title: "Updated Session Title"
      room: "Hall B"
      startTime: "2025-03-15T10:00:00Z"
    }
  ) {
    id
    title
    room
    startTime
    updatedAt
  }
}
```

---

### 3.5. Xóa Session

```graphql
mutation {
  deleteSession(id: "s010")
}
```

---

## 4. REGISTRATION APIs

### 4.1. Lấy danh sách Registrations (có filter)

```graphql
query {
  registrations(page: 1, limit: 10, eventId: "e001", userId: "u003") {
    registrations {
      id
      eventId
      userId
      registrationDate
      status
      paymentStatus
      paymentAmount
      event {
        id
        title
        startDate
        location
      }
      user {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
    pageInfo {
      totalCount
      totalPages
      currentPage
      limit
    }
  }
}
```

**Filter parameters:**

- `eventId`: Lọc theo sự kiện
- `userId`: Lọc theo người dùng

**Nested fields:**

- `event`: Thông tin chi tiết sự kiện
- `user`: Thông tin chi tiết người đăng ký

**Ví dụ sử dụng:**

```graphql
# Lấy tất cả đăng ký của 1 event
registrations(eventId: "e001")

# Lấy tất cả đăng ký của 1 user
registrations(userId: "u003")

# Kết hợp cả 2
registrations(eventId: "e001", userId: "u003")
```

---

### 4.2. Lấy thông tin 1 Registration

```graphql
query {
  registration(id: "r001") {
    id
    eventId
    userId
    registrationDate
    status
    paymentStatus
    paymentAmount
    event {
      title
      startDate
      location
      fee
    }
    user {
      name
      email
      phone
    }
  }
}
```

---

### 4.3. Tạo Registration mới (Đăng ký tham dự)

```graphql
mutation {
  createRegistration(
    input: { eventId: "e001", paymentAmount: 2000000, paymentStatus: "pending" }
  ) {
    id
    eventId
    userId
    registrationDate
    status
    paymentStatus
    paymentAmount
    event {
      title
      currentParticipants
      maxParticipants
    }
  }
}
```

**Cần header:** `X-User-ID: u003`

**Input fields:**

- `eventId`: ID sự kiện muốn đăng ký (bắt buộc)
- `paymentAmount`: Số tiền thanh toán (bắt buộc)
- `paymentStatus`: Trạng thái thanh toán (mặc định: "pending")

**Tự động:**

- `userId`: Lấy từ header X-User-ID
- `status`: Tự động = "pending"
- `registrationDate`: Thời gian hiện tại
- Event `currentParticipants` tự động tăng 1
- User `registeredEvents` tự động thêm eventId

---

### 4.4. Cập nhật Registration (Admin xác nhận)

```graphql
mutation {
  updateRegistration(
    id: "r001"
    input: { status: "confirmed", paymentStatus: "paid" }
  ) {
    id
    status
    paymentStatus
    updatedAt
  }
}
```

**Status values:**

- `pending`: Chờ xử lý
- `confirmed`: Đã xác nhận

**PaymentStatus values:**

- `pending`: Chưa thanh toán
- `paid`: Đã thanh toán

---

### 4.5. Xóa Registration (Hủy đăng ký)

```graphql
mutation {
  deleteRegistration(id: "r015")
}
```

**Tự động:**

- Event `currentParticipants` giảm 1
- User `registeredEvents` xóa eventId tương ứng

---

## 5. FEEDBACK APIs

### 5.1. Lấy danh sách Feedbacks (có filter)

```graphql
query {
  feedbacks(page: 1, limit: 10, eventId: "e001") {
    feedbacks {
      id
      eventId
      userId
      sessionId
      rating
      comment
      user {
        id
        name
        email
      }
      createdAt
    }
    pageInfo {
      totalCount
      totalPages
      currentPage
      limit
    }
  }
}
```

**Filter:**

- `eventId`: Lọc feedback theo sự kiện

**Nested field `user`:** Thông tin người viết feedback

---

### 5.2. Lấy thông tin 1 Feedback

```graphql
query {
  feedback(id: "f001") {
    id
    eventId
    userId
    sessionId
    rating
    comment
    user {
      name
      email
      organization
    }
    createdAt
  }
}
```

---

### 5.3. Tạo Feedback mới

```graphql
mutation {
  createFeedback(
    input: {
      eventId: "e001"
      sessionId: "s001"
      rating: 5
      comment: "Excellent session! Very informative."
    }
  ) {
    id
    eventId
    sessionId
    rating
    comment
    createdAt
  }
}
```

**Cần header:** `X-User-ID: u003`

**Input fields:**

- `eventId`: ID sự kiện (bắt buộc)
- `sessionId`: ID phiên họp (bắt buộc)
- `rating`: Điểm đánh giá 1-5 (bắt buộc)
- `comment`: Nhận xét (optional)

**Validation:**

- Event phải có status = "completed"
- User phải có registration với status = "confirmed"
- User chỉ được feedback 1 lần cho mỗi session
- `userId`: Tự động lấy từ header

---

### 5.4. Cập nhật Feedback

```graphql
mutation {
  updateFeedback(
    id: "f001"
    input: { rating: 4, comment: "Updated: Good session overall." }
  ) {
    id
    rating
    comment
  }
}
```

---

### 5.5. Xóa Feedback

```graphql
mutation {
  deleteFeedback(id: "f020")
}
```

---

## 6. PAPER APIs

### 6.1. Lấy danh sách Papers

```graphql
query {
  papers(page: 1, limit: 10) {
    papers {
      id
      title
      authorIds
      abstract
      keywords
      fileUrl
      status
      sessionId
      eventId
      submissionDate
      authors {
        id
        name
        email
        organization
      }
      event {
        id
        title
        startDate
      }
      createdAt
      updatedAt
    }
    pageInfo {
      totalCount
      totalPages
      currentPage
      limit
    }
  }
}
```

**Nested fields:**

- `authors`: Danh sách tác giả chi tiết
- `event`: Thông tin sự kiện

---

### 6.2. Lấy thông tin 1 Paper

```graphql
query {
  paper(id: "p001") {
    id
    title
    authorIds
    abstract
    keywords
    fileUrl
    status
    sessionId
    eventId
    submissionDate
    authors {
      id
      name
      email
      organization
    }
  }
}
```

---

### 6.3. Nộp Paper mới

```graphql
mutation {
  createPaper(
    input: {
      title: "Deep Learning for Natural Language Processing"
      authorIds: ["u002"]
      abstract: "This paper presents a comprehensive study..."
      keywords: ["Deep Learning", "NLP", "Transformers"]
      fileUrl: "/static/paper_2025_01.pdf"
      status: "submitted"
      eventId: "e001"
      sessionId: null
    }
  ) {
    id
    title
    status
    submissionDate
    authors {
      name
      email
    }
  }
}
```

**Cần header:** `X-User-ID`

**Input fields:**

- `title`: Tiêu đề bài báo (bắt buộc)
- `authorIds`: Danh sách ID tác giả (bắt buộc)
- `abstract`: Tóm tắt (bắt buộc)
- `keywords`: Từ khóa (bắt buộc)
- `fileUrl`: Link file PDF (bắt buộc, upload trước qua `/upload`)
- `status`: Trạng thái - "submitted" | "under_review" | "approved" | "rejected"
- `eventId`: ID sự kiện (bắt buộc)
- `sessionId`: ID phiên (optional, admin gán sau)

**Phân quyền:**

- Chỉ **researcher** và **admin** mới được nộp bài
- Nếu là **researcher**: `authorIds` tự động = `[user_id]`
- Nếu là **admin**: có thể chỉ định `authorIds` tùy ý

---

### 6.4. Cập nhật Paper (Admin review hoặc tác giả sửa)

```graphql
mutation {
  updatePaper(id: "p001", input: { status: "approved", sessionId: "s001" }) {
    id
    status
    sessionId
    updatedAt
  }
}
```

**Admin có thể cập nhật:**

- `status`: Duyệt/từ chối bài
- `sessionId`: Gán bài vào session cụ thể

**Tác giả có thể cập nhật (trước khi duyệt):**

- `title`, `abstract`, `keywords`, `fileUrl`

---

### 6.5. Xóa Paper

```graphql
mutation {
  deletePaper(id: "p012")
}
```

---

## 7. FILE UPLOAD API

Upload file PDF/hình ảnh để lấy URL cho Paper hoặc Event.

### REST API Endpoint

```bash
POST http://localhost:8000/upload
Content-Type: multipart/form-data
```

**Curl example:**

```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@/path/to/your/paper.pdf"
```

**Response:**

```json
{
  "filename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf"
}
```

**Sử dụng:** Copy filename và dùng làm `fileUrl` khi tạo Paper:

```
fileUrl: "/static/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf"
```

---

## 8. BACKUP & RESTORE APIs

### 8.1. Lấy danh sách backups

```bash
GET http://localhost:8000/api/backups
```

**Response:**

```json
[
  {
    "filename": "backup_2025-01-15_14-30-00.json",
    "size": 1048576,
    "createdAt": "2025-01-15T14:30:00",
    "type": "manual"
  },
  {
    "filename": "backup_auto_2025-01-15_00-00-00.json",
    "size": 1024000,
    "createdAt": "2025-01-15T00:00:00",
    "type": "auto"
  }
]
```

---

### 8.2. Tạo backup thủ công

```bash
POST http://localhost:8000/api/backups/create
```

**Response:**

```json
{
  "message": "Backup created successfully",
  "filename": "backup_2025-01-15_15-45-30.json"
}
```

---

### 8.3. Lấy cấu hình lịch backup tự động

```bash
GET http://localhost:8000/api/backups/schedule
```

**Response:**

```json
{
  "enabled": true,
  "time": "00:00",
  "frequency": "daily"
}
```

---

### 8.4. Cập nhật lịch backup tự động

```bash
POST http://localhost:8000/api/backups/schedule
Content-Type: application/json

{
  "enabled": true,
  "time": "02:00",
  "frequency": "daily"
}
```

**Parameters:**

- `enabled`: true/false - Bật/tắt backup tự động
- `time`: "HH:MM" - Giờ chạy backup (24h format)
- `frequency`: "daily" - Tần suất (hiện tại chỉ hỗ trợ daily)

---

### 8.5. Restore từ backup

```bash
POST http://localhost:8000/api/backups/restore/{filename}
```

**Example:**

```bash
POST http://localhost:8000/api/backups/restore/backup_2025-01-15_14-30-00.json
```

**⚠️ Cảnh báo:** Thao tác này sẽ XÓA toàn bộ dữ liệu hiện tại và thay thế bằng backup!

---

### 8.6. Xóa backup

```bash
DELETE http://localhost:8000/api/backups/{filename}
```

---

### 8.7. Download backup

```bash
GET http://localhost:8000/backups/download/{filename}
```

**Response:** File JSON download

---

### 8.8. Upload backup từ file

```bash
POST http://localhost:8000/api/backups/upload
Content-Type: multipart/form-data
```

**Curl example:**

```bash
curl -X POST "http://localhost:8000/api/backups/upload" \
  -F "file=@backup_2025-01-15_14-30-00.json"
```

---

## 📖 Ví dụ Workflow thực tế

### Workflow 1: Người dùng đăng ký tham dự hội thảo

```graphql
# Bước 1: Tìm sự kiện phù hợp
query {
  events(status: "upcoming", page: 1, limit: 5) {
    events {
      id
      title
      startDate
      location
      fee
      maxParticipants
      currentParticipants
    }
  }
}

# Bước 2: Xem chi tiết sự kiện và sessions
query {
  event(id: "e001") {
    title
    description
    startDate
    endDate
    fee
  }
  sessions(eventId: "e001") {
    sessions {
      title
      startTime
      room
      topics
    }
  }
}

# Bước 3: Đăng ký (cần header X-User-ID: u003)
mutation {
  createRegistration(
    input: { eventId: "e001", paymentAmount: 2000000, paymentStatus: "pending" }
  ) {
    id
    status
    paymentStatus
  }
}

# Bước 4: Xem đăng ký của mình
query {
  registrations(userId: "u003") {
    registrations {
      id
      event {
        title
        startDate
      }
      status
      paymentStatus
    }
  }
}
```

---

### Workflow 2: Researcher nộp bài báo

```graphql
# Bước 1: Upload file PDF
# POST /upload với file

# Bước 2: Nộp paper (header X-User-ID: u002)
mutation {
  createPaper(
    input: {
      title: "Advanced Machine Learning Techniques"
      authorIds: ["u002"]
      abstract: "This research explores..."
      keywords: ["ML", "AI", "Deep Learning"]
      fileUrl: "/static/abc123-xyz.pdf"
      status: "submitted"
      eventId: "e001"
    }
  ) {
    id
    title
    status
    submissionDate
  }
}

# Bước 3: Kiểm tra trạng thái paper
query {
  paper(id: "p001") {
    id
    title
    status
    sessionId
    authors {
      name
      email
    }
  }
}
```

---

### Workflow 3: Admin quản lý hội thảo

```graphql
# Bước 1: Tạo sự kiện mới
mutation {
  createEvent(
    input: {
      title: "AI Summit 2025"
      description: "Annual AI conference"
      startDate: "2025-06-01T09:00:00Z"
      endDate: "2025-06-03T18:00:00Z"
      location: "HCMC Convention Center"
      organizerId: "u001"
      maxParticipants: 300
      fee: 1500000
      status: "upcoming"
    }
  ) {
    id
    title
  }
}

# Bước 2: Tạo sessions cho sự kiện
mutation {
  createSession(
    input: {
      eventId: "e006"
      title: "AI in Healthcare"
      description: "Applications of AI in medical diagnosis"
      speakerId: "u002"
      startTime: "2025-06-01T10:00:00Z"
      endTime: "2025-06-01T12:00:00Z"
      room: "Room 101"
      topics: ["AI", "Healthcare", "Medical Imaging"]
    }
  ) {
    id
    title
  }
}

# Bước 3: Xem danh sách papers chờ duyệt
query {
  papers(page: 1, limit: 20) {
    papers {
      id
      title
      status
      authors {
        name
        email
      }
    }
  }
}

# Bước 4: Duyệt paper và gán vào session
mutation {
  updatePaper(id: "p001", input: { status: "approved", sessionId: "s011" }) {
    id
    status
    sessionId
  }
}

# Bước 5: Xem danh sách đăng ký
query {
  registrations(eventId: "e006") {
    registrations {
      id
      user {
        name
        email
        phone
      }
      status
      paymentStatus
      paymentAmount
    }
    pageInfo {
      totalCount
    }
  }
}

# Bước 6: Xác nhận đăng ký đã thanh toán
mutation {
  updateRegistration(
    id: "r001"
    input: { status: "confirmed", paymentStatus: "paid" }
  ) {
    id
    status
  }
}

# Bước 7: Sau sự kiện, đổi status và xem feedback
mutation {
  updateEvent(id: "e006", input: { status: "completed" }) {
    id
    status
  }
}

query {
  feedbacks(eventId: "e006") {
    feedbacks {
      rating
      comment
      user {
        name
      }
      createdAt
    }
    pageInfo {
      totalCount
    }
  }
}
```

---

### Workflow 4: Người tham dự đánh giá sau sự kiện

```graphql
# Bước 1: Xem các sessions đã tham dự
query {
  sessions(eventId: "e001") {
    sessions {
      id
      title
      startTime
      room
    }
  }
}

# Bước 2: Gửi feedback (header X-User-ID: u003)
mutation {
  createFeedback(
    input: {
      eventId: "e001"
      sessionId: "s001"
      rating: 5
      comment: "Excellent presentation! Very insightful content."
    }
  ) {
    id
    rating
    comment
    createdAt
  }
}

# Bước 3: Xem feedback đã gửi
query {
  feedbacks(eventId: "e001") {
    feedbacks {
      sessionId
      rating
      comment
      createdAt
    }
  }
}
```

---

## 🔐 Phân quyền và Bảo mật

### Roles trong hệ thống:

1. **Admin** (`role: "admin"`)

   - Tạo/sửa/xóa Events, Sessions
   - Duyệt Papers
   - Xác nhận Registrations
   - Xem tất cả dữ liệu
   - Backup & Restore database

2. **Researcher** (`role: "researcher"`)

   - Nộp Papers
   - Đăng ký tham dự Events
   - Gửi Feedback
   - Xem Events, Sessions

3. **Attendee** (`role: "attendee"`)
   - Đăng ký tham dự Events
   - Gửi Feedback (sau khi tham dự)
   - Xem Events, Sessions

### Authentication Header:

```
X-User-ID: u001
```

**Lưu ý:** Đây là authentication đơn giản cho development. Production nên dùng JWT tokens.

---

## 🧪 Testing với GraphQL Playground

Truy cập: http://localhost:8000/graphql

### Setting Headers trong Playground:

```json
{
  "X-User-ID": "u001"
}
```

### Ví dụ query phức tạp:

```graphql
query GetCompleteEventInfo {
  event(id: "e001") {
    id
    title
    description
    startDate
    endDate
    location
    maxParticipants
    currentParticipants
    fee
    status
  }

  sessions(eventId: "e001") {
    sessions {
      id
      title
      startTime
      endTime
      room
      topics
      papers {
        id
        title
        authors {
          name
          email
        }
      }
    }
  }

  registrations(eventId: "e001") {
    registrations {
      id
      user {
        name
        email
      }
      status
      paymentStatus
    }
    pageInfo {
      totalCount
    }
  }

  feedbacks(eventId: "e001") {
    feedbacks {
      rating
      comment
      user {
        name
      }
    }
    pageInfo {
      totalCount
    }
  }
}
```

---

## 📊 Database Collections

Hệ thống sử dụng MongoDB với các collections:

1. **users** - Thông tin người dùng
2. **events** - Sự kiện hội thảo
3. **sessions** - Phiên họp trong sự kiện
4. **registrations** - Đăng ký tham dự
5. **feedbacks** - Đánh giá/phản hồi
6. **papers** - Bài báo/tham luận

### ID Format:

- User: `u001`, `u002`, ...
- Event: `e001`, `e002`, ...
- Session: `s001`, `s002`, ...
- Registration: `r001`, `r002`, ...
- Feedback: `f001`, `f002`, ...
- Paper: `p001`, `p002`, ...

---

## 🐛 Troubleshooting

### 1. Lỗi kết nối MongoDB

```
pymongo.errors.ServerSelectionTimeoutError: localhost:27017
```

**Giải pháp:**

- Kiểm tra MongoDB đang chạy: `mongod --version`
- Kiểm tra connection string trong `.env`
- Khởi động MongoDB: `sudo systemctl start mongod` (Linux) hoặc `brew services start mongodb-community` (macOS)

---

### 2. Lỗi import module

```
ModuleNotFoundError: No module named 'strawberry'
```

**Giải pháp:**

```bash
# Kích hoạt lại venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Cài lại dependencies
pip install -r requirements.txt
```

---

### 3. Lỗi "User already exists" khi import data

**Giải pháp:**

- Xóa database cũ:

```bash
mongo
> use conference_db
> db.dropDatabase()
> exit
```

- Chạy lại `python import_data.py`

---

### 4. Lỗi "Database not found in context"

**Giải pháp:**

- Đảm bảo đã khởi động server: `uvicorn src.main:app --reload`
- Kiểm tra file `.env` có đúng cấu hình

---

### 5. Lỗi feedback validation

```
ValueError: Bạn chưa tham gia hoặc vé chưa được xác nhận
```

**Giải pháp:**

- Đảm bảo user có registration với `status: "confirmed"`
- Event phải có `status: "completed"`
- User chưa feedback session đó trước đây

---

## 📈 Performance Tips

### 1. Sử dụng pagination hợp lý

```graphql
# ❌ Tránh lấy quá nhiều records
query {
  users(limit: 1000) { ... }
}

# ✅ Dùng pagination
query {
  users(page: 1, limit: 20) { ... }
}
```

### 2. Chỉ query fields cần thiết

```graphql
# ❌ Query tất cả fields không cần
query {
  users {
    users {
      id
      name
      email
      role
      organization
      phone
      registeredEvents
      createdAt
      updatedAt
    }
  }
}

# ✅ Chỉ lấy fields cần dùng
query {
  users {
    users {
      id
      name
      email
    }
  }
}
```

### 3. Sử dụng filter để giảm data transfer

```graphql
# ✅ Filter ngay từ query
query {
  events(status: "upcoming", date: "2025-03") {
    events {
      id
      title
      startDate
    }
  }
}
```

---

## 🔄 Migration và Backup Strategy

### Daily Backup Workflow:

1. **Tự động backup hàng ngày:**

   - Cấu hình trong Settings hoặc qua API
   - File backup lưu tại `backups/backup_auto_YYYY-MM-DD_HH-MM-SS.json`

2. **Manual backup trước khi thay đổi lớn:**

```bash
curl -X POST http://localhost:8000/api/backups/create
```

3. **Kiểm tra backups định kỳ:**

```bash
curl http://localhost:8000/api/backups
```

4. **Restore khi cần:**

```bash
curl -X POST http://localhost:8000/api/backups/restore/backup_2025-01-15.json
```

---

## 📝 Best Practices

### 1. Luôn kiểm tra quyền trước khi thao tác

```graphql
# ❌ Không kiểm tra
mutation {
  deleteEvent(id: "e001")
}

# ✅ Kiểm tra role trước (implement ở backend)
# Chỉ admin mới được xóa event
```

### 2. Validate input data

```graphql
# ❌ Không validate
mutation {
  createEvent(
    input: { title: "", startDate: "invalid-date", maxParticipants: -1 }
  )
}

# ✅ Validate đầy đủ
mutation {
  createEvent(
    input: {
      title: "AI Conference 2025"
      startDate: "2025-06-15T09:00:00Z"
      endDate: "2025-06-17T18:00:00Z"
      maxParticipants: 500
    }
  )
}
```

### 3. Xử lý errors gracefully

```javascript
// Frontend example
try {
  const result = await fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": "u001",
    },
    body: JSON.stringify({ query: "..." }),
  });

  const data = await result.json();

  if (data.errors) {
    console.error("GraphQL errors:", data.errors);
    // Handle errors
  }
} catch (error) {
  console.error("Network error:", error);
  // Handle network errors
}
```

---

## 🎯 Common Use Cases

### 1. Tìm tất cả events sắp diễn ra trong tháng này

```graphql
query {
  events(status: "upcoming", date: "2025-03", page: 1, limit: 10) {
    events {
      id
      title
      startDate
      location
      currentParticipants
      maxParticipants
    }
  }
}
```

### 2. Lấy tất cả papers của một tác giả

```graphql
query {
  papers(page: 1, limit: 50) {
    papers {
      id
      title
      status
      submissionDate
      authors {
        id
        name
      }
    }
  }
}

# Filter ở frontend theo authorIds
```

### 3. Thống kê feedback của một event

```graphql
query {
  feedbacks(eventId: "e001", page: 1, limit: 100) {
    feedbacks {
      rating
      comment
      sessionId
    }
    pageInfo {
      totalCount
    }
  }
}

# Tính average rating ở frontend
```

### 4. Xem lịch trình của user

```graphql
query {
  user(id: "u003") {
    name
    events {
      id
      title
      startDate
      endDate
      location
    }
  }
}
```

### 5. Tìm sessions theo chủ đề

```graphql
query {
  sessions(page: 1, limit: 50) {
    sessions {
      id
      title
      topics
      startTime
      room
    }
  }
}

# Filter ở frontend theo topics contains "AI"
```

---

## 🚀 Deployment Checklist

### Development → Production:

- [ ] Thay đổi MongoDB URI trong `.env`
- [ ] Implement JWT authentication thay vì X-User-ID header
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Add rate limiting
- [ ] Enable logging và monitoring
- [ ] Setup automated backups
- [ ] Add input validation middleware
- [ ] Implement role-based access control
- [ ] Add database indexes cho performance
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure production environment variables

---

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs server: Terminal chạy uvicorn
2. Kiểm tra MongoDB logs
3. Xem GraphQL errors trong Playground
4. Kiểm tra network tab trong DevTools

---

## 📄 License

MIT License - Free to use for educational and commercial purposes.

---

## 🎉 Credits

Developed for Conference Management System using:

- FastAPI
- Strawberry GraphQL
- MongoDB
- Motor (async MongoDB driver)

---
