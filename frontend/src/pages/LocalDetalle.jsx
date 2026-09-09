import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LocalDetalle() {
  const { id } = useParams();
  const { user, actualizarSaldo } = useAuth();
  const navigate = useNavigate();

  const [local, setLocal] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [registrando, setRegistrando] = useState(null);

  useEffect(() => {
    setCargando(true);
    api
      .get(`/restaurants/${id}`, { auth: false })
      .then(setLocal)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id]);

  async function registrarConsumo(item) {
    if (!user) {
      navigate("/login");
      return;
    }

    setRegistrando(item.id);
    setError(null);
    setMensaje(null);

    try {
      await api.post("/expenses", {
        expense: {
          amount: item.price,
          description: `${item.name} — ${local.name}`,
          spent_on: new Date().toISOString().slice(0, 10),
          menu_item_id: item.id,
        },
      });

      const datos = await api.get("/auth/me");
      actualizarSaldo(datos.user.current_balance);
      setMensaje(`Gasto de $${item.price} registrado.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistrando(null);
    }
  }

  if (cargando) return <p className="cargando">Cargando…</p>;
  if (error && !local) return <p className="error">{error}</p>;
  if (!local) return null;

  const asequibles = user?.current_balance ?? null;

  return (
    <>
      <Link to="/" className="suave">← Volver al catálogo</Link>

      <h1 style={{ marginTop: 16 }}>{local.name}</h1>
      <p className="suave" style={{ marginTop: -12 }}>
        {local.category} · {local.campus} · {local.address}
      </p>
      {local.description && <p>{local.description}</p>}

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="exito">{mensaje}</p>}

      <h2 style={{ marginTop: 28 }}>Carta</h2>

      {local.menu_items.length === 0 && (
        <p className="vacio">Este local aún no publica su carta.</p>
      )}

      <div className="grilla">
        {local.menu_items.map((item) => {
          const alcanza = asequibles === null || item.price <= asequibles;

          return (
            <div className="tarjeta" key={item.id}>
              <h3>{item.name}</h3>
              {item.description && <p className="suave">{item.description}</p>}
              <p className="precio">${item.price}</p>

              {!item.available && <p className="suave">No disponible hoy</p>}

              {user && !alcanza && (
                <p className="suave">Supera tu saldo actual</p>
              )}

              <div className="acciones">
                <button
                  onClick={() => registrarConsumo(item)}
                  disabled={registrando === item.id || !item.available}
                >
                  {registrando === item.id ? "Registrando…" : "Registrar consumo"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
