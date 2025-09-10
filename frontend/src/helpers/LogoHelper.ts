/**
 * Utility functions for dynamic logo management in navigation
 * Allows customization via environment variables with fallback to default
 */

export interface LogoConfig {
  url: string;
  alt: string;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Get the logo configuration based on environment variable
 * Falls back to default logo if VITE_CUSTOM_LOGO_URL is not defined
 */
export const getLogoConfig = (): LogoConfig => {
  const customLogoUrl = import.meta.env.VITE_CUSTOM_LOGO_URL;
  const customLogoAlt = import.meta.env.VITE_CUSTOM_LOGO_ALT || 'Logo';
  const customLogoMaxWidth = import.meta.env.VITE_CUSTOM_LOGO_MAX_WIDTH;
  const customLogoMaxHeight = import.meta.env.VITE_CUSTOM_LOGO_MAX_HEIGHT;
  
  // Default logo configuration
  const defaultConfig: LogoConfig = {
    url: '/meow-logo-reduced.svg',
    alt: 'Meow',
    maxWidth: 120,
    maxHeight: 60
  };
  
  // If custom logo URL is provided, use custom configuration
  if (customLogoUrl && customLogoUrl.trim() !== '') {
    return {
      url: customLogoUrl,
      alt: customLogoAlt,
      maxWidth: customLogoMaxWidth ? parseInt(customLogoMaxWidth, 10) : defaultConfig.maxWidth,
      maxHeight: customLogoMaxHeight ? parseInt(customLogoMaxHeight, 10) : defaultConfig.maxHeight
    };
  }
  
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
    maxWidth: `${config.maxWidth}px`,
    maxHeight: `${config.maxHeight}px`,
    objectFit: 'contain' as const,
    display: 'block',
    margin: '0 auto',
    transform: 'rotate(-90deg)'
  };
};
