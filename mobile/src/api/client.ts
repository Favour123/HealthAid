import axios from 'axios';
import { API_BASE_URL } from '../config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export function getAuthToken() {
  return authToken;
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join('\n') : data.message;
    }
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      return 'Could not reach the server. Check that the backend is running and your phone is on the same network.';
    }
  }
  return 'Something went wrong. Please try again.';
}
