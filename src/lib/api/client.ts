import { ApiError } from './error';
import { clearAuthSession, getAuthSession, setAuthSession } from './storage';
import type { ApiClientOptions, ApiAuthResponse, ApiRequestErrorBody } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

let refreshPromise: Promise<ApiAuthResponse | null> | null = null;

function toAbsoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseResponseBody<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return (await response.json()) as T;
}

function resolveErrorMessage(body: ApiRequestErrorBody | null, status: number) {
  if (body?.message) {
    return body.message;
  }

  if (status === 401) {
    return 'সেশন মেয়াদ শেষ হয়েছে। আবার লগইন করুন।';
  }

  if (status >= 500) {
    return 'সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।';
  }

  return 'রিকোয়েস্ট ব্যর্থ হয়েছে।';
}

async function refreshAuthSession() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const session = getAuthSession();
    const refreshToken = session?.tokens.refreshToken;

    if (!refreshToken) {
      return null;
    }

    const response = await fetch(toAbsoluteUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = await parseResponseBody<ApiAuthResponse | ApiRequestErrorBody>(response);

    if (!response.ok || !payload || !('tokens' in payload)) {
      clearAuthSession();
      return null;
    }

    setAuthSession({ user: payload.user, tokens: payload.tokens });
    return payload;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiClientOptions = {},
): Promise<T> {
  const withAuth = options.withAuth ?? true;
  const retryOnAuthError = options.retryOnAuthError ?? true;

  const headers = new Headers(init.headers ?? {});
  const hasJsonBody = init.body !== undefined && init.body !== null && !headers.has('content-type');
  if (hasJsonBody) {
    headers.set('content-type', 'application/json');
  }

  const currentSession = getAuthSession();
  if (withAuth && currentSession?.tokens.accessToken) {
    headers.set('authorization', `Bearer ${currentSession.tokens.accessToken}`);
  }

  const response = await fetch(toAbsoluteUrl(path), {
    ...init,
    headers,
  });

  const payload = await parseResponseBody<T | ApiRequestErrorBody>(response);

  if (response.status === 401 && withAuth && retryOnAuthError) {
    const refreshed = await refreshAuthSession();
    if (refreshed?.tokens.accessToken) {
      return apiRequest<T>(path, init, { ...options, retryOnAuthError: false });
    }
  }

  if (!response.ok) {
    const errorBody = (payload as ApiRequestErrorBody | null) ?? null;
    throw new ApiError(resolveErrorMessage(errorBody, response.status), response.status, {
      requestId: errorBody?.requestId,
      details: errorBody,
    });
  }

  return payload as T;
}

export function createQueryString(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    search.set(key, String(value));
  }

  const result = search.toString();
  return result ? `?${result}` : '';
}
