import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/app/types";
import {
  clearAuthSession,
  getStoredAuthToken,
  saveAuthSession,
} from "@/lib/auth-session";
import { parseAuthUserFromToken } from "@/lib/auth-user";

interface AuthState {
  user: AuthUser | null;
  setAuth: (user: AuthUser, token: string) => void;
  initializeAuth: () => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user, token) => {
        saveAuthSession(token, user.role || "User");
        set({ user });
      },
      initializeAuth: () => {
        const token = getStoredAuthToken();

        if (!token) {
          return;
        }

        set((state) => {
          if (state.user) {
            return state;
          }

          return { user: parseAuthUserFromToken(token) };
        });
      },
      logout: () => {
        clearAuthSession();
        set({ user: null });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },
    }),
    { name: "auth-storage" }
  )
);
