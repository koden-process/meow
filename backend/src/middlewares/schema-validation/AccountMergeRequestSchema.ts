export const AccountMergeRequestSchema = {
  type: 'object',
  properties: {
    sourceAccountId: { type: 'string' },
  },
  required: ['sourceAccountId'],
  additionalProperties: false,
};
