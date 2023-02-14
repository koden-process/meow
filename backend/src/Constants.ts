export const SERVICE_NAME = 'meow-backend-service';
export const MAXIMUM_LENGTH_OF_USER_NAME = 20;
export const MINIMUM_LENGTH_OF_USER_NAME = 5;
export const MAXIMUM_LENGTH_OF_USER_PASSWORD = 40;
export const MINIMUM_LENGTH_OF_USER_PASSWORD = 5;
export const IS_ISO_8601_REGEXP =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
export const FILTER_BY_NONE = { name: 'Everyone', key: 'all' };

export const DefaultLanes = [
  { name: 'Not Qualified', inForecast: true, tags: { type: 'normal' } },
  { name: 'Qualified', inForecast: true, tags: { type: 'normal' } },
  { name: 'Comitted', inForecast: true, tags: { type: 'normal' } },
  {
    name: 'Closed Won',
    color: '#00b359',
    inForecast: false,
    tags: { type: 'closed-won' },
  },
  {
    name: 'Closed Lost',
    color: '#e30544',
    inForecast: false,
    tags: { type: 'closed-lost' },
  },
];
