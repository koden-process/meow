import { Response, NextFunction } from 'express';
import { OpportunityTransfer, NewOpportunityTransfer, TransferStatus } from '../entities/OpportunityTransfer.js';
import { Team } from '../entities/Team.js';
import { Card } from '../entities/Card.js';
import { Lane } from '../entities/Lane.js';
import { EntityHelper } from '../helpers/EntityHelper.js';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest.js';
import { validateAndFetchCard, validateAndFetchTeam, validateAndFetchUser } from '../helpers/EntityFetchHelper.js';
import { EntityNotFoundError } from '../errors/EntityNotFoundError.js';
import { InvalidRequestError } from '../errors/InvalidRequestError.js';
import { ObjectId } from 'mongodb';

const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { body } = req;
    
    // Validate required fields
    if (!body.cardId || !body.toTeamId) {
      throw new InvalidRequestError('cardId and toTeamId are required');
    }

    // Fetch and validate the card belongs to the user's team
    const card = await validateAndFetchCard(body.cardId, req.jwt.user);
    
    // Fetch and validate the target team exists
    const toTeam = await EntityHelper.findOneById(Team, body.toTeamId);
    if (!toTeam) {
      throw new EntityNotFoundError('Target team not found');
    }

    // Prevent transfer to the same team
    if (card.teamId.toString() === body.toTeamId.toString()) {
      throw new InvalidRequestError('Cannot transfer opportunity to the same team');
    }

    // Check if there's already a pending transfer for this card
    const existingTransfer = await EntityHelper.findOneBy(OpportunityTransfer, {
      cardId: card._id,
      status: TransferStatus.Pending
    });

    if (existingTransfer) {
      throw new InvalidRequestError('There is already a pending transfer for this opportunity');
    }

    // Create the transfer request
    const transfer = new NewOpportunityTransfer(req.jwt.user, toTeam, card, body.message);
    const created = await EntityHelper.create(transfer, OpportunityTransfer);

    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
};

const list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as string;
    let query: any = {};

    if (type === 'sent') {
      // Get transfers sent by the current user
      query.fromUserId = req.jwt.user._id;
    } else if (type === 'received') {
      // Get transfers received by the current user's team
      query.toTeamId = req.jwt.user.teamId;
    } else {
      // Get all transfers related to the user (sent or received)
      query = {
        $or: [
          { fromUserId: req.jwt.user._id },
          { toTeamId: req.jwt.user.teamId }
        ]
      };
    }

    const transfers = await EntityHelper.findBy(OpportunityTransfer, query);
    
    return res.json(transfers);
  } catch (error) {
    return next(error);
  }
};

