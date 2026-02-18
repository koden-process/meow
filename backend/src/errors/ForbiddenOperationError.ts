import { StatusCodes } from 'http-status-codes';
import { ApplicationError } from './ApplicationError.js';

export class ForbiddenOperationError extends ApplicationError {
  constructor(description?: string) {
    super(ForbiddenOperationError.name, StatusCodes.FORBIDDEN, description);
  }
}

