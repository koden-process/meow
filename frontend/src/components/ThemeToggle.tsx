import { MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { selectSessionUser, store } from '../store/Store';
import { ActionType } from '../actions/Actions';
import { Translations } from '../Translations';
import { DEFAULT_LANGUAGE } from '../Constants';

type ThemePreference = 'system' | 'light' | 'dark';

const getNextTheme = (current: ThemePreference): ThemePreference => {
  if (current === 'system') {
    return 'dark';
  }
  if (current === 'dark') {
    return 'light';
  }
  return 'system';
};

export const ThemeToggle = () => {
  const user = useSelector(selectSessionUser);

  const preference: ThemePreference = (user?.theme as ThemePreference) ?? 'system';

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      return;
    }

    const next = getNextTheme(preference);

    const updatedUser = {
      ...user,
      theme: next,
    };

    store.dispatch({
      type: ActionType.USER_SETTINGS_UPDATE,
      payload: updatedUser,
    });
  };

  const getLabel = () => {
    if (preference === 'system') {
      return Translations.ThemeToggleSystem[DEFAULT_LANGUAGE];
    }
    if (preference === 'light') {
      return Translations.ThemeToggleLight[DEFAULT_LANGUAGE];
    }
    return Translations.ThemeToggleDark[DEFAULT_LANGUAGE];
  };

  const getSymbol = () => {
    if (preference === 'system') {
      return '☯';
    }
    if (preference === 'light') {
      return '☀︎';
    }
    return '🌙';
  };

  return (
    <button
      type="button"
      className="theme-toggle-button"
      onClick={handleClick}
      title={getLabel()}
      aria-label={getLabel()}
    >
      <span className="theme-toggle-symbol" aria-hidden="true">{getSymbol()}</span>
    </button>
  );
};

