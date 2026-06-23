/**
 * useT — simple translation hook
 * Reads the active locale from the persisted Zustand language store
 * and returns the full translation object for that locale.
 *
 * Usage:
 *   const t = useT();
 *   <h1>{t.home.heroTitle1}</h1>
 */

'use client';

import useLanguageStore from '@/store/useLanguageStore';
import { getTranslations } from '@/translations';

export default function useT() {
  const { locale } = useLanguageStore();
  return getTranslations(locale);
}
