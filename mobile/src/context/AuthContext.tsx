import React, {createContext, useContext, useEffect, useState} from 'react';
import {login as apiLogin, me as apiMe, User} from '../api/auth';
import {clearToken, getToken, saveToken} from '../storage/token';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  cargando: boolean; // true mientras se revisa si hay una sesión guardada
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  refrescarUsuario: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app, si hay un token guardado, se valida pidiendo /auth/me.
  // Si el token venció o es inválido (401), se borra y se vuelve al login.
  useEffect(() => {
    (async () => {
      try {
        const guardado = await getToken();
        if (guardado) {
          const {user: u} = await apiMe(guardado);
          setToken(guardado);
          setUser(u);
        }
      } catch {
        await clearToken();
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  async function iniciarSesion(email: string, password: string) {
    const {user: u, token: t} = await apiLogin(email, password);
    await saveToken(t);
    setToken(t);
    setUser(u);
  }

  async function cerrarSesion() {
    await clearToken();
    setToken(null);
    setUser(null);
  }

  // Vuelve a pedir /auth/me para refrescar datos como el saldo (por ejemplo
  // después de registrar un consumo).
  async function refrescarUsuario() {
    if (!token) {
      return;
    }
    const {user: u} = await apiMe(token);
    setUser(u);
  }

  return (
    <AuthContext.Provider
      value={{user, token, cargando, iniciarSesion, cerrarSesion, refrescarUsuario}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
}
