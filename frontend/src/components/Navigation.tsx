import { useEffect, useRef, useState, MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ActionType } from '../actions/Actions';
import { selectCurrency, selectUserId, store } from '../store/Store';
import { Avatar } from './Avatar';
import { IconActivity } from './IconActivity';
import { Translations } from '../Translations';
import { DEFAULT_LANGUAGE } from '../Constants';

export const Navigation = () => {
  const userId = useSelector(selectUserId);
  const currency = useSelector(selectCurrency);
  const [userMenue, setUserMenu] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);

  const logout = () => {
    store.dispatch({
      type: ActionType.LOGOUT,
    });
  };

  function handleLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
    setUserMenu(false);

    return true;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent<Document>) {
      if (layerRef.current && !layerRef.current.contains(event.target as Node)) {
        setUserMenu(false);
      }
    }

    const clickHandler: EventListenerOrEventListenerObject =
      handleClickOutside as unknown as EventListenerOrEventListenerObject;

    document.addEventListener('mousedown', clickHandler);

    return () => {
      document.removeEventListener('mousedown', clickHandler);
    };
  }, [layerRef]);

  return (
    <>
      <div className="item">
        <Link to="/" title={Translations.OpportunitiesNavItem[DEFAULT_LANGUAGE]}>
          <img alt={Translations.OpportunitiesNavItem[DEFAULT_LANGUAGE]} src={`/${currency?.toLocaleLowerCase()}-icon.svg`} />
        </Link>
      </div>
      <div className="item">
        <Link to="/activity" title={Translations.ActivitiesNavItem[DEFAULT_LANGUAGE]}>
          <span className="icon">
            <IconActivity />
          </span>
        </Link>
      </div>
      <div className="item">
        <Link to="/forecast" title={Translations.ForecastNavItem[DEFAULT_LANGUAGE]}>
          <img alt={Translations.ForecastNavItem[DEFAULT_LANGUAGE]} src="/forecast-icon.svg" />
        </Link>
      </div>
      <div className="item">
        <Link to="/accounts" title={Translations.AccountsNavItem[DEFAULT_LANGUAGE]}>
          <img alt={Translations.AccountsNavItem[DEFAULT_LANGUAGE]} src="/accounts-icon.svg" />
        </Link>
      </div>
      <div className="item">
        <Link to="/hire" title={Translations.HireSpecialistNavItem[DEFAULT_LANGUAGE]}>
          <img alt={Translations.HireSpecialistNavItem[DEFAULT_LANGUAGE]} src="/paw-icon.svg" />
        </Link>
      </div>
      <div className="item">
        <Link to="/setup" title={Translations.SetupNavItem[DEFAULT_LANGUAGE]}>
          <img alt={Translations.SetupNavItem[DEFAULT_LANGUAGE]} src="/setup-icon.svg" />
        </Link>
      </div>
      <div className="item" style={{ flexGrow: 1 }}></div>
      <div className="user-menu">
        {userMenue && (
          <div className={userMenue ? 'wrapper' : ''} ref={layerRef}>
            <Link onClick={handleLinkClick} to="/user-setup" className="link user-settings">
              {Translations.SettingsNavItem[DEFAULT_LANGUAGE]}
            </Link>
            <div onClick={logout} className="link logout">
              {Translations.LogoutButton[DEFAULT_LANGUAGE]}
            </div>
          </div>
        )}
        <Avatar onClick={() => setUserMenu(!userMenue)} width={36} id={userId} />
      </div>
    </>
  );
};
