export const TeamRequestSchema = {
  type: 'object',
  properties: {
    currency: { type: 'string', minLength: 3, maxLength: 3 },
    customLabels: {
      type: 'object',
      properties: {
        opportunityAmount: {
          type: 'string',
          maxLength: 50
        },
      },
      additionalProperties: false,
    },
  },
  required: ['currency'],
  additionalProperties: false,
};
