/**
 * Language Store - Zustand
 * Persists the user's selected WPML locale across navigation and page refreshes.
 * Used by Navbar (to switch) and any page that fetches from WooCommerce (to read).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SUPPORTED_LOCALES = ['en', 'ta', 'hi', 'sv', 'no'];

const useLanguageStore = create(
  persist(
    (set) => ({
      locale: 'en',

      setLocale: (code) => {
        const lang = SUPPORTED_LOCALES.includes(code) ? code : 'en';
        set({ locale: lang });
      },
    }),
    {
      name: 'gr-language', // localStorage key
    }
  )
);

export default useLanguageStore;
