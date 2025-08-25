import {
  MINIMUM_LENGTH_OF_USER_NAME,
  MAXIMUM_LENGTH_OF_USER_NAME,
  RESERVED_USERS,
  MINIMUM_LENGTH_OF_USER_PASSWORD,
  MAXIMUM_LENGTH_OF_USER_PASSWORD,
} from '../Constants';

export const UserHelper = {
  isValidNameAndPassword(firstName: string | undefined, lastName: string | undefined, password: string | undefined) {
    if (!firstName || !lastName || !password) {
      return false;
    }

    if (firstName.length < MINIMUM_LENGTH_OF_USER_NAME || firstName.length > MAXIMUM_LENGTH_OF_USER_NAME) {
      return false;
    }

    if (lastName.length < MINIMUM_LENGTH_OF_USER_NAME || lastName.length > MAXIMUM_LENGTH_OF_USER_NAME) {
      return false;
    }

    let combinedName = firstName + " " + lastName;

    if (RESERVED_USERS.includes(combinedName)) {
      return false;
    }

    if (
      password.length < MINIMUM_LENGTH_OF_USER_PASSWORD ||
      password.length > MAXIMUM_LENGTH_OF_USER_PASSWORD
    ) {
      return false;
    }

    return true;
  },

  isValidName(name: string) {
    if (!name) {
      return false;
    }

    if (name.length < MINIMUM_LENGTH_OF_USER_NAME || name.length > MAXIMUM_LENGTH_OF_USER_NAME) {
      return false;
    }

    if (RESERVED_USERS.includes(name)) {
      return false;
    }

    return true;
  },
};
