import {useState} from 'react';
import {useSelector} from 'react-redux';
import {Link, useLocation} from 'react-router-dom';
import {ActionType} from '../actions/Actions';
import {selectCurrency, selectUserId, store} from '../store/Store';
import {Avatar} from './Avatar';
import {IconBurger} from './IconBurger';
import {Translations} from "../Translations";
import {DEFAULT_LANGUAGE} from "../Constants";
import { ThemeToggle } from './ThemeToggle';

export const NavigationMobile = () => {
    const userId = useSelector(selectUserId);
    const currency = useSelector(selectCurrency);
    const [isExpanded, setIsExpanded] = useState(false);
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

    return (
        <>
            <div className="burger">
                <div>
                    <div className="icon-canvas" onClick={() => setIsExpanded(!isExpanded)}>
                        <IconBurger/>
                    </div>
                </div>
                <div className="theme-toggle-container">
                    <ThemeToggle />
                    <Avatar onClick={() => setIsExpanded(!isExpanded)} width={36} id={userId}/>
                </div>
            </div>

            {isExpanded && (
                <div className="burger-items">
                    <div className={`item-mobile ${isActiveRoute('/') ? 'active' : ''}`}>
                        <Link onClick={() => setIsExpanded(!isExpanded)} to="/" title="Opportunities">
                            <img alt="Deals" src={`/${currency?.toLocaleLowerCase()}-icon.svg`}/>
                            {Translations.OpportunitiesNavItem[DEFAULT_LANGUAGE]}
                        </Link>
                    </div>
                    <div className={`item-mobile ${isActiveRoute('/forecast') ? 'active' : ''}`}>
                        <Link onClick={() => setIsExpanded(!isExpanded)} to="/forecast" title="Forecast">
                            <img alt="Forecast" src="/forecast-icon.svg"/>
                            {Translations.ForecastNavItem[DEFAULT_LANGUAGE]}
                        </Link>
                    </div>
                    <div className="item-mobile">
                        <Link onClick={() => setIsExpanded(!isExpanded)} to="/transfers" title="Transfers">
                            <img alt="Transfers" src="/transfer-icon.svg"/>
                            {Translations.TransfersNavItem[DEFAULT_LANGUAGE]}
                        </Link>
                    </div>
                    <div className={`item-mobile ${isActiveRoute('/accounts') ? 'active' : ''}`}>
                        <Link onClick={() => setIsExpanded(!isExpanded)} to="/accounts" title="Accounts">
                            <img alt="Accounts" src="/accounts-icon.svg"/>
                            {Translations.DirectoryTitle[DEFAULT_LANGUAGE]}
                        </Link>
                    </div>
                    <div className={`item-mobile ${isActiveRoute('/hire') ? 'active' : ''}`}>
                        <Link onClick={() => setIsExpanded(!isExpanded)} to="/hire" title="Hire a Specialist">
                            <img alt="Hire a Specialist" src="/paw-icon.svg"/>
                            {Translations.UsersTitle[DEFAULT_LANGUAGE]}
                        </Link>
                    </div>
                    <div className={`item-mobile ${isActiveRoute('/setup') ? 'active' : ''}`}>
                        <Link onClick={() => setIsExpanded(!isExpanded)} to="/setup" title="Setup">
                            <img alt="Setup" src="/setup-icon.svg"/>
                            {Translations.SetupNavItem[DEFAULT_LANGUAGE]}
                        </Link>
                    </div>

                    {/*<h4 className="headline">{Translations.UsersTitle[DEFAULT_LANGUAGE]}</h4>*/}

                    <div className={`item-mobile ${isActiveRoute('/user-setup') ? 'active' : ''}`}>
                        <Link onClick={() => setIsExpanded(!isExpanded)} to="/user-setup" title="User Setup">
                            {Translations.SettingsNavItem[DEFAULT_LANGUAGE]}
                        </Link>
                    </div>
                    <div onClick={logout} className="item-mobile logout">
                        {Translations.LogoutButton[DEFAULT_LANGUAGE]}
                    </div>
                </div>
            )}
        </>
    );
};
