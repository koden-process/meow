import { Response, NextFunction } from 'express';
import { OpportunityTransfer, NewOpportunityTransfer, TransferStatus } from '../entities/OpportunityTransfer.js';
import { Team } from '../entities/Team.js';
import { Card } from '../entities/Card.js';
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

    // Update the transfer status
    transfer.status = TransferStatus.Accepted;
    transfer.respondedBy = req.jwt.user._id;
    transfer.respondedAt = new Date();
    transfer.responseMessage = req.body.responseMessage;
    transfer.updatedAt = new Date();

    // Transfer the card to the new team and assign to the accepting user
    card.teamId = transfer.toTeamId;
    card.userId = req.jwt.user._id;
    card.updatedAt = new Date();

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