import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("balancefood_token");

    if (!token) {
      setCargando(false);
      return;
    }

    api
      .get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("balancefood_token"))
      .finally(() => setCargando(false));
  }, []);

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password }, { auth: false });
    localStorage.setItem("balancefood_token", data.token);
    setUser(data.user);
  }

  async function signup(datos) {
    const data = await api.post("/auth/signup", { user: datos }, { auth: false });
    localStorage.setItem("balancefood_token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("balancefood_token");
    setUser(null);
  }

  function actualizarSaldo(saldo) {
    setUser((prev) => (prev ? { ...prev, current_balance: saldo } : prev));
  }

  return (
    <AuthContext.Provider
      value={{ user, cargando, login, signup, logout, actualizarSaldo }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}