import { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectInterfaceState } from '../store/Store';
import { Layer as CardLayer } from './card/Layer';
import { Navigation } from './Navigation';
import { NavigationMobile } from './NavigationMobile';
import useMobileLayout from '../hooks/useMobileLayout';

const canShowOpportunityLayer = (pathname: string) => {
  return (
    pathname === '/'
    || pathname === '/activity'
    || pathname === '/accounts'
    || pathname.startsWith('/forecast')
  );
};

export const Layout = (props: PropsWithChildren<unknown>) => {
  const isMobileLayout = useMobileLayout();
  const location = useLocation();
  const state = useSelector(selectInterfaceState);
  const showCardLayer = state === 'card-detail' && canShowOpportunityLayer(location.pathname);

  return (
    <div className="page">
      <div className="navigation">{isMobileLayout ? <NavigationMobile /> : <Navigation />}</div>
      <div className="main">{props.children}</div>
      {showCardLayer && <CardLayer />}
    </div>
  );
};
