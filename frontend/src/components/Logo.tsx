import React from 'react';
import { getLogoConfig, getLogoStyles, hasCustomLogo } from '../helpers/LogoHelper';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ className, style }) => {
  const logoConfig = getLogoConfig();
  const logoStyles = getLogoStyles(logoConfig);
  
  const combinedStyles = {
    ...logoStyles,
    ...style
  };
  
  return (
    <img 
      src={logoConfig.url}
      alt={logoConfig.alt}
      className={className}
      style={combinedStyles}
      onError={(e) => {
        console.warn(`Failed to load logo: ${logoConfig.url}`);
        // Hide the logo if it fails to load
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};
