import { Entity } from '../helpers/EntityDecorator.js';
import { ObjectId } from 'mongodb';
import { CurrencyCode } from './Team.js';

@Entity({ name: 'TeamConfigs' })
export class TeamConfig {
    _id: ObjectId;
    name: string; // Nom de la config
    description?: string;
    sourceTeamId: ObjectId; // Team d'origine
    schemas: any[]; // Schémas exportés
    lanes: any[]; // Lanes exportées
    currency: CurrencyCode; // Devise de la team
    createdAt: Date;
    updatedAt: Date;

    constructor(
        _id: ObjectId,
        name: string,
        sourceTeamId: ObjectId,
        schemas: any[],
        lanes: any[],
        currency: CurrencyCode,
        createdAt: Date,
        updatedAt: Date,
        description?: string
    ) {
        this._id = _id;
        this.name = name;
        this.sourceTeamId = sourceTeamId;
        this.schemas = schemas;
        this.lanes = lanes;
        this.currency = currency;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.description = description;
    }
}
