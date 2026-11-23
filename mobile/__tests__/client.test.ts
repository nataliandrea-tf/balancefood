import {apiFetch} from '../src/api/client';

// Tests del servicio que llama a la API (lógica crítica).
describe('apiFetch', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    (globalThis as unknown as {fetch: jest.Mock}).fetch = fetchMock;
    fetchMock.mockReset();
  });

  it('agrega el header Authorization cuando hay token', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({id: 1}),
    });

    await apiFetch('/auth/me', {token: 'abc123'});

    const opciones = fetchMock.mock.calls[0][1];
    expect(opciones.headers.Authorization).toBe('Bearer abc123');
  });

  it('lanza el mensaje de error de la API cuando la respuesta no es ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({error: 'Correo o contraseña incorrectos'}),
    });

    await expect(
      apiFetch('/auth/login', {method: 'POST', body: {email: 'x'}}),
    ).rejects.toMatchObject({status: 401, message: 'Correo o contraseña incorrectos'});
  });

  it('informa falta de conexión cuando fetch falla', async () => {
    fetchMock.mockRejectedValue(new Error('network'));

    await expect(apiFetch('/restaurants')).rejects.toMatchObject({status: 0});
  });
});
