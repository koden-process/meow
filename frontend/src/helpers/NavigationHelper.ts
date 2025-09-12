/**
 * Helper for dynamic navigation color configuration
 */

import { getCustomNavigationColor } from '../utils/env';

export const setDynamicNavigationColor = (): void => {
  const customNavigationColor = getCustomNavigationColor();
  
  if (customNavigationColor && 
      customNavigationColor.trim() !== '' && 
      customNavigationColor !== 'VITE_CUSTOM_NAVIGATION_COLOR') {
    console.log('Setting custom navigation color:', customNavigationColor);
    updateNavigationColor(customNavigationColor);
  } else {
    console.log('No custom navigation color defined, using default #1D1D1B');
  }
};

export const updateNavigationColor = (color: string): void => {
  // Create or update CSS custom property for navigation color
  document.documentElement.style.setProperty('--navigation-bg-color', color);
};
