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
  console.log(`🔍 Getting env var: ${key}`);
  console.log('  window.ENV:', window.ENV);
  console.log(`  window.ENV[${key}]:`, window.ENV?.[key]);
  console.log(`  import.meta.env.${key}:`, getImportMetaEnv(key));
  
  // First try to get from runtime config (Kubernetes)
  if (window.ENV && window.ENV[key]) {
    const runtimeValue = window.ENV[key];
    // Check if the value is not the variable name itself
    if (runtimeValue !== key && runtimeValue.trim() !== '') {
      console.log(`  ✅ Using runtime value for ${key}:`, runtimeValue);
      return runtimeValue;
    }
  }
  
  // Fallback to build-time environment variables (for development)
  const buildTimeValue = getImportMetaEnv(key);
  // Check if the value is not the variable name itself and not empty
  if (buildTimeValue && buildTimeValue !== key && buildTimeValue.trim() !== '') {
    console.log(`  ℹ️ Using build-time value for ${key}:`, buildTimeValue);
    return buildTimeValue;
  }
  
  console.log(`  ❌ No valid value found for ${key}`);
  return undefined;
};

// Helper function to get import.meta.env values
const getImportMetaEnv = (key: keyof EnvConfig): string | undefined => {
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
