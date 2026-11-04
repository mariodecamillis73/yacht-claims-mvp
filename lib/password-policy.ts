export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_HELP =
  'Use at least 8 characters, including a letter, a number and a special character. Uppercase letters are optional.';

export function isValidPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    new TextEncoder().encode(password).length <= PASSWORD_MAX_LENGTH &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password)
  );
}
