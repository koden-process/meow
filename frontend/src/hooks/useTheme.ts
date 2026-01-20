import { useSelector } from 'react-redux';
import { selectSessionUser } from '../store/Store';
import { useEffect, useState } from 'react';
import { updateThemeColor } from '../helpers/ThemeHelper';

export function useTheme() {
  const user = useSelector(selectSessionUser);
  // Si l'utilisateur n'a rien choisi, on suit le thème système
  const userTheme = user?.theme ?? 'system';

  const getSystemTheme = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Thème effectif appliqué à l'UI
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    userTheme === 'system' ? getSystemTheme() : (userTheme as 'light' | 'dark')
  );

  useEffect(() => {
    // Recalcule le thème effectif dès que la préférence utilisateur change
    if (userTheme === 'system') {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(userTheme as 'light' | 'dark');
    }
  }, [userTheme]);

  useEffect(() => {
    // Écoute les changements de thème système uniquement si l'utilisateur est en mode "system"
    if (userTheme !== 'system') {
      return;
    }

    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      setResolvedTheme(event.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', listener);

    return () => {
      media.removeEventListener('change', listener);
    };
  }, [userTheme]);

  useEffect(() => {
    // Appliquer le thème directement sur body et html (documentElement)
    const themeClass = resolvedTheme;

    // On ne remplace pas complètement className pour éviter d'écraser d'autres classes globales,
    // on manipule simplement les classes light/dark.
    document.body.classList.remove('light', 'dark');
    document.documentElement.classList.remove('light', 'dark');
    document.body.classList.add(themeClass);
    document.documentElement.classList.add(themeClass);

    // Met à jour la meta theme-color pour le navigateur / PWA
    updateThemeColor(themeClass === 'dark' ? '#101018' : '#ffffff');
  }, [resolvedTheme]);

  return resolvedTheme;
}
