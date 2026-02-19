import { id } from './Card';

export interface User {
  readonly _id: id;
  readonly name: string;
  readonly createdAt?: string;
  readonly teamId: string;
  readonly authentication: 'local' | 'google';
  status: UserStatus;
  invite?: string;
  animal?: string;
  color?: string;
  initials?: string;
  /**
   * 
   * user's theme preferences :
   * 
   * - 'system' : follow the os browser theme / suivre le thème de l'OS/navigateur (valeur par défaut si absent)
   * - 'light'  : force light them / forcer le thème clair
   * - 'dark'   : force dark theme / forcer le thème sombre
   */
  theme?: 'system' | 'light' | 'dark';
  favoriteAccounts?: string[];
}

export enum UserStatus {
  Invited = 'invited',
  Enabled = 'enabled',
  Disabled = 'disabled',
  Deleted = 'deleted',
  SingleSignOn = 'single-sign-on',
}
