// Environment configuration utility
// This allows the app to access environment variables at runtime

interface EnvConfig {
  VITE_CUSTOM_THEME_COLOR?: string;
  VITE_CUSTOM_LOGO_URL?: string;
  VITE_CUSTOM_FAVICON_URL?: string;
  VITE_CUSTOM_LOGO_ALT?: string;
  VITE_CUSTOM_NAVIGATION_COLOR?: string;
}

declare global {
  interface Window {
    ENV?: EnvConfig;
  }
}

// Function to get environment variable value
export const getEnvVar = (key: keyof EnvConfig): string | undefined => {
  // First try to get from runtime config (Kubernetes)
  if (window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }
  
  // Fallback to build-time environment variables (for development)
  switch (key) {
    case 'VITE_CUSTOM_THEME_COLOR':
      return import.meta.env.VITE_CUSTOM_THEME_COLOR;
    case 'VITE_CUSTOM_LOGO_URL':
      return import.meta.env.VITE_CUSTOM_LOGO_URL;
    case 'VITE_CUSTOM_FAVICON_URL':
      return import.meta.env.VITE_CUSTOM_FAVICON_URL;
    case 'VITE_CUSTOM_LOGO_ALT':
      return import.meta.env.VITE_CUSTOM_LOGO_ALT;
    case 'VITE_CUSTOM_NAVIGATION_COLOR':
      return import.meta.env.VITE_CUSTOM_NAVIGATION_COLOR;
    default:
      return undefined;
  }
};

// Convenience functions for specific variables
export const getCustomThemeColor = () => getEnvVar('VITE_CUSTOM_THEME_COLOR');
export const getCustomLogoUrl = () => getEnvVar('VITE_CUSTOM_LOGO_URL');
export const getCustomFaviconUrl = () => getEnvVar('VITE_CUSTOM_FAVICON_URL');
export const getCustomLogoAlt = () => getEnvVar('VITE_CUSTOM_LOGO_ALT');
export const getCustomNavigationColor = () => getEnvVar('VITE_CUSTOM_NAVIGATION_COLOR');
