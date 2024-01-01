export enum TOKEN_TYPES {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail'
}

// key in local storage
export const KEY_LS_ACCESS_TOKEN = 'abc';
export const KEY_LS_REFRESH_TOKEN = 'bcd';

export const tokenTypes = Object.values(TOKEN_TYPES);
