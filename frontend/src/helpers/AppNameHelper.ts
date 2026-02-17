import { getCustomAppName } from '../utils/env';

export const setDynamicAppName = (): void => {
  const customAppName = getCustomAppName();
  const defaultAppName = 'Meow Sales Pipeline';

  const appName = customAppName &&
    customAppName.trim() !== '' &&
    customAppName !== 'VITE_CUSTOM_APP_NAME'
    ? customAppName
    : defaultAppName;

  document.title = appName;

  console.log(`App name set to: ${appName}`);
};

export const updateAppName = (name: string): void => {
  document.title = name;
  console.log(`App name updated to: ${name}`);
};

