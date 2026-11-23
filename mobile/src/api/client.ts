import {API_URL} from '../config';

// Error normalizado de la API. status 0 = no hubo respuesta (sin conexión).
export type ApiError = {status: number; message: string};

type Opciones = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

// Cliente HTTP mínimo: arma la URL, agrega el token si existe, serializa el
// cuerpo a JSON y traduce los errores de la API a un mensaje claro para la UI.
export async function apiFetch<T>(path: string, opciones: Opciones = {}): Promise<T> {
  const {method = 'GET', body, token} = opciones;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err: ApiError = {
      status: 0,
      message: 'No se pudo conectar con el servidor. Revisa tu conexión.',
    };
    throw err;
  }

  const texto = await response.text();
  const data = texto ? JSON.parse(texto) : null;

  if (!response.ok) {
    const message: string =
      data?.error || (data?.errors ? data.errors.join(', ') : null) || 'Ocurrió un error inesperado.';
    const err: ApiError = {status: response.status, message};
    throw err;
  }

  return data as T;
}
