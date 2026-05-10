export const AccountsResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      teamId: { type: 'string' },
      _id: { type: 'string' },
      name: { type: 'string' },
      status: { type: 'string', enum: ['enabled', 'deleted'] },
      attributes: { type: 'object' },
      references: {
        type: ['array', 'null'],
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            entity: { type: ['string', 'null'] },
            schemaAttributeKey: { type: 'string' },
          },
          required: ['_id', 'schemaAttributeKey'],
          additionalProperties: false,
        },
      },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
    required: ['teamId', '_id', 'name', 'status', 'attributes', 'createdAt', 'updatedAt'],
    additionalProperties: false,
  },
};
