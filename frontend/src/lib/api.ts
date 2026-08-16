const TOKEN_KEY = 'blog_token';
const USER_KEY  = 'blog_user';

export const AUTH_EVENTS = {
  TOKEN_EXPIRED: 'auth:token_expired',
} as const;

// ---- Token storage ----
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}

// ---- User storage (for immediate restore on refresh) ----
export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setStoredUser(user: any): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(USER_KEY);
}

// ---- Clear both ----
export function clearAuthStorage(): void {
  clearToken();
  clearStoredUser();
}

// ---- Fetch helpers ----
function attachAuth(headers: Record<string, string>): Record<string, string> {
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function handle401IfNeeded(res: Response): void {
  // 401 且本来带 token — 说明 token 无效/过期
  // 交给 AuthContext 统一处理（dispatch event + redirect）
  if (res.status === 401 && getToken()) {
    clearAuthStorage();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_EXPIRED));
    }
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = attachAuth({
    ...(options.headers as Record<string, string> || {}),
  });
  const res = await fetch(url, { ...options, headers });
  handle401IfNeeded(res);
  return res;
}

export async function apiGet(url: string): Promise<any> {
  const res = await authFetch(url);
  return res.json();
}

export async function apiPost(url: string, data?: any): Promise<any> {
  const res = await authFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  return res.json();
}

export async function apiPut(url: string, data?: any): Promise<any> {
  const res = await authFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  return res.json();
}

export async function apiPatch(url: string, data?: any): Promise<any> {
  const res = await authFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  return res.json();
}

export async function apiDelete(url: string): Promise<any> {
  const res = await authFetch(url, { method: 'DELETE' });
  return res.json();
}
