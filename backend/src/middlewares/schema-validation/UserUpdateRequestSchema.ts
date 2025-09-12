export const UserUpdateRequestSchema = {
  type: 'object',
  properties: {
    animal: { type: 'string', maxLength: 500 },
    color: {
      type: 'string',
      maxLength: 7,
      minLength: 7,
    },
    status: { type: 'string', maxLength: 50 },
    initials: { 
      type: ['string', 'null'], 
      maxLength: 2 
    },
    theme: {
      type: 'string',
      enum: ['light', 'dark'],
    },
  },
  additionalProperties: false,
};
