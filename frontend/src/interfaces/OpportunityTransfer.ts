import { id } from './Card';

export interface OpportunityTransfer {
  readonly _id: id;
  fromUserId: string;
  fromTeamId: string;
  toTeamId: string;
  cardId: string;
  status: TransferStatus;
  message?: string;
  responseMessage?: string;
  respondedBy?: string;
  respondedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export enum TransferStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Declined = 'declined',
}

export interface TransferRequest {
  cardId: string;
  toTeamId: string;
  message?: string;
}

export interface TransferResponse {
  responseMessage: string;
}