import { Attribute } from './Attribute';
import { id } from './Card';
import { Reference } from './Reference';

export enum AccountStatus {
  Active = 'active',
  Deleted = 'deleted',
}

export interface Account {
  readonly _id: id;
  name: string;
  status?: AccountStatus; // Optional for backward compatibility with existing accounts
  attributes: Attribute | undefined;
  references?: Reference[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AccountPreview {
  name: string;
  attributes: Attribute | undefined;
}
