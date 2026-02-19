import { Provider, defaultTheme } from '@adobe/react-spectrum';
import { getBrowserLocale } from '../helpers/Helper';
import { useTheme } from '../hooks/useTheme';

interface SpectrumProviderProps {
  children: React.ReactNode;
}

export const SpectrumProvider = ({ children }: SpectrumProviderProps) => {
  const theme = useTheme();
  const colorScheme = theme === 'light' ? 'light' : 'dark';

  return (
    <Provider 
      height="100%" 
      locale={getBrowserLocale()} 
      theme={defaultTheme}
      colorScheme={colorScheme}
    >
      {children}
    </Provider>
  );
};
