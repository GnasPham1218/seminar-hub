# Scientific Conference Management API - User Guide

Comprehensive guide for using the GraphQL API to manage scientific conferences, including users, events, sessions, registrations, feedback, and papers.

## Table of Contents

- [Setup](#setup)
- [API Endpoint](#api-endpoint)
- [Users API](#users-api)
- [Events API](#events-api)
- [Sessions API](#sessions-api)
- [Registrations API](#registrations-api)
- [Feedback API](#feedback-api)
- [Papers API](#papers-api)

---

## Setup

### Prerequisites

- Python 3.8+
- MongoDB
- Required packages: `fastapi`, `strawberry-graphql`, `motor`, `bcrypt`, `pydantic-settings`

### Installation

1. **Install dependencies:**

```bash
pip install fastapi strawberry-graphql[fastapi] motor bcrypt pydantic-settings uvicorn
```

2. **Create `.env` file:**

```env
MONGO_DB_URI=mongodb://localhost:27017
MONGO_DB_NAME=scientific_conference_db
```

3. **Run the application:**

```bash
uvicorn main:app --reload
```

### API Endpoint

- **GraphQL Playground:** `http://localhost:8000/graphql`
- **Root endpoint:** `http://localhost:8000/`

---

## Users API

### 1. Get Users (Paginated)

**Query:**

```graphql
query GetUsers($page: Int = 1, $limit: Int = 10) {
  users(page: $page, limit: $limit) {
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
    pageInfo {
      totalCount
      totalPages
      currentPage
      limit
    }
  }
}
```

**Variables:**

```json
{
  "page": 1,
  "limit": 10
}
```

**Example Response:**

```json
{
  "data": {
    "users": {
      "users": [
        {
          "id": "u001",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "researcher",
          "organization": "MIT",
          "phone": "+1234567890",
          "registeredEvents": ["e001", "e002"],
          "createdAt": "2025-01-15T10:30:00Z",
          "updatedAt": "2025-01-15T10:30:00Z"
        }
      ],
      "pageInfo": {
        "totalCount": 25,
        "totalPages": 3,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
}
```

### 2. Get User by ID

**Query:**

```graphql
query GetUser($id: String!) {
  user(id: $id) {
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

**Variables:**

```json
{
  "id": "u001"
}
```

### 3. Create User

**Mutation:**

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
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

**Variables:**

```json
{
  "input": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securePassword123",
    "role": "researcher",
    "organization": "Stanford University",
    "phone": "+1987654321"
  }
}
```

**Example Response:**

```json
{
  "data": {
    "createUser": {
      "id": "u002",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "researcher",
      "organization": "Stanford University",
      "phone": "+1987654321",
      "registeredEvents": [],
      "createdAt": "2025-01-16T14:20:00Z",
      "updatedAt": "2025-01-16T14:20:00Z"
    }
  }
}
```

### 4. Update User

**Mutation:**

```graphql
mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
    role
    organization
    phone
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "u001",
  "input": {
    "name": "John Doe Updated",
    "phone": "+1111111111"
  }
}
```

### 5. Delete User

**Mutation:**

```graphql
mutation DeleteUser($id: String!) {
  deleteUser(id: $id)
}
```

**Variables:**

```json
{
  "id": "u001"
}
```

**Response:**

```json
{
  "data": {
    "deleteUser": true
  }
}
```

---

## Events API

### 1. Get Events (Paginated)

**Query:**

```graphql
query GetEvents($page: Int = 1, $limit: Int = 10) {
  events(page: $page, limit: $limit) {
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

**Variables:**

```json
{
  "page": 1,
  "limit": 10
}
```

**Example Response:**

```json
{
  "data": {
    "events": {
      "events": [
        {
          "id": "e001",
          "title": "AI in Healthcare Conference 2025",
          "description": "International conference on AI applications in healthcare",
          "startDate": "2025-06-15T09:00:00Z",
          "endDate": "2025-06-17T18:00:00Z",
          "location": "Boston, MA",
          "organizerId": "u001",
          "maxParticipants": 500,
          "currentParticipants": 234,
          "status": "upcoming",
          "createdAt": "2025-01-10T08:00:00Z",
          "updatedAt": "2025-01-15T12:00:00Z"
        }
      ],
      "pageInfo": {
        "totalCount": 15,
        "totalPages": 2,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
}
```

### 2. Get Event by ID

**Query:**

```graphql
query GetEvent($id: String!) {
  event(id: $id) {
    id
    title
    description
    startDate
    endDate
    location
    organizerId
    maxParticipants
    currentParticipants
    status
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "e001"
}
```

### 3. Create Event

**Mutation:**

```graphql
mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
    title
    description
    startDate
    endDate
    location
    organizerId
    maxParticipants
    currentParticipants
    status
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "title": "Machine Learning Summit 2025",
    "description": "Advanced machine learning techniques and applications",
    "startDate": "2025-09-10T09:00:00Z",
    "endDate": "2025-09-12T17:00:00Z",
    "location": "San Francisco, CA",
    "organizerId": "u001",
    "maxParticipants": 300,
    "status": "upcoming",
    "currentParticipants": 0
  }
}
```

**Headers Required:**

```
X-User-ID: u001
```

### 4. Update Event

**Mutation:**

```graphql
mutation UpdateEvent($id: String!, $input: UpdateEventInput!) {
  updateEvent(id: $id, input: $input) {
    id
    title
    description
    location
    maxParticipants
    status
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "e001",
  "input": {
    "title": "AI in Healthcare Conference 2025 - Updated",
    "maxParticipants": 600,
    "status": "ongoing"
  }
}
```

### 5. Delete Event

**Mutation:**

```graphql
mutation DeleteEvent($id: String!) {
  deleteEvent(id: $id)
}
```

**Variables:**

```json
{
  "id": "e001"
}
```

---

## Sessions API

### 1. Get Sessions (Paginated)

**Query:**

```graphql
query GetSessions($page: Int = 1, $limit: Int = 10) {
  sessions(page: $page, limit: $limit) {
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

**Example Response:**

```json
{
  "data": {
    "sessions": {
      "sessions": [
        {
          "id": "s001",
          "eventId": "e001",
          "title": "Deep Learning in Medical Imaging",
          "description": "Latest advances in applying deep learning to medical image analysis",
          "speakerId": "u002",
          "startTime": "2025-06-15T10:00:00Z",
          "endTime": "2025-06-15T11:30:00Z",
          "room": "Hall A",
          "topics": ["Deep Learning", "Medical Imaging", "Computer Vision"],
          "createdAt": "2025-01-12T09:00:00Z",
          "updatedAt": "2025-01-12T09:00:00Z"
        }
      ],
      "pageInfo": {
        "totalCount": 45,
        "totalPages": 5,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
}
```

### 2. Get Session by ID

**Query:**

```graphql
query GetSession($id: String!) {
  session(id: $id) {
    id
    eventId
    title
    description
    speakerId
    startTime
    endTime
    room
    topics
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "s001"
}
```

### 3. Create Session

**Mutation:**

```graphql
mutation CreateSession($input: CreateSessionInput!) {
  createSession(input: $input) {
    id
    eventId
    title
    description
    speakerId
    startTime
    endTime
    room
    topics
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "eventId": "e001",
    "title": "Natural Language Processing for Healthcare",
    "description": "NLP techniques for processing medical records and clinical notes",
    "speakerId": "u003",
    "startTime": "2025-06-15T14:00:00Z",
    "endTime": "2025-06-15T15:30:00Z",
    "room": "Hall B",
    "topics": ["NLP", "Healthcare", "Text Mining"]
  }
}
```

### 4. Update Session

**Mutation:**

```graphql
mutation UpdateSession($id: String!, $input: UpdateSessionInput!) {
  updateSession(id: $id, input: $input) {
    id
    title
    room
    startTime
    endTime
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "s001",
  "input": {
    "room": "Main Auditorium",
    "startTime": "2025-06-15T10:30:00Z"
  }
}
```

### 5. Delete Session

**Mutation:**

```graphql
mutation DeleteSession($id: String!) {
  deleteSession(id: $id)
}
```

**Variables:**

```json
{
  "id": "s001"
}
```

---

## Registrations API

### 1. Get Registrations (Paginated)

**Query:**

```graphql
query GetRegistrations($page: Int = 1, $limit: Int = 10) {
  registrations(page: $page, limit: $limit) {
    registrations {
      id
      eventId
      userId
      registrationDate
      status
      paymentStatus
      paymentAmount
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

**Example Response:**

```json
{
  "data": {
    "registrations": {
      "registrations": [
        {
          "id": "r001",
          "eventId": "e001",
          "userId": "u002",
          "registrationDate": "2025-01-14T15:30:00Z",
          "status": "confirmed",
          "paymentStatus": "completed",
          "paymentAmount": 250,
          "createdAt": "2025-01-14T15:30:00Z",
          "updatedAt": "2025-01-14T16:00:00Z"
        }
      ],
      "pageInfo": {
        "totalCount": 234,
        "totalPages": 24,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
}
```

### 2. Get Registration by ID

**Query:**

```graphql
query GetRegistration($id: String!) {
  registration(id: $id) {
    id
    eventId
    userId
    registrationDate
    status
    paymentStatus
    paymentAmount
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "r001"
}
```

### 3. Create Registration

**Mutation:**

```graphql
mutation CreateRegistration($input: CreateRegistrationInput!) {
  createRegistration(input: $input) {
    id
    eventId
    userId
    registrationDate
    status
    paymentStatus
    paymentAmount
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "eventId": "e001",
    "paymentAmount": 250,
    "paymentStatus": "pending"
  }
}
```

**Headers Required:**

```
X-User-ID: u002
```

**Note:** The `userId` is automatically extracted from the `X-User-ID` header.

### 4. Update Registration

**Mutation:**

```graphql
mutation UpdateRegistration($id: String!, $input: UpdateRegistrationInput!) {
  updateRegistration(id: $id, input: $input) {
    id
    status
    paymentStatus
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "r001",
  "input": {
    "status": "confirmed",
    "paymentStatus": "completed"
  }
}
```

### 5. Delete Registration

**Mutation:**

```graphql
mutation DeleteRegistration($id: String!) {
  deleteRegistration(id: $id)
}
```

**Variables:**

```json
{
  "id": "r001"
}
```

**Note:** Deleting a registration automatically decrements the `currentParticipants` count for the associated event.

---

## Feedback API

### 1. Get Feedbacks (Paginated)

**Query:**

```graphql
query GetFeedbacks($page: Int = 1, $limit: Int = 10) {
  feedbacks(page: $page, limit: $limit) {
    feedbacks {
      id
      eventId
      userId
      rating
      sessionId
      comment
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

**Example Response:**

```json
{
  "data": {
    "feedbacks": {
      "feedbacks": [
        {
          "id": "f001",
          "eventId": "e001",
          "userId": "u002",
          "rating": 5,
          "sessionId": "s001",
          "comment": "Excellent presentation! Very informative and well-structured.",
          "createdAt": "2025-06-17T20:00:00Z"
        }
      ],
      "pageInfo": {
        "totalCount": 156,
        "totalPages": 16,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
}
```

### 2. Get Feedback by ID

**Query:**

```graphql
query GetFeedback($id: String!) {
  feedback(id: $id) {
    id
    eventId
    userId
    rating
    sessionId
    comment
    createdAt
  }
}
```

**Variables:**

```json
{
  "id": "f001"
}
```

### 3. Create Feedback

**Mutation:**

```graphql
mutation CreateFeedback($input: CreateFeedbackInput!) {
  createFeedback(input: $input) {
    id
    eventId
    userId
    rating
    sessionId
    comment
    createdAt
  }
}
```

**Variables (for event feedback):**

```json
{
  "input": {
    "eventId": "e001",
    "rating": 5,
    "comment": "Great event overall! Well organized and excellent speakers."
  }
}
```

**Variables (for session feedback):**

```json
{
  "input": {
    "eventId": "e001",
    "rating": 4,
    "sessionId": "s001",
    "comment": "Very informative session on deep learning applications."
  }
}
```

**Headers Required:**

```
X-User-ID: u002
```

### 4. Update Feedback

**Mutation:**

```graphql
mutation UpdateFeedback($id: String!, $input: UpdateFeedbackInput!) {
  updateFeedback(id: $id, input: $input) {
    id
    rating
    comment
  }
}
```

**Variables:**

```json
{
  "id": "f001",
  "input": {
    "rating": 5,
    "comment": "Updated: Absolutely excellent presentation!"
  }
}
```

### 5. Delete Feedback

**Mutation:**

```graphql
mutation DeleteFeedback($id: String!) {
  deleteFeedback(id: $id)
}
```

**Variables:**

```json
{
  "id": "f001"
}
```

---

## Papers API

### 1. Get Papers (Paginated)

**Query:**

```graphql
query GetPapers($page: Int = 1, $limit: Int = 10) {
  papers(page: $page, limit: $limit) {
    papers {
      id
      title
      authorIds
      abstract
      keywords
      fileUrl
      status
      sessionId
      submissionDate
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

**Example Response:**

```json
{
  "data": {
    "papers": {
      "papers": [
        {
          "id": "p001",
          "title": "Deep Learning Approaches for COVID-19 Detection in CT Scans",
          "authorIds": ["u002", "u003"],
          "abstract": "This paper presents a novel deep learning framework for automated detection of COVID-19 from CT scan images...",
          "keywords": [
            "Deep Learning",
            "COVID-19",
            "Medical Imaging",
            "CT Scans"
          ],
          "fileUrl": "https://storage.example.com/papers/p001.pdf",
          "status": "accepted",
          "sessionId": "s001",
          "submissionDate": "2025-02-01T10:00:00Z",
          "createdAt": "2025-02-01T10:00:00Z",
          "updatedAt": "2025-02-15T14:30:00Z"
        }
      ],
      "pageInfo": {
        "totalCount": 87,
        "totalPages": 9,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
}
```

### 2. Get Paper by ID

**Query:**

```graphql
query GetPaper($id: String!) {
  paper(id: $id) {
    id
    title
    authorIds
    abstract
    keywords
    fileUrl
    status
    sessionId
    submissionDate
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "p001"
}
```

### 3. Create Paper

**Mutation:**

```graphql
mutation CreatePaper($input: CreatePaperInput!) {
  createPaper(input: $input) {
    id
    title
    authorIds
    abstract
    keywords
    fileUrl
    status
    sessionId
    submissionDate
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "title": "Transformer Models for Medical Text Classification",
    "authorIds": ["u004", "u005"],
    "abstract": "We propose a transformer-based approach for classifying medical documents and clinical notes with high accuracy...",
    "keywords": ["Transformers", "NLP", "Medical Text", "Classification"],
    "fileUrl": "https://storage.example.com/papers/p002.pdf",
    "status": "submitted",
    "sessionId": "s002"
  }
}
```

### 4. Update Paper (by Author)

**Mutation:**

```graphql
mutation UpdatePaper($id: String!, $input: UpdatePaperInput!) {
  updatePaper(id: $id, input: $input) {
    id
    title
    abstract
    keywords
    fileUrl
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "p001",
  "input": {
    "title": "Deep Learning Approaches for COVID-19 Detection in CT Scans - Revised",
    "abstract": "Updated abstract with more details...",
    "keywords": [
      "Deep Learning",
      "COVID-19",
      "Medical Imaging",
      "CT Scans",
      "Computer Vision"
    ]
  }
}
```

### 5. Update Paper Status (by Admin/Reviewer)

**Mutation:**

```graphql
mutation UpdatePaperStatus($id: String!, $input: UpdatePaperInput!) {
  updatePaper(id: $id, input: $input) {
    id
    status
    sessionId
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "p001",
  "input": {
    "status": "accepted",
    "sessionId": "s001"
  }
}
```

### 6. Delete Paper

**Mutation:**

```graphql
mutation DeletePaper($id: String!) {
  deletePaper(id: $id)
}
```

**Variables:**

```json
{
  "id": "p001"
}
```

---

## Common Status Values

### Event Status

- `upcoming` - Event is scheduled but hasn't started
- `ongoing` - Event is currently happening
- `completed` - Event has ended
- `cancelled` - Event was cancelled

### Registration Status

- `pending` - Registration awaiting confirmation
- `confirmed` - Registration confirmed
- `cancelled` - Registration cancelled

### Payment Status

- `pending` - Payment not yet received
- `completed` - Payment successfully processed
- `failed` - Payment failed

### Paper Status

- `submitted` - Paper submitted for review
- `pending` - Paper is being reviewed
- `approved` - Paper accepted for presentation

### User Roles

- `researcher` - Research scientist
- `attendee` - Attendee
- `speaker` - Conference speaker
- `admin` - System administrator

---

## Notes

1. **Authentication**: Currently, authentication is handled via the `X-User-ID` header. In production, implement proper JWT or OAuth authentication.

2. **Pagination**: All list queries support pagination with `page` and `limit` parameters. Default values are `page=1` and `limit=10`.

3. **Password Security**: Passwords are automatically hashed using bcrypt when creating or updating users.

4. **Timestamps**: All `createdAt` and `updatedAt` fields are automatically managed by the system in ISO 8601 format.

5. **ID Generation**: IDs are auto-generated with prefixes (u001, e001, s001, etc.) and auto-increment.

6. **Cascading Operations**:

   - Creating a registration automatically increments `currentParticipants` for the event
   - Deleting a registration automatically decrements `currentParticipants`

7. **Optional Fields**: When updating, only include fields you want to change. Omitted fields will remain unchanged.

---

## Error Handling

Common error responses:

```json
{
  "errors": [
    {
      "message": "Database not found in context",
      "path": ["createUser"]
    }
  ]
}
```

```json
{
  "data": {
    "user": null
  }
}
```

---

## Support

For issues or questions, please refer to the source code documentation or contact the development team.
