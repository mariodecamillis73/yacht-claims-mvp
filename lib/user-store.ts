import bcrypt from 'bcryptjs';

export type AppRole = 'admin' | 'representative' | 'supplier';

export type StoredUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: AppRole;
  yachtId?: string | null;
  supplierCompany?: string | null;
  isActive?: boolean;
};

const STORAGE_KEY = 'yacht-claims-users';
const SESSION_KEY = 'yacht-claims-current-user';

const defaultUsers: StoredUser[] = [
  {
    id: 'admin-1',
    firstName: 'After',
    lastName: 'Sales',
    email: 'aftersales@yyachts.de',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'admin',
    yachtId: null,
    supplierCompany: null,
    isActive: true,
  },
  {
    id: 'rep-1',
    firstName: 'Blue',
    lastName: 'Horizon Rep',
    email: 'rep@bluehorizon.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'representative',
    yachtId: 'yacht-1',
    supplierCompany: null,
    isActive: true,
  },
  {
    id: 'rep-2',
    firstName: 'Silver',
    lastName: 'Tide Rep',
    email: 'rep@silvertide.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'representative',
    yachtId: 'yacht-2',
    supplierCompany: null,
    isActive: true,
  },
  {
    id: 'supplier-1',
    firstName: 'Marine',
    lastName: 'Supplier',
    email: 'supplier@marineparts.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'supplier',
    yachtId: null,
    supplierCompany: 'supplier-1',
    isActive: true,
  },
];

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getUserRegistry(): StoredUser[] {
  const stored = readStorage<StoredUser[]>(STORAGE_KEY);
  if (stored && stored.length > 0) return stored;
  writeStorage(STORAGE_KEY, defaultUsers);
  return defaultUsers;
}

export function saveUserRegistry(users: StoredUser[]) {
  writeStorage(STORAGE_KEY, users);
}

export function createUser(input: Omit<StoredUser, 'id' | 'passwordHash'> & { password: string }): StoredUser {
  const users = getUserRegistry();
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash: bcrypt.hashSync(input.password, 10),
    role: input.role,
    yachtId: input.yachtId ?? null,
    supplierCompany: input.supplierCompany ?? null,
    isActive: input.isActive ?? true,
  };

  const nextUsers = [...users, newUser];
  saveUserRegistry(nextUsers);
  return newUser;
}

export function loginWithCredentials(email: string, password: string) {
  const users = getUserRegistry();
  const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.isActive !== false);
  if (!user) return null;
  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) return null;

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    yachtId: user.yachtId ?? null,
    supplierCompany: user.supplierCompany ?? null,
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  }

  return safeUser;
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(SESSION_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function isAdmin(user: any) {
  return user?.role === 'admin';
}

export function isRepresentative(user: any) {
  return user?.role === 'representative';
}

export function isSupplier(user: any) {
  return user?.role === 'supplier';
}
