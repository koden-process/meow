/**
 * Utility functions for dynamic logo management in navigation
 * Allows customization via environment variables with fallback to default
 */

export interface LogoConfig {
  url: string;
  alt: string;
}

/**
 * Get the logo configuration based on environment variable
 * Falls back to default logo if VITE_CUSTOM_LOGO_URL is not defined
 */
export const getLogoConfig = (): LogoConfig => {
  const customLogoUrl = import.meta.env.VITE_CUSTOM_LOGO_URL;
  const customLogoAlt = import.meta.env.VITE_CUSTOM_LOGO_ALT || 'Logo';
  
  // Debug: log the environment variables
  console.log('🔍 Debug Logo Config:');
  console.log('  VITE_CUSTOM_LOGO_URL:', customLogoUrl);
  console.log('  VITE_CUSTOM_LOGO_ALT:', customLogoAlt);
  console.log('  Has custom logo:', !!(customLogoUrl && customLogoUrl.trim() !== ''));
  
  // Default logo configuration
  const defaultConfig: LogoConfig = {
    url: '/meow-logo-reduced.svg',
    alt: 'Meow'
  };
  
  // If custom logo URL is provided, use custom configuration
  if (customLogoUrl && customLogoUrl.trim() !== '') {
    const config = {
      url: customLogoUrl,
      alt: customLogoAlt
    };
    console.log('  Using custom config:', config);
    return config;
  }
  
  console.log('  Using default config:', defaultConfig);
  return defaultConfig;
};

/**
 * Check if custom logo is configured
 */
export const hasCustomLogo = (): boolean => {
  const customLogoUrl = import.meta.env.VITE_CUSTOM_LOGO_URL;
  return !!(customLogoUrl && customLogoUrl.trim() !== '');
};

/**
 * Get logo styles based on configuration
 */
export const getLogoStyles = (config: LogoConfig): React.CSSProperties => {
  return {
    display: 'block',
  };
};
