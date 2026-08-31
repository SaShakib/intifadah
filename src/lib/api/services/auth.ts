import { apiRequest } from '../client';
import { clearAuthSession, getAuthSession, setAuthSession } from '../storage';
import type { ApiAuthResponse, ApiMessageResponse, GoogleLoginInput, LoginInput, RegisterInput } from '../types';

export async function loginApi(input: LoginInput) {
  const data = await apiRequest<ApiAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  }, { withAuth: false });

  setAuthSession({ user: data.user, tokens: data.tokens });
  return data;
}

export async function registerApi(input: RegisterInput) {
  const data = await apiRequest<ApiAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  }, { withAuth: false });

  setAuthSession({ user: data.user, tokens: data.tokens });
  return data;
}

export async function googleLoginApi(input: GoogleLoginInput) {
  const data = await apiRequest<ApiAuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(input),
  }, { withAuth: false });

  setAuthSession({ user: data.user, tokens: data.tokens });
  return data;
}

export async function meApi() {
  const data = await apiRequest<{ user: ApiAuthResponse['user'] }>('/auth/me', { method: 'GET' });
  return data.user;
}

export async function logoutApi(refreshToken?: string | null) {
  const token = refreshToken ?? getAuthSession()?.tokens.refreshToken;

  try {
    await apiRequest<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: token }),
    });
  } finally {
    clearAuthSession();
  }
}

export function forgotPasswordApi(identifier: string) {
  return apiRequest<ApiMessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  }, { withAuth: false });
}

export function resetPasswordApi(input: { identifier: string; otp: string; password: string }) {
  return apiRequest<ApiMessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  }, { withAuth: false });
}
