/**
 * Utility function to set the favicon dynamically based on environment variable
 * Falls back to default favicon if VITE_CUSTOM_FAVICON_URL is not defined
 */

import { getCustomFaviconUrl } from '../utils/env';

export const setDynamicFavicon = (): void => {
  const customFaviconUrl = getCustomFaviconUrl();
  const defaultFaviconUrl = '/meow-logo-reduced.svg';
  
  // Get the current favicon link element or create one if it doesn't exist
  let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/svg+xml';
    document.head.appendChild(faviconLink);
  }
  
  // Set the favicon URL - use custom if available, otherwise use default
  const faviconUrl = customFaviconUrl && 
    customFaviconUrl.trim() !== '' && 
    customFaviconUrl !== 'VITE_CUSTOM_FAVICON_URL'
    ? customFaviconUrl 
    : defaultFaviconUrl;
    
  faviconLink.href = faviconUrl;
  
  console.log(`Favicon set to: ${faviconUrl}`);
};

/**
 * Function to update favicon at runtime
 * Useful for changing favicon based on user preferences or themes
 */
export const updateFavicon = (url: string): void => {
  const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  
  if (faviconLink) {
    faviconLink.href = url;
    console.log(`Favicon updated to: ${url}`);
  }
};
