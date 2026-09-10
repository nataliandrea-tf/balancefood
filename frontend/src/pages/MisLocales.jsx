import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/useAuth";

const VACIO = { name: "", address: "", campus: "", category: "", description: "" };
const PLATO_VACIO = { name: "", description: "", price: "", category: "" };

export default function MisLocales() {
  const { user } = useAuth();
  const userId = user.id;

  const [locales, setLocales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [version, setVersion] = useState(0);

  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [expandido, setExpandido] = useState(null);
  const [platos, setPlatos] = useState({});
  const [platoForm, setPlatoForm] = useState(PLATO_VACIO);
  const [editandoPlato, setEditandoPlato] = useState(null);

  useEffect(() => {
    let cancelado = false;

    api
      .get("/restaurants", { auth: false })
      .then((data) => {
        if (!cancelado) setLocales(data.filter((l) => l.user_id === userId));
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
  }, [version, userId]);

  function recargar() {
    setVersion((v) => v + 1);
  }

  function cambiar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!form.name.trim() || !form.address.trim() || !form.campus.trim()) {
      setError("Nombre, dirección y campus son obligatorios.");
      return;
    }

    setEnviando(true);
    try {
      if (editandoId) {
        await api.patch(`/restaurants/${editandoId}`, { restaurant: form });
        setMensaje("Local actualizado.");
      } else {
        await api.post("/restaurants", { restaurant: form });
        setMensaje("Local creado.");
      }
      setForm(VACIO);
      setEditandoId(null);
      recargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function editar(local) {
    setEditandoId(local.id);
    setForm({
      name: local.name || "",
      address: local.address || "",
      campus: local.campus || "",
      category: local.category || "",
      description: local.description || "",
    });
    window.scrollTo(0, 0);
  }

  async function eliminar(local) {
    if (!window.confirm(`¿Eliminar "${local.name}" y toda su carta?`)) return;

    setError(null);
    try {
      await api.delete(`/restaurants/${local.id}`);
      setMensaje("Local eliminado.");
      recargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function cargarPlatos(localId) {
    const data = await api.get(`/restaurants/${localId}/menu_items`, { auth: false });
    setPlatos((prev) => ({ ...prev, [localId]: data }));
  }

  async function verPlatos(local) {
    if (expandido === local.id) {
      setExpandido(null);
      return;
    }

    setExpandido(local.id);
    setPlatoForm(PLATO_VACIO);
    setEditandoPlato(null);

    try {
      await cargarPlatos(local.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function guardarPlato(e, localId) {
    e.preventDefault();
    setError(null);

    const precio = Number(platoForm.price);

    if (!platoForm.name.trim()) {
      setError("El plato necesita un nombre.");
      return;
    }

    if (!Number.isInteger(precio) || precio <= 0) {
      setError("El precio debe ser un número entero mayor que cero.");
      return;
    }

    try {
      const cuerpo = { menu_item: { ...platoForm, price: precio } };

      if (editandoPlato) {
        await api.patch(`/menu_items/${editandoPlato}`, cuerpo);
        setMensaje("Plato actualizado.");
      } else {
        await api.post(`/restaurants/${localId}/menu_items`, cuerpo);
        setMensaje("Plato agregado.");
      }

      setPlatoForm(PLATO_VACIO);
      setEditandoPlato(null);
      await cargarPlatos(localId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function eliminarPlato(plato, localId) {
    if (!window.confirm(`¿Eliminar "${plato.name}"?`)) return;

    try {
      await api.delete(`/menu_items/${plato.id}`);
      setMensaje("Plato eliminado.");
      await cargarPlatos(localId);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1>Mis locales</h1>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="exito">{mensaje}</p>}

      <div className="tarjeta">
        <h2>{editandoId ? "Editar local" : "Nuevo local"}</h2>

        <form onSubmit={guardar}>
          <label>
            <span>Nombre</span>
            <input value={form.name} onChange={(e) => cambiar("name", e.target.value)} />
          </label>

          <label>
            <span>Dirección</span>
            <input value={form.address} onChange={(e) => cambiar("address", e.target.value)} />
          </label>

          <label>
            <span>Campus</span>
            <input
              value={form.campus}
              onChange={(e) => cambiar("campus", e.target.value)}
              placeholder="Campus Macul"
            />
          </label>

          <label>
            <span>Categoría</span>
            <input
              value={form.category}
              onChange={(e) => cambiar("category", e.target.value)}
              placeholder="Casino, cafetería, food truck…"
            />
          </label>

          <label>
            <span>Descripción</span>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => cambiar("description", e.target.value)}
            />
          </label>

          <div className="acciones">
            <button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : editandoId ? "Guardar cambios" : "Crear local"}
            </button>

            {editandoId && (
              <button
                type="button"
                className="secundario"
                onClick={() => { setEditandoId(null); setForm(VACIO); }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {cargando && <p className="cargando">Cargando…</p>}

      {!cargando && locales.length === 0 && (
        <p className="vacio">Todavía no has registrado ningún local.</p>
      )}

      {locales.map((local) => (
        <div className="tarjeta" key={local.id}>
          <h3>{local.name}</h3>
          <p className="suave">{local.category} · {local.campus} · {local.address}</p>

          <div className="acciones">
            <button className="secundario" onClick={() => editar(local)}>Editar</button>
            <button className="secundario" onClick={() => verPlatos(local)}>
              {expandido === local.id ? "Ocultar carta" : "Gestionar carta"}
            </button>
            <button className="peligro" onClick={() => eliminar(local)}>Eliminar</button>
          </div>

          {expandido === local.id && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--borde)" }}>
              <h3>Carta</h3>

              {(platos[local.id] || []).map((plato) => (
                <div
                  key={plato.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--borde)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{plato.name}</strong>
                    <span className="suave"> · ${plato.price}</span>
                  </div>
                  <button
                    className="secundario"
                    onClick={() => {
                      setEditandoPlato(plato.id);
                      setPlatoForm({
                        name: plato.name || "",
                        description: plato.description || "",
                        price: String(plato.price),
                        category: plato.category || "",
                      });
                    }}
                  >
                    Editar
                  </button>
                  <button className="peligro" onClick={() => eliminarPlato(plato, local.id)}>
                    Eliminar
                  </button>
                </div>
              ))}

              {(platos[local.id] || []).length === 0 && (
                <p className="suave">Sin platos publicados.</p>
              )}

              <form onSubmit={(e) => guardarPlato(e, local.id)} style={{ marginTop: 16 }}>
                <label>
                  <span>{editandoPlato ? "Editar plato" : "Nuevo plato"}</span>
                  <input
                    value={platoForm.name}
                    onChange={(e) => setPlatoForm({ ...platoForm, name: e.target.value })}
                    placeholder="Nombre"
                  />
                </label>

                <label>
                  <span>Precio</span>
                  <input
                    type="number"
                    min="1"
                    value={platoForm.price}
                    onChange={(e) => setPlatoForm({ ...platoForm, price: e.target.value })}
                    placeholder="3500"
                  />
                </label>

                <label>
                  <span>Categoría</span>
                  <input
                    value={platoForm.category}
                    onChange={(e) => setPlatoForm({ ...platoForm, category: e.target.value })}
                    placeholder="Almuerzo, snack…"
                  />
                </label>

                <div className="acciones">
                  <button type="submit">
                    {editandoPlato ? "Guardar plato" : "Agregar plato"}
                  </button>
                  {editandoPlato && (
                    <button
                      type="button"
                      className="secundario"
                      onClick={() => { setEditandoPlato(null); setPlatoForm(PLATO_VACIO); }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
