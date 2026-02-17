import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { SessionOrNot } from './SessionOrNot';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store/Store';
import { setDynamicFavicon } from './helpers/FaviconHelper';
import { setDynamicThemeColor } from './helpers/ThemeHelper';
import { setDynamicNavigationColor } from './helpers/NavigationHelper';
import ErrorBoundary from './ErrorBoundary';
import { SpectrumProvider } from './components/SpectrumProvider';

// Set the favicon, theme color and navigation color based on environment variables
setDynamicFavicon();
// Valeur initiale : on se base sur la préférence système avant que React n'applique le bon thème
const initialTheme =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
setDynamicThemeColor(initialTheme);
setDynamicNavigationColor();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ErrorBoundary>
    <ReduxProvider store={store}>
      <SpectrumProvider>
        <SessionOrNot />
      </SpectrumProvider>
    </ReduxProvider>
  </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
