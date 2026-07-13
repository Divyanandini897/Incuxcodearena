export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_\-+!@#$%^&*]).{8,}$/;
export const SPECIAL_CHARS = '_ - + ! @ # $ % ^ & *';

export interface PasswordCheck {
  label: string;
  met: boolean;
}

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: '8+ characters', met: password.length >= 8 },
    { label: '1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: '1 lowercase letter', met: /[a-z]/.test(password) },
    { label: '1 number', met: /\d/.test(password) },
    { label: `1 special character (${SPECIAL_CHARS})`, met: /[_\-+!@#$%^&*]/.test(password) },
  ];
}

export function isStrongPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
