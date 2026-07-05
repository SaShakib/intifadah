/**
 * Example fetch interceptor flow:
 * - keep accessToken + refreshToken in memory/local storage
 * - on 401, call /auth/refresh with refreshToken
 * - retry original request with new access token
 */

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

let tokens: AuthTokens | null = null;

export function setTokens(next: AuthTokens | null) {
  tokens = next;
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (tokens?.accessToken) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }
  headers.set('Content-Type', 'application/json');

  const first = await fetch(input, { ...init, headers });
  if (first.status !== 401 || !tokens?.refreshToken) {
    return first;
  }

  const refresh = await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });

  if (!refresh.ok) {
    setTokens(null);
    return first;
  }

  const refreshed = await refresh.json();
  setTokens({
    accessToken: refreshed.tokens.accessToken,
    refreshToken: refreshed.tokens.refreshToken,
  });

  const retryHeaders = new Headers(init.headers || {});
  retryHeaders.set('Authorization', `Bearer ${refreshed.tokens.accessToken}`);
  retryHeaders.set('Content-Type', 'application/json');

  return fetch(input, { ...init, headers: retryHeaders });
}
