// hooks/useAuth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { AuthUser } from '@/app/types';

interface AuthState {
  user: AuthUser | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user, token) => {
        Cookies.set('token', token, { expires: 7 });
  //  Lưu trực tiếp giá trị role (ví dụ: "Admin") vào Cookie
        Cookies.set('role', user.role || "User", { expires: 7 }); 
        set({ user });
},
      logout: () => {
        Cookies.remove('token');
        Cookies.remove('role');
        localStorage.removeItem('token');
        set({ user: null });
        window.location.href = "/login";
      },
    }),
    { name: 'auth-storage' }
  )
);
