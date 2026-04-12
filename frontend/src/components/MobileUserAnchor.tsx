import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ActionType } from '../actions/Actions';
import { Translations } from '../Translations';
import { DEFAULT_LANGUAGE } from '../Constants';
import { selectUserId, store } from '../store/Store';
import { Avatar } from './Avatar';

export const MobileUserAnchor = () => {
  const userId = useSelector(selectUserId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const logout = () => {
    store.dispatch({
      type: ActionType.LOGOUT,
    });
  };

  return (
    <div className="mobile-user-anchor" ref={menuRef}>
      {isMenuOpen && (
        <div className="mobile-user-anchor-menu">
          <button
            type="button"
            className="mobile-user-anchor-link logout"
            onClick={logout}
          >
            {Translations.LogoutButton[DEFAULT_LANGUAGE]}
          </button>
        </div>
      )}
      <Avatar id={userId} width={40} onClick={() => setIsMenuOpen(!isMenuOpen)} />
    </div>
  );
};
