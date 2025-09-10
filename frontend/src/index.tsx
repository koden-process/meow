import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { SessionOrNot } from './SessionOrNot';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store/Store';
import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { getBrowserLocale } from './helpers/Helper';
import { setDynamicFavicon } from './helpers/FaviconHelper';
import { setDynamicThemeColor } from './helpers/ThemeHelper';
import { setDynamicNavigationColor } from './helpers/NavigationHelper';
import ErrorBoundary from './ErrorBoundary';

// Set the favicon, theme color and navigation color based on environment variables
setDynamicFavicon();
setDynamicThemeColor();
setDynamicNavigationColor();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <Provider height="100%" locale={getBrowserLocale()} theme={defaultTheme}>
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <SessionOrNot />
      </ReduxProvider>
    </ErrorBoundary>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
