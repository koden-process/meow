export const OpportunityTransferRequestSchema = {
  type: 'object',
  required: ['cardId', 'toTeamId'],
  properties: {
    cardId: { type: 'string' },
    toTeamId: { type: 'string' },
    message: { type: 'string' },
  },
  additionalProperties: false,
};

export const OpportunityTransferResponseSchema = {
  type: 'object',
  required: ['responseMessage'],
  properties: {
    responseMessage: { type: 'string' },
  },
  additionalProperties: false,
};