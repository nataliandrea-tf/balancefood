import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Registro() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [datos, setDatos] = useState({
    name: "",
    email: "",
    password: "",
    monthly_balance: "",
  });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function cambiar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    setError(null);

    if (!datos.name.trim() || !datos.email.trim() || !datos.password) {
      setError("Completa nombre, correo y contraseña.");
      return;
    }

    if (datos.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    const saldo = datos.monthly_balance === "" ? null : Number(datos.monthly_balance);

    if (saldo !== null && (Number.isNaN(saldo) || saldo < 0)) {
      setError("El saldo debe ser un número positivo.");
      return;
    }

    setEnviando(true);
    try {
      await signup({
        name: datos.name,
        email: datos.email,
        password: datos.password,
        monthly_balance: saldo,
        current_balance: saldo,
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="centrado">
      <div className="tarjeta">
        <h1>Crear cuenta</h1>

        {error && <p className="error">{error}</p>}

        <form onSubmit={enviar}>
          <label>
            <span>Nombre</span>
            <input value={datos.name} onChange={(e) => cambiar("name", e.target.value)} />
          </label>

          <label>
            <span>Correo</span>
            <input
              type="email"
              value={datos.email}
              onChange={(e) => cambiar("email", e.target.value)}
              placeholder="tucorreo@utem.cl"
            />
          </label>

          <label>
            <span>Contraseña</span>
            <input
              type="password"
              value={datos.password}
              onChange={(e) => cambiar("password", e.target.value)}
            />
          </label>

          <label>
            <span>Saldo JUNAEB mensual (opcional)</span>
            <input
              type="number"
              min="0"
              value={datos.monthly_balance}
              onChange={(e) => cambiar("monthly_balance", e.target.value)}
              placeholder="32000"
            />
          </label>

          <button type="submit" disabled={enviando}>
            {enviando ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <p className="suave" style={{ marginTop: 16 }}>
          ¿Ya tienes cuenta? <Link to="/login">Ingresa</Link>
        </p>
      </div>
    </div>
  );
}