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
      references: { type: ['object', 'null'] },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
    required: ['teamId', '_id', 'name', 'status', 'attributes', 'createdAt', 'updatedAt'],
    additionalProperties: false,
  },
};
