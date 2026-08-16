import { apiClient } from './client';
import { AuthResponse, User } from '../types';

export function registerRequest(name: string, email: string, password: string) {
  return apiClient
    .post<AuthResponse>('/auth/register', { name, email, password })
    .then((res) => res.data);
}

export function loginRequest(email: string, password: string) {
  return apiClient.post<AuthResponse>('/auth/login', { email, password }).then((res) => res.data);
}

export function meRequest() {
  return apiClient.get<User>('/auth/me').then((res) => res.data);
}