const accept = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const transferId = req.params.id;
    if (!transferId) {
      throw new InvalidRequestError('Transfer ID is required');
    }

    // Fetch the transfer
    const transfer = await EntityHelper.findOneById(OpportunityTransfer, transferId);
    if (!transfer) {
      throw new EntityNotFoundError('Transfer not found');
    }

    // Verify the transfer is for the current user's team
    if (transfer.toTeamId.toString() !== req.jwt.user.teamId.toString()) {
      throw new EntityNotFoundError('Transfer not found');
    }

    // Verify the transfer is still pending
    if (transfer.status !== TransferStatus.Pending) {
      throw new InvalidRequestError('Transfer is no longer pending');
    }

    // Fetch the card to be transferred
    const card = await EntityHelper.findOneById(Card, transfer.cardId);
    if (!card) {
      throw new EntityNotFoundError('Opportunity not found');
    }

    // Find the lane with the lowest index for the accepting team (first lane)
    // Use the same logic as LaneController.list to ensure consistency
    console.log('Looking for lanes for team:', transfer.toTeamId);
    console.log('Current user team:', req.jwt.user.teamId);
    
    // Verify that the user's team is the target team
    if (req.jwt.user.teamId.toString() !== transfer.toTeamId.toString()) {
      throw new EntityNotFoundError('Transfer target team mismatch');
    }
    
    const lanes = await EntityHelper.findByTeam(Lane, req.jwt.team);
    
    console.log('Found lanes:', lanes.map(l => ({ id: l._id, name: l.name, index: l.index })));
    
    if (!lanes || lanes.length === 0) {
      throw new EntityNotFoundError('No lanes found for the target team');
    }
    
    // Sort by index and take the first one (most explicit way)
    lanes.sort((a, b) => {
      const indexA = typeof a.index === 'number' ? a.index : 999999;
      const indexB = typeof b.index === 'number' ? b.index : 999999;
      return indexA - indexB;
    });
    
    const targetLane = lanes[0];
    
    if (!targetLane) {
      throw new EntityNotFoundError('No valid lane found for the target team');
    }
    
    console.log('Selected target lane:', { id: targetLane._id, name: targetLane.name, index: targetLane.index });

    // Update the transfer status
    transfer.status = TransferStatus.Accepted;
    transfer.respondedBy = req.jwt.user._id;
    transfer.respondedAt = new Date();
    transfer.responseMessage = req.body.responseMessage;
    transfer.updatedAt = new Date();

    // Transfer the card to the new team, assign to the accepting user, and move to lane 0
    const oldTeamId = card.teamId;
    const oldUserId = card.userId;
    const oldLaneId = card.laneId;
    
    card.teamId = transfer.toTeamId;
    card.userId = req.jwt.user._id;
    card.laneId = targetLane._id;
    card.updatedAt = new Date();

    console.log(`Transferring card ${card._id}:`, {
      from: { teamId: oldTeamId, userId: oldUserId, laneId: oldLaneId },
      to: { teamId: card.teamId, userId: card.userId, laneId: card.laneId },
      targetLane: { id: targetLane._id, name: targetLane.name, index: targetLane.index }
    });

    // Save both entities
    const updatedTransfer = await EntityHelper.update(transfer);
    await EntityHelper.update(card);

    return res.json(updatedTransfer);
  } catch (error) {
    return next(error);
  }
};

const decline = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const transferId = req.params.id;
    if (!transferId) {
      throw new InvalidRequestError('Transfer ID is required');
    }

    // Fetch the transfer
    const transfer = await EntityHelper.findOneById(OpportunityTransfer, transferId);
    if (!transfer) {
      throw new EntityNotFoundError('Transfer not found');
    }

    // Verify the transfer is for the current user's team
    if (transfer.toTeamId.toString() !== req.jwt.user.teamId.toString()) {
      throw new EntityNotFoundError('Transfer not found');
    }

    // Verify the transfer is still pending
    if (transfer.status !== TransferStatus.Pending) {
      throw new InvalidRequestError('Transfer is no longer pending');
    }

    // Update the transfer status
    transfer.status = TransferStatus.Declined;
    transfer.respondedBy = req.jwt.user._id;
    transfer.respondedAt = new Date();
    transfer.responseMessage = req.body.responseMessage;
    transfer.updatedAt = new Date();

    const updatedTransfer = await EntityHelper.update(transfer);

    return res.json(updatedTransfer);
  } catch (error) {
    return next(error);
  }
};

const get = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const transferId = req.params.id;
    if (!transferId) {
      throw new InvalidRequestError('Transfer ID is required');
    }

    const transfer = await EntityHelper.findOneById(OpportunityTransfer, transferId);
    if (!transfer) {
      throw new EntityNotFoundError('Transfer not found');
    }

    // Verify the user has access to this transfer (either sender or receiver)
    const userTeamId = req.jwt.user.teamId.toString();
    const fromTeamId = transfer.fromTeamId.toString();
    const toTeamId = transfer.toTeamId.toString();

    if (userTeamId !== fromTeamId && userTeamId !== toTeamId) {
      throw new EntityNotFoundError('Transfer not found');
    }

    return res.json(transfer);
  } catch (error) {
    return next(error);
  }
};

export const OpportunityTransferController = {
  create,
  list,
  accept,
  decline,
  get,
};