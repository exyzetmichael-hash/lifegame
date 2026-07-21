import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

/** Reflects the theme store onto <html data-theme="…"> so CSS custom properties switch. Mount once near the app root. */
export function useApplyTheme() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}
