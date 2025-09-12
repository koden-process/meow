/**
 * Utility functions for dynamic logo management in navigation
 * Allows customization via environment variables with fallback to default
 */

import { getCustomLogoUrl, getCustomLogoAlt } from '../utils/env';

export interface LogoConfig {
  url: string;
  alt: string;
}

/**
 * Get the logo configuration based on environment variable
 * Falls back to default logo if VITE_CUSTOM_LOGO_URL is not defined
 */
export const getLogoConfig = (): LogoConfig => {
  const customLogoUrl = getCustomLogoUrl();
  const customLogoAlt = getCustomLogoAlt();
  
  // Use custom alt text if valid, otherwise use default
  const logoAlt = customLogoAlt && 
    customLogoAlt.trim() !== '' && 
    customLogoAlt !== 'VITE_CUSTOM_LOGO_ALT' 
    ? customLogoAlt 
    : 'Logo';
  
  // Debug: log the environment variables
  console.log('🔍 Debug Logo Config:');
  console.log('  VITE_CUSTOM_LOGO_URL:', customLogoUrl);
  console.log('  VITE_CUSTOM_LOGO_ALT:', customLogoAlt);
  console.log('  window.ENV:', window.ENV);
  console.log('  Has custom logo:', !!(customLogoUrl && 
    customLogoUrl.trim() !== '' && 
    customLogoUrl !== 'VITE_CUSTOM_LOGO_URL'));
  
  // Default logo configuration
  const defaultConfig: LogoConfig = {
    url: '/meow-logo-reduced.svg',
    alt: 'Meow'
  };
  
  // If custom logo URL is provided, use custom configuration
  if (customLogoUrl && 
      customLogoUrl.trim() !== '' && 
      customLogoUrl !== 'VITE_CUSTOM_LOGO_URL') {
    const config = {
      url: customLogoUrl,
      alt: logoAlt
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
  const customLogoUrl = getCustomLogoUrl();
  return !!(customLogoUrl && 
    customLogoUrl.trim() !== '' && 
    customLogoUrl !== 'VITE_CUSTOM_LOGO_URL');
};

/**
 * Get logo styles based on configuration
 */
export const getLogoStyles = (config: LogoConfig): React.CSSProperties => {
  return {
    display: 'block',
  };
};
