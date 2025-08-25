export const RegisterRequestSchema = {
  type: 'object',
  oneOf: [
    {
      properties: {
        firstName: { type: 'string', minLength: 1, maxLength: 80 },
        lastName: { type: 'string', minLength: 1, maxLength: 80 },
        password: { type: 'string', minLength: 3, maxLength: 50 },
        invite: { type: 'string', minLength: 8, maxLength: 8 },
      },
      required: ['firstName', 'lastName', 'password'],
      additionalProperties: false,
    }
  ],
};
