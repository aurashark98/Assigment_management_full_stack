const AUTH_USER_KEY = 'auth_user';
const AUTH_USER_EMAIL_KEY = 'auth_user_email';
const AUTH_LAST_SEEN_KEY = 'auth_last_seen';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function readLastSeen(): number | null {
  const raw = localStorage.getItem(AUTH_LAST_SEEN_KEY);
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clearAuthSessionStorage(): void {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_USER_EMAIL_KEY);
  localStorage.removeItem(AUTH_LAST_SEEN_KEY);
  // Notify other parts of the app in the same window to resync auth state
  try {
    window.dispatchEvent(new Event('auth-user-updated'));
  } catch {
    // ignore in non-browser environments
  }
}

export function touchAuthSession(timestamp: number = Date.now()): void {
  if (!localStorage.getItem(AUTH_USER_KEY)) return;
  localStorage.setItem(AUTH_LAST_SEEN_KEY, String(timestamp));
}

export function validateAndRefreshAuthSession(now: number = Date.now()): boolean {
  const hasUser = !!localStorage.getItem(AUTH_USER_KEY);
  if (!hasUser) return false;

  const lastSeen = readLastSeen();
  if (lastSeen === null) {
    localStorage.setItem(AUTH_LAST_SEEN_KEY, String(now));
    return true;
  }

  if (now - lastSeen > ONE_DAY_MS) {
    clearAuthSessionStorage();
    return false;
  }

  localStorage.setItem(AUTH_LAST_SEEN_KEY, String(now));
  return true;
}