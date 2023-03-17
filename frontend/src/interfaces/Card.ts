export type id = string;

export interface Card {
  readonly id: id;
  name: string;
  teamId: string;
  userId: string;
  amount: number;
  laneId: string;
  status?: CardStatus;
  attributes: CardAttribute | undefined;
  closedAt?: string;
  nextFollowUpAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CardAttribute {
  [key: string]: string | number | null;
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
  attributes: CardAttribute | undefined;
  closedAt?: string;
  nextFollowUpAt?: string;
}

export interface CardFormPreview {
  name: string;
  userId: string;
  amount: string;
  laneId: string;
  attributes: CardAttribute | undefined;
  closedAt?: string;
  nextFollowUpAt?: string;
}
