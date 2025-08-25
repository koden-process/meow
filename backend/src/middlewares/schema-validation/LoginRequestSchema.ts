export const LoginRequestSchema = {
  type: 'object',
  oneOf: [
    {
      properties: {
        firstName: { type: 'string', minLength: 1, maxLength: 80 },
        lastName: { type: 'string', minLength: 1, maxLength: 80 },
        password: { type: 'string', minLength: 3, maxLength: 500 },
      },
      required: ['firstName', 'lastName', 'password'],
    },
    {
      properties: {
        token: { type: 'string', minLength: 1 },
      },
      required: ['token'],
    },
  ],
};
