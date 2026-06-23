/**
 * Auth Store - Zustand
 * Migrated from: Redux authSlice.js
 * Manages user authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      userInfo: null,
      token: null,
      loading: false,
      error: null,

      // Login action
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ loading: false, error: data.error || 'Login failed' });
            return false;
          }

          // Set cookie for Next.js middleware and API routes
          if (typeof window !== 'undefined') {
            document.cookie = `auth-token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
          }

          set({
            userInfo: data.user,
            token: data.token,
            loading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({ loading: false, error: 'Network error. Please try again.' });
          return false;
        }
      },

      // Register action
      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ loading: false, error: data.error || 'Registration failed' });
            return false;
          }

          // Set cookie for Next.js middleware and API routes
          if (typeof window !== 'undefined') {
            document.cookie = `auth-token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
          }

          set({
            userInfo: data.user,
            token: data.token,
            loading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({ loading: false, error: 'Network error. Please try again.' });
          return false;
        }
      },

      // Logout
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
        }
        set({ userInfo: null, token: null, error: null });
      },

      // Clear errors
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        userInfo: state.userInfo,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
