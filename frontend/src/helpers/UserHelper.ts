import {
  MINIMUM_LENGTH_OF_USER_NAME,
  MAXIMUM_LENGTH_OF_USER_NAME,
  RESERVED_USERS,
  MINIMUM_LENGTH_OF_USER_PASSWORD,
  MAXIMUM_LENGTH_OF_USER_PASSWORD,
} from '../Constants';

export const UserHelper = {
  isValidNameAndPassword(name: string | undefined, password: string | undefined) {
    if (!name || !password) {
      return false;
    }

    if (name.length < MINIMUM_LENGTH_OF_USER_NAME || name.length > MAXIMUM_LENGTH_OF_USER_NAME) {
      return false;
    }

    if (RESERVED_USERS.includes(name)) {
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

  /**
   * Génère des initiales par défaut basées sur le nom de l'utilisateur
   * @param name - Nom de l'utilisateur
   * @returns Les initiales générées (1-2 lettres)
   */
  generateDefaultInitials(name: string): string {
    if (!name) return '';
    
    // Divise le nom en mots et prend la première lettre de chaque mot
    const words = name.trim().split(/\s+/);
    
    if (words.length === 1) {
      // Si un seul mot, prend la première lettre
      return words[0].charAt(0).toUpperCase();
    } else {
      // Si plusieurs mots, prend la première lettre des deux premiers mots
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  },

  /**
   * Valide les initiales personnalisées
   * @param initials - Initiales à valider
   * @returns true si les initiales sont valides
   */
  isValidInitials(initials: string): boolean {
    if (!initials) return true; // Vide est valide (utilise les initiales par défaut)
    return /^[a-zA-Z]{1,2}$/.test(initials.trim());
  },
};
