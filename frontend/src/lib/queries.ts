// Tất cả query/mutation chính
export const GET_EVENTS = `
  query Events($page: Int!, $limit: Int!) {
    events(page: $page, limit: $limit) {
      events {
        id title description startDate endDate location status currentParticipants maxParticipants organizerId
      }
      pageInfo { totalCount totalPages currentPage }
    }
  }
`

export const GET_EVENT = `
  query Event($id: String!) {
    event(id: $id) {
      id title description startDate endDate location status maxParticipants currentParticipants
    }
  }
`

export const CREATE_REGISTRATION = `
  mutation CreateRegistration($input: CreateRegistrationInput!) {
    createRegistration(input: $input) {
      id status paymentStatus
    }
  }
`

export const GET_MY_REGISTRATIONS = `
  query Registrations($page: Int!, $limit: Int!) {
    registrations(page: $page, limit: $limit) {
      registrations {
        id eventId registrationDate status paymentStatus paymentAmount
      }
    }
  }
`
// Thêm vào cuối file queries.ts
export const GET_USERS = `
  query { users(page: 1, limit: 100) { users { id name email role organization phone } } }
`