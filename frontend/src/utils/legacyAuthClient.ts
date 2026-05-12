const LEGACY_AUTH_BASE_URL = 'https://restforge.dev/api/auth';
const LEGACY_APP_CODE = 'K5BK0H3ATT';
const LOCAL_AUTH_BASE_URL = 'http://127.0.0.1:3032/api/facility-helpdesk/auth';

const AUTH_USER_KEY = 'auth_user';
const AUTH_USER_EMAIL_KEY = 'auth_user_email';
const AUTH_ACCESS_TOKEN_KEY = 'auth_access_token';
const AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token';

export interface LegacyAuthUser {
  id: string | number;
  email: string;
  username?: string | null;
  full_name?: string | null;
  profilePhoto?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
}

export class LegacyAuthClient {
  private baseUrl: string;
  private appCode: string;

  constructor() {
    this.baseUrl = LEGACY_AUTH_BASE_URL;
    this.appCode = LEGACY_APP_CODE;
  }

  get currentUser(): LegacyAuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      return raw ? (JSON.parse(raw) as LegacyAuthUser) : null;
    } catch {
      return null;
    }
  }

  async login(username: string, password: string): Promise<LegacyAuthUser> {
    const normalizedUsername = username.trim();

    const remoteResponse = await this.tryRemoteLogin(normalizedUsername, password);
    if (remoteResponse) {
      return remoteResponse;
    }

    return this.localLogin(normalizedUsername, password);
  }

  private async tryRemoteLogin(username: string, password: string): Promise<LegacyAuthUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/session/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_code: this.appCode,
          username,
          password
        })
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        return null;
      }

      const data = result?.data || result || {};
      this.storeTokens(data);

      const user = this.normalizeUser(data.user || data, username);
      this.storeUser(user);
      return user;
    } catch {
      return null;
    }
  }

  private async localLogin(username: string, password: string): Promise<LegacyAuthUser> {
    const response = await fetch(`${LOCAL_AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.message || 'Authentication failed.');
    }

    const data = result?.data || result || {};
    const user = this.normalizeUser(data.user || data, username);
    this.storeUser(user);
    return user;
  }

  private normalizeUser(source: any, fallbackUsername: string): LegacyAuthUser {
    const email = String(source?.email || source?.user_email || fallbackUsername);
    const username = source?.username || source?.employee_code || fallbackUsername;

    return {
      id: source?.id || source?.user_id || 0,
      email,
      username: username ? String(username) : null,
      full_name: source?.full_name || source?.name || null,
      profilePhoto: source?.profile_photo || source?.profilePhoto || null,
      access_token: source?.access_token || null,
      refresh_token: source?.refresh_token || null
    };
  }

  private storeTokens(data: any): void {
    if (data?.access_token) {
      localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, String(data.access_token));
    }
    if (data?.refresh_token) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, String(data.refresh_token));
    }
  }

  private storeUser(user: LegacyAuthUser): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_USER_EMAIL_KEY, user.email);
  }
}

export const legacyAuthClient = new LegacyAuthClient();
