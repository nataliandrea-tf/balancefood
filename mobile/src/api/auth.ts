import {apiFetch} from './client';

export type Role = 'estudiante' | 'admin';

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  monthly_balance: number | null;
  current_balance: number | null;
};

export type LoginResponse = {user: User; token: string};

// POST /auth/login -> { user, token }
export function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: {email, password},
  });
}

// GET /auth/me -> { user }  (con el token en el header Authorization)
export function me(token: string) {
  return apiFetch<{user: User}>('/auth/me', {token});
}
