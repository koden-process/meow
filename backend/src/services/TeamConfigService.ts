import { TeamConfig } from '../entities/TeamConfig.js';
import { Team } from '../entities/Team.js';
import { Schema } from '../entities/Schema.js';
import { Lane } from '../entities/Lane.js';
import { ObjectId } from 'mongodb';
import { EntityHelper } from '../helpers/EntityHelper.js';

export class TeamConfigService {
    // Export config from a team
    static async exportConfig(teamId: ObjectId) {
        // Récupérer les schemas de la team
        const schemas = await EntityHelper.findBy(Schema, { teamId });
        // Récupérer les lanes de la team
        const lanes = await EntityHelper.findBy(Lane, { teamId });
        // Récupérer la team
        const team = await EntityHelper.findOneBy(Team, { _id: teamId });
        if (!team) throw new Error('Team not found');
        // Créer la config
        const config = new TeamConfig(
            new ObjectId(),
            `${team.name} config`,
            teamId,
            schemas,
            lanes,
            team.currency,
            new Date(),
            new Date()
        );
        // Sauvegarder la config
        await EntityHelper.create(config);
        return config;
    }

    // Appliquer une config à une team
    static async applyConfig(configId: ObjectId, targetTeamId: ObjectId) {
        const config = await EntityHelper.findOneBy(TeamConfig, { _id: configId });
        if (!config) throw new Error('Config not found');
        
        // Effacer les anciens schemas et lanes de la team cible
        const existingSchemas = await EntityHelper.findBy(Schema, { teamId: targetTeamId });
        const existingLanes = await EntityHelper.findBy(Lane, { teamId: targetTeamId });
        
        for (const schema of existingSchemas) {
            await EntityHelper.remove(Schema, schema);
        }
        
        for (const lane of existingLanes) {
            await EntityHelper.remove(Lane, lane);
        }
        
        // Copier les schemas dans la team cible
        for (const schemaData of config.schemas) {
            const newSchema = new Schema(
                new ObjectId(),
                targetTeamId,
                schemaData.type,
                schemaData.attributes,
                new Date(),
                new Date()
            );
            await EntityHelper.create(newSchema);
        }
        
        // Copier les lanes dans la team cible
        for (const laneData of config.lanes) {
            const newLane = new Lane(
                new ObjectId(),
                targetTeamId,
                new ObjectId(), // Nouveau boardId - à ajuster selon la logique métier
                laneData.name,
                laneData.index,
                laneData.tags,
                laneData.inForecast,
                new Date(),
                new Date(),
                laneData.color
            );
            await EntityHelper.create(newLane);
        }
        
        // Marquer la team comme ayant une config appliquée et appliquer la currency
        const team = await EntityHelper.findOneBy(Team, { _id: targetTeamId });
        if (team) {
            (team as any).appliedConfigId = configId;
            team.currency = config.currency; // Appliquer la devise
            await EntityHelper.update(team);
        }
        return true;
    }

    // Lister les configs
    static async listConfigs() {
        return EntityHelper.findBy(TeamConfig, {});
    }

    // Supprimer une config (seulement si elle appartient à la team de l'utilisateur)
    static async deleteConfig(configId: ObjectId, userTeamId: ObjectId) {
        const config = await EntityHelper.findOneBy(TeamConfig, { _id: configId });
        if (!config) throw new Error('Config not found');
        
        // Vérifier que la config appartient à la team de l'utilisateur
        if (!config.sourceTeamId.equals(userTeamId)) {
            throw new Error('You can only delete configurations from your own team');
        }
        
        await EntityHelper.remove(TeamConfig, config);
        return true;
    }
}
