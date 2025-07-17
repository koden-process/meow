import { Entity } from '../helpers/EntityDecorator.js';
import { ExistingEntity, NewEntity } from './BaseEntity.js';
import { ObjectId } from 'mongodb';
import { User } from './User.js';
import { Team } from './Team.js';
import { Card } from './Card.js';

@Entity({ name: 'OpportunityTransfers' })
export class OpportunityTransfer implements ExistingEntity {
  _id: ObjectId;
  fromUserId: ObjectId;
  fromTeamId: ObjectId;
  toTeamId: ObjectId;
  cardId: ObjectId;
  status: TransferStatus;
  message?: string;
  responseMessage?: string;
  respondedBy?: ObjectId;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    _id: ObjectId,
    fromUserId: ObjectId,
    fromTeamId: ObjectId,
    toTeamId: ObjectId,
    cardId: ObjectId,
    status: TransferStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    this._id = _id;
    this.fromUserId = fromUserId;
    this.fromTeamId = fromTeamId;
    this.toTeamId = toTeamId;
    this.cardId = cardId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toPlain(): PlainOpportunityTransfer {
    return {
      _id: this._id?.toString()!,
      fromUserId: this.fromUserId.toString(),
      fromTeamId: this.fromTeamId.toString(),
      toTeamId: this.toTeamId.toString(),
      cardId: this.cardId.toString(),
      status: this.status,
      message: this.message,
      responseMessage: this.responseMessage,
      respondedBy: this.respondedBy?.toString(),
      respondedAt: this.respondedAt,
      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    };
  }
}

export enum TransferStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Declined = 'declined',
}

export interface PlainOpportunityTransfer {
  _id: string;
  fromUserId: string;
  fromTeamId: string;
  toTeamId: string;
  cardId: string;
  status: TransferStatus;
  message?: string;
  responseMessage?: string;
  respondedBy?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Entity({ name: 'OpportunityTransfers' })
export class NewOpportunityTransfer implements NewEntity {
  fromUserId: ObjectId;
  fromTeamId: ObjectId;
  toTeamId: ObjectId;
  cardId: ObjectId;
  status: TransferStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(fromUser: User, toTeam: Team, card: Card, message?: string) {
    this.fromUserId = fromUser._id!;
    this.fromTeamId = fromUser.teamId;
    this.toTeamId = toTeam._id!;
    this.cardId = card._id!;
    this.status = TransferStatus.Pending;
    this.message = message;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}