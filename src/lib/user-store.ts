export interface StoredUser {
  email: string;
  password: string;
  name?: string;
}

const userStore = new Map<string, StoredUser>();

export function saveUser(email: string, password: string, name?: string) {
  userStore.set(email.toLowerCase(), { email: email.toLowerCase(), password, name });
}

export function findUser(email: string): StoredUser | undefined {
  return userStore.get(email.toLowerCase());
}

export function updatePassword(email: string, password: string) {
  const user = userStore.get(email.toLowerCase());
  if (user) {
    user.password = password;
  }
}
