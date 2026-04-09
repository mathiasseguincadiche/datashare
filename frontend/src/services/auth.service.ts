import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
import { publicApi } from './api';

export async function register(data: RegisterRequest): Promise<void> {
  await publicApi.post('/auth/register', data);
}

export async function login(data: LoginRequest): Promise<string> {
  const response = await publicApi.post<AuthResponse>('/auth/login', data);
  const token = response.data.access_token;

  localStorage.setItem('access_token', token);

  return token;
}

export function logout() {
  localStorage.removeItem('access_token');
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem('access_token'));
}
