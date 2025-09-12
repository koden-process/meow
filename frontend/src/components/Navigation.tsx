import { useEffect, useRef, useState, MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { ActionType } from '../actions/Actions';
import { selectUserId, store } from '../store/Store';
import { Avatar } from './Avatar';

import { Logo } from './Logo';
import { Translations } from '../Translations';
import { DEFAULT_LANGUAGE } from '../Constants';

export const Navigation = () => {
  const userId = useSelector(selectUserId);
  const [userMenue, setUserMenu] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActiveRoute = (targetPath: string): boolean => {
    if (targetPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(targetPath);
  };

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
            {/* Icônes du haut */}
            <div className={`item ${isActiveRoute('/') ? 'active' : ''}`}>
                <Link to="/" title={Translations.OpportunitiesNavItem[DEFAULT_LANGUAGE]}>
                    <img alt={Translations.OpportunitiesNavItem[DEFAULT_LANGUAGE]} src="/dashboard-icon.svg"/>
                </Link>
            </div>
            <div className={`item ${isActiveRoute('/activity') ? 'active' : ''}`}>
                <Link to="/activity" title={Translations.ActivitiesNavItem[DEFAULT_LANGUAGE]}>
                    <img alt={Translations.ActivitiesNavItem[DEFAULT_LANGUAGE]} src="/activity-icon.svg"/>
                </Link>
            </div>
            <div className={`item ${isActiveRoute('/forecast') ? 'active' : ''}`}>
                <Link to="/forecast" title={Translations.ForecastNavItem[DEFAULT_LANGUAGE]}>
                    <img alt={Translations.ForecastNavItem[DEFAULT_LANGUAGE]} src="/forecast-icon.svg"/>
                </Link>
            </div>
            <div className={`item ${isActiveRoute('/accounts') ? 'active' : ''}`}>
                <Link to="/accounts" title={Translations.DirectoryTitle[DEFAULT_LANGUAGE]}>
                    <img alt={Translations.DirectoryTitle[DEFAULT_LANGUAGE]} src="/accounts-icon.svg"/>
                </Link>
            </div>
            <div className={`item ${isActiveRoute('/transfers') ? 'active' : ''}`}>
                <Link to="/transfers" title={Translations.TransfersNavItem[DEFAULT_LANGUAGE]}>
                    <img alt={Translations.TransfersNavItem[DEFAULT_LANGUAGE]} src="/transfer-icon.svg"/>
                </Link>
            </div>
            <div className={`item ${isActiveRoute('/hire') ? 'active' : ''}`}>
                <Link to="/hire" title={Translations.HireSpecialistNavItem[DEFAULT_LANGUAGE]}>
                    <img alt={Translations.HireSpecialistNavItem[DEFAULT_LANGUAGE]} src="/paw-icon.svg"/>
                </Link>
            </div>
            <div className={`item ${isActiveRoute('/setup') ? 'active' : ''}`}>
                <Link to="/setup" title={Translations.SetupNavItem[DEFAULT_LANGUAGE]}>
                    <img alt={Translations.SetupNavItem[DEFAULT_LANGUAGE]} src="/setup-icon.svg"/>
                </Link>
            </div>

            {/* Zone libre avec logo, toujours visible */}
            <div className="logo-spacer">
                <Logo />
            </div>

            {/* Icône du bas (menu utilisateur), toujours visible */}
            <div className="user-menu">
                {userMenue && (
                    <div className={userMenue ? 'wrapper' : ''} ref={layerRef}>
                        <Link onClick={handleLinkClick} to="/user-setup" className={`link user-settings ${isActiveRoute('/user-setup') ? 'active' : ''}`}>
                            {Translations.SettingsNavItem[DEFAULT_LANGUAGE]}
                        </Link>
                        <div onClick={logout} className="link logout">
                            {Translations.LogoutButton[DEFAULT_LANGUAGE]}
                        </div>
                    </div>
                )}
                <Avatar onClick={() => setUserMenu(!userMenue)} width={36} id={userId}/>
            </div>
        </>
    );
};
