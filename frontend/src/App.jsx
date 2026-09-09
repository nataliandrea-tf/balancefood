import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Locales from "./pages/Locales";
import LocalDetalle from "./pages/LocalDetalle";
import MisLocales from "./pages/MisLocales";
import Gastos from "./pages/Gastos";

function Navegacion() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function salir() {
    logout();
    navigate("/login");
  }

  return (
    <nav>
      <div className="contenedor">
        <Link to="/" className="marca">BalanceFood</Link>
        <Link to="/">Locales</Link>
        {user && <Link to="/mis-locales">Mis locales</Link>}
        {user && <Link to="/gastos">Mis gastos</Link>}

        <div className="derecha">
          {user ? (
            <>
              <span className="saldo">${user.current_balance ?? 0}</span>
              <button className="secundario" onClick={salir}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login">Ingresar</Link>
              <Link to="/registro">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function RutaPrivada({ children }) {
  const { user, cargando } = useAuth();

  if (cargando) return <p className="cargando">Cargando…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { cargando } = useAuth();

  if (cargando) return <p className="cargando">Cargando…</p>;

  return (
    <>
      <Navegacion />
      <div className="contenedor">
        <Routes>
          <Route path="/" element={<Locales />} />
          <Route path="/locales/:id" element={<LocalDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/mis-locales" element={<RutaPrivada><MisLocales /></RutaPrivada>} />
          <Route path="/gastos" element={<RutaPrivada><Gastos /></RutaPrivada>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}