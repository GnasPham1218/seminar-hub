// src/graphql/mutations.ts
import { gql } from "graphql-request";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      name
      email
      role
      organization
      phone
    }
  }
`;

// --- USERS  ---
export const CREATE_USER = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id name email role organization phone
    }
  }
`;

export const UPDATE_USER = `
  mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id name email role organization phone updatedAt
    }
  }
`;

export const DELETE_USER = `
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;
export const CREATE_EVENT = `
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      status
    }
  }
`;

export const UPDATE_EVENT = `
  mutation UpdateEvent($id: String!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

export const DELETE_EVENT = `
  mutation DeleteEvent($id: String!) {
    deleteEvent(id: $id)
  }
`;
export const CREATE_REGISTRATION = `
  mutation CreateRegistration($input: CreateRegistrationInput!) {
    createRegistration(input: $input) {
      id status paymentStatus
    }
  }
`;

export const UPDATE_REGISTRATION = `
  mutation UpdateRegistration($id: String!, $input: UpdateRegistrationInput!) {
    updateRegistration(id: $id, input: $input) {
      id
      status
      paymentStatus
    }
  }
`;
export const DELETE_REGISTRATION = `
  mutation DeleteRegistration($id: String!) {
    deleteRegistration(id: $id)
  }
`;
export const CREATE_FEEDBACK = `
  mutation CreateFeedback($input: CreateFeedbackInput!) {
    createFeedback(input: $input) {
      id
      rating
      comment
      sessionId 
      createdAt
      user {
        id
        name
      }
    }
  }
`;
export const CREATE_PAPER = `
  mutation CreatePaper($input: CreatePaperInput!) {
    createPaper(input: $input) {
      id
      title
      status
      fileUrl
      createdAt
    }
  }
`;
export const UPDATE_PAPER = `
  mutation UpdatePaper($id: String!, $input: UpdatePaperInput!) {
    updatePaper(id: $id, input: $input) {
      id
      title
      abstract
      keywords
      fileUrl
      status
      sessionId
      eventId
      updatedAt
      authorIds
    }
  }
`;

export const DELETE_PAPER = `
  mutation DeletePaper($id: String!) {
    deletePaper(id: $id)
  }
`;
