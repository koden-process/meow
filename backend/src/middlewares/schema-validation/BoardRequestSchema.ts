export const BoardRequestSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  additionalProperties: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
};
