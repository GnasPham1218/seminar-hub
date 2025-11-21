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
