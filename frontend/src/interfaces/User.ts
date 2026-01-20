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
   * Préférence de thème de l'utilisateur :
   * - 'system' : suivre le thème de l'OS/navigateur (valeur par défaut si absent)
   * - 'light'  : forcer le thème clair
   * - 'dark'   : forcer le thème sombre
   */
  theme?: 'system' | 'light' | 'dark';
}

export enum UserStatus {
  Invited = 'invited',
  Enabled = 'enabled',
  Disabled = 'disabled',
  Deleted = 'deleted',
  SingleSignOn = 'single-sign-on',
}
