export const FavoriteRequestSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['accountId'],
  properties: {
    accountId: {
      type: 'string',
      minLength: 24,
      maxLength: 24,
    },
  },
  additionalProperties: false,
};

