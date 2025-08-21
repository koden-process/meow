import { Attribute } from './Attribute.js';
import { Entity } from '../helpers/EntityDecorator.js';
import { ExistingEntity, NewEntity } from './BaseEntity.js';
import { ObjectId } from 'mongodb';
import { Team } from './Team.js';

export enum AccountStatus {
  Active = 'active',
  Deleted = 'deleted',
}

@Entity({ name: 'Accounts' })
export class Account implements ExistingEntity {
  _id: ObjectId;
  teamId: ObjectId;
  name: string;
  status: AccountStatus;
  attributes?: Attribute;
  references?: Reference[];
  createdAt: Date;
  updatedAt: Date;

  constructor(_id?: ObjectId, teamId?: ObjectId, name?: string, status?: AccountStatus, createdAt?: Date, updatedAt?: Date) {
    this._id = _id!;
    this.teamId = teamId!;
    this.name = name!;
    this.status = status || AccountStatus.Active; // Default to Active for existing accounts without status
    this.createdAt = createdAt!;
    this.updatedAt = updatedAt!;
  }

  toPlain(): PlainAccount {
    return {
      _id: this._id.toString(),
      teamId: this.teamId.toString(),
      name: this.name,
      status: this.status,
      attributes: this.attributes,
      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    };
  }
}

@Entity({ name: 'Accounts' })
export class NewAccount implements NewEntity {
  /* static _collection = 'Events'; */

  teamId: ObjectId;
  name: string;
  status: AccountStatus;
  attributes?: Attribute;
  references?: Reference[];
  createdAt: Date;
  updatedAt: Date;

  constructor(team: Team, name: string, attributes: Attribute = {}, references?: Reference[]) {
    this.teamId = team._id;
    this.name = name;
    this.status = AccountStatus.Active;
    this.attributes = attributes;
    this.references = references;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export interface PlainAccount {
  _id: string;
  teamId: string;
  name: string;
  status: AccountStatus;
  attributes?: Attribute;
  createdAt: Date;
  updatedAt: Date;
}

// TODO move to base entity
export interface Reference {
  _id: ObjectId;
  entity: string | null;
  schemaAttributeKey: string;
}
