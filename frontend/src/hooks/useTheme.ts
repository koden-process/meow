import { useSelector } from 'react-redux';
import { selectSessionUser } from '../store/Store';
import { useEffect } from 'react';

export function useTheme() {
  const user = useSelector(selectSessionUser);
  const theme = user?.theme || 'dark'; // Thème sombre par défaut

  useEffect(() => {
    // Appliquer le thème directement sur body
    document.body.className = theme;
    document.documentElement.className = theme;
  }, [theme]);

  return theme;
}
