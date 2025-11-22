export const GET_EVENTS = `
  query Events($page: Int!, $limit: Int!, $status: String, $date: String) {
    events(page: $page, limit: $limit, status: $status, date: $date) {
      events {
        id 
        title 
        description 
        startDate 
        endDate 
        location 
        status 
        currentParticipants 
        maxParticipants 
        organizerId
      }
      pageInfo { 
        totalCount 
        totalPages 
        currentPage 
      }
    }
  }
`;

export const GET_EVENT = `
  query Event($id: String!) {
    event(id: $id) {
      id title fee description startDate endDate location status maxParticipants currentParticipants
    }
  }
`;

export const GET_EVENT_SESSIONS = `
  query GetEventSessions($eventId: String!) {
    sessions(eventId: $eventId, page: 1, limit: 100) {
      sessions {
        id
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
          fileUrl
          keywords
          authors {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_EVENT_FEEDBACKS = `
  query GetEventFeedbacks($eventId: String!) {
    feedbacks(eventId: $eventId, page: 1, limit: 50) {
      feedbacks {
        id
        userId
        sessionId
        rating
        comment
        createdAt
        user {
          id
          name
        }
      }
    }
  }
`;
export const CHECK_REGISTRATION = `
  query CheckRegistration($event_id: String, $user_id: String) {
    registrations(eventId: $event_id, userId: $user_id) {
      registrations {
        id
        status
        paymentStatus
      }
    }
  }
`;
export const GET_MY_REGISTRATIONS = `
  query GetMyRegistrations($userId: String, $page: Int, $limit: Int) {
    registrations(userId: $userId, page: $page, limit: $limit) {
      registrations {
        id
        eventId
        registrationDate
        status
        paymentStatus
        paymentAmount
        event {
          title
          startDate
          endDate
          location
        }
      }
      pageInfo {
        totalCount
        totalPages
      }
    }
  }
`;

export const GET_USERS = `
  query { users(page: 1, limit: 100) { users { id name email role organization phone } } }
`;
