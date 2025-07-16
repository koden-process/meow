import { Attribute } from './Attribute';

export type id = string;

export interface Card {
  readonly _id: id;
  name: string;
  readonly teamId: string;
  userId: string;
  amount: number;
  laneId: string;
  readonly inLaneSince: string;
  status?: CardStatus;
  attributes: Attribute | undefined;
  closedAt?: string;
  nextFollowUpAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  // Ajout pour la recherche enrichie
  attributesReadable?: { [key: string]: string | number | boolean | null };
}

export enum CardStatus {
  Active = 'active',
  Deleted = 'deleted',
}

export interface CardPreview {
  name: string;
  userId: string;
  amount: number;
  laneId: string;
  attributes: Attribute | undefined;
  closedAt?: string;
  nextFollowUpAt?: string;
}

export interface CardFormPreview {
  name: string;
  userId: string;
  amount: string;
  laneId: string;
  attributes: Attribute | undefined;
  closedAt?: string;
  nextFollowUpAt?: string;
}
