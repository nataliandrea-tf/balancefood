import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import LoginScreen from '../src/screens/LoginScreen';

// Se simula el contexto de autenticación para probar el formulario aislado.
const mockIniciarSesion = jest.fn();
jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({iniciarSesion: mockIniciarSesion}),
}));

describe('LoginScreen', () => {
  beforeEach(() => mockIniciarSesion.mockReset());

  it('muestra el título de la app', () => {
    const {getByText} = render(<LoginScreen />);
    expect(getByText('BalanceFood')).toBeTruthy();
  });

  it('no envía y muestra error si los campos están vacíos', () => {
    const {getByText} = render(<LoginScreen />);

    fireEvent.press(getByText('Entrar'));

    expect(getByText('Ingresa tu correo y contraseña.')).toBeTruthy();
    expect(mockIniciarSesion).not.toHaveBeenCalled();
  });

  it('llama a iniciarSesion con el correo y la contraseña', async () => {
    const {getByText, getByPlaceholderText} = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Correo'), 'demo@utem.cl');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'balancefood2026');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() =>
      expect(mockIniciarSesion).toHaveBeenCalledWith('demo@utem.cl', 'balancefood2026'),
    );
  });
});
