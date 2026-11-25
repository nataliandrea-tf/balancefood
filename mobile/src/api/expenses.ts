import {apiFetch} from './client';

export type Expense = {
  id: number;
  amount: number;
  description: string | null;
  spent_on: string;
  menu_item_id: number | null;
};

export type ExpensesResumen = {
  total_gastado?: number;
  saldo_actual?: number | null;
  dias_restantes_mes?: number;
  presupuesto_diario?: number | null;
};

export type ExpensesResponse = {expenses: Expense[]; summary: ExpensesResumen};

// GET /expenses (requiere token) -> gastos del mes + resumen con el saldo.
export function getExpenses(token: string) {
  return apiFetch<ExpensesResponse>('/expenses', {token});
}

export type NuevoGasto = {
  amount: number;
  description?: string;
  spent_on: string;
  menu_item_id?: number;
};

// POST /expenses (requiere token). El backend espera el gasto anidado bajo
// la clave "expense".
export function createExpense(token: string, gasto: NuevoGasto) {
  return apiFetch<Expense>('/expenses', {
    method: 'POST',
    token,
    body: {expense: gasto},
  });
}

// DELETE /expenses/:id (requiere token). Responde 204 sin cuerpo.
export function deleteExpense(token: string, id: number) {
  return apiFetch<null>(`/expenses/${id}`, {method: 'DELETE', token});
}
