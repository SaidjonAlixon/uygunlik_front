// Shared database for all API routes
// In production, this should be replaced with a real database

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  status: boolean;
  created_at: string;
  updated_at?: string;
  courses: any[];
}

// Global users array - shared across all API routes
export let users: User[] = [];
export let nextId = 1;

// Helper functions
export function addUser(user: Omit<User, 'id'>): User {
  const newUser: User = {
    ...user,
    id: nextId++,
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

export function findUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email);
}

export function findUserById(id: number): User | undefined {
  return users.find(user => user.id === id);
}

export function updateUser(id: number, updates: Partial<User>): User | undefined {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return undefined;
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  return users[userIndex];
}
