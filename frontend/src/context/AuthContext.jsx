import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../api/client";
import { AuthContext } from "./auth-context";

const CLAVE_TOKEN = "balancefood_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(() =>
    Boolean(localStorage.getItem(CLAVE_TOKEN))
  );

  useEffect(() => {
    if (!localStorage.getItem(CLAVE_TOKEN)) return;

    api
      .get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem(CLAVE_TOKEN))
      .finally(() => setCargando(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post("/auth/login", { email, password }, { auth: false });
    localStorage.setItem(CLAVE_TOKEN, data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (datos) => {
    const data = await api.post("/auth/signup", { user: datos }, { auth: false });
    localStorage.setItem(CLAVE_TOKEN, data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CLAVE_TOKEN);
    setUser(null);
  }, []);

  const actualizarSaldo = useCallback((saldo) => {
    setUser((prev) => (prev ? { ...prev, current_balance: saldo } : prev));
  }, []);

  const valor = useMemo(
    () => ({ user, cargando, login, signup, logout, actualizarSaldo }),
    [user, cargando, login, signup, logout, actualizarSaldo]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
