import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function Locales() {
  const [locales, setLocales] = useState([]);
  const [campus, setCampus] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    const query = campus ? `?campus=${encodeURIComponent(campus)}` : "";

    api
      .get(`/restaurants${query}`, { auth: false })
      .then((data) => {
        if (!cancelado) setLocales(data);
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [campus]);

  const campusDisponibles = [...new Set(locales.map((l) => l.campus))].sort();

  return (
    <>
      <h1>Locales asociados</h1>
      <p className="suave" style={{ marginTop: -12, marginBottom: 20 }}>
        Precios reales de menús cerca de tu campus.
      </p>

      <label style={{ maxWidth: 280 }}>
        <span>Filtrar por campus</span>
        <select value={campus} onChange={(e) => setCampus(e.target.value)}>
          <option value="">Todos</option>
          {campusDisponibles.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}
      {cargando && <p className="cargando">Cargando locales…</p>}

      {!cargando && !error && locales.length === 0 && (
        <p className="vacio">No hay locales registrados todavía.</p>
      )}

      <div className="grilla">
        {locales.map((local) => (
          <div className="tarjeta" key={local.id}>
            <h3>{local.name}</h3>
            <p className="suave">{local.category} · {local.campus}</p>
            <p className="suave">{local.address}</p>
            {local.description && <p>{local.description}</p>}
            <div className="acciones">
              <Link to={`/locales/${local.id}`}>
                <button className="secundario">Ver carta</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}