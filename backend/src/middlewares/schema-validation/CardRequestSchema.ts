export const CardRequestSchema = {
  type: 'object',
  required: ['lane', 'name', 'amount'],
  properties: {
    lane: { type: 'string' },
    name: { type: 'string' },
    amount: { type: 'number' },
    closedAt: { type: ['string', 'null'] },
  },
  additionalProperties: false,
};
