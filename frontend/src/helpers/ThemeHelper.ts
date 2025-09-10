/**
 * Utility function to set dynamic theme color for PWA
 * Updates both meta tag and potential manifest
 */
export const setDynamicThemeColor = (): void => {
  const customThemeColor = import.meta.env.VITE_CUSTOM_THEME_COLOR;
  const defaultThemeColor = '#1D1D1B';
  
  // Use custom theme color if available, otherwise use default
  const themeColor = customThemeColor && customThemeColor.trim() !== '' 
    ? customThemeColor 
    : defaultThemeColor;
    
  // Update the meta theme-color tag
  let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  
  themeColorMeta.content = themeColor;
  
  console.log(`PWA theme color set to: ${themeColor}`);
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
