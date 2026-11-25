import {apiFetch} from './client';

export type Restaurant = {
  id: number;
  name: string;
  address: string;
  campus: string;
  category: string;
  description: string;
  user_id: number;
};

export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  available: boolean;
  restaurant_id: number;
};

export type RestaurantConMenu = Restaurant & {menu_items: MenuItem[]};

// GET /restaurants (público). El token es opcional; se manda si existe.
export function getRestaurants(token?: string | null) {
  return apiFetch<Restaurant[]>('/restaurants', {token});
}

// GET /restaurants/:id -> incluye la carta (menu_items).
export function getRestaurant(id: number, token?: string | null) {
  return apiFetch<RestaurantConMenu>(`/restaurants/${id}`, {token});
}

// GET /restaurants/mine -> los locales del usuario autenticado (su dueño).
export function getMisLocales(token: string) {
  return apiFetch<Restaurant[]>('/restaurants/mine', {token});
}

export type NuevoPlato = {
  name: string;
  price: number;
  description?: string;
  category?: string;
};

// POST /restaurants/:id/menu_items -> agrega un plato a la carta del local.
// La API solo lo permite si el usuario es dueño del local (locatario).
export function createMenuItem(token: string, restaurantId: number, plato: NuevoPlato) {
  return apiFetch<MenuItem>(`/restaurants/${restaurantId}/menu_items`, {
    method: 'POST',
    token,
    body: {menu_item: plato},
  });
}
