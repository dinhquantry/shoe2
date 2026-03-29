import Cookies from "js-cookie";

const TOKEN_STORAGE_KEY = "token";
const ROLE_STORAGE_KEY = "role";
const AUTH_STORAGE_KEY = "auth-storage";

export function saveAuthSession(token: string, role: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  Cookies.set(TOKEN_STORAGE_KEY, token, { expires: 7 });
  Cookies.set(ROLE_STORAGE_KEY, role, { expires: 7 });
}

export function getStoredAuthToken(): string | null {
  if (typeof window !== "undefined") {
    const localToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (localToken) {
      return localToken;
    }
  }

  return Cookies.get(TOKEN_STORAGE_KEY) ?? null;
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  Cookies.remove(TOKEN_STORAGE_KEY);
  Cookies.remove(ROLE_STORAGE_KEY);
}
