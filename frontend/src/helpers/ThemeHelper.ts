/**
 * Utility function to set dynamic theme color for PWA
 * Updates both meta tag and potential manifest
 */

import { getCustomThemeColor } from '../utils/env';

export const setDynamicThemeColor = (mode: 'light' | 'dark' = 'dark'): void => {
  const customThemeColor = getCustomThemeColor();
  const defaultDarkThemeColor = '#1D1D1B';
  const defaultLightThemeColor = '#ffffff';
  
  // Use custom theme color if available, otherwise use default
  const baseThemeColor = customThemeColor && 
    customThemeColor.trim() !== '' && 
    customThemeColor !== 'VITE_CUSTOM_THEME_COLOR'
    ? customThemeColor 
    : mode === 'light'
      ? defaultLightThemeColor
      : defaultDarkThemeColor;
    
  // Update the meta theme-color tag
  let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  
  themeColorMeta.content = baseThemeColor;
  
  console.log(`PWA theme color set to: ${baseThemeColor}`);
};

/**
 * Function to update theme color at runtime
 */
export const updateThemeColor = (color: string): void => {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  
  if (themeColorMeta) {
    themeColorMeta.content = color;
    console.log(`PWA theme color updated to: ${color}`);
  }
};
