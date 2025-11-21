import { GraphQLClient } from 'graphql-request';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/graphql';

export const client = new GraphQLClient(API_URL, {
  headers: () => {
    const userId = localStorage.getItem('userId');
    return userId ? { 'X-User-ID': userId } : {};
  },
});