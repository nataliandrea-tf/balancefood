import {apiFetch} from './client';
import type {Role} from './auth';

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

// GET /admin/users (solo admin; un estudiante recibe 403).
export function getUsers(token: string) {
  return apiFetch<AdminUser[]>('/admin/users', {token});
}
