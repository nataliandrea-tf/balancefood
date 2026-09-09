import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const HOY = new Date().toISOString().slice(0, 10);
const VACIO = { amount: "", description: "", spent_on: HOY };

export default function Gastos() {
  const { actualizarSaldo } = useAuth();

  const [gastos, setGastos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await api.get("/expenses");
      setGastos(data.expenses);
      setResumen(data.summary);
      actualizarSaldo(data.summary.saldo_actual);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function cambiar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    const monto = Number(form.amount);

    if (!Number.isInteger(monto) || monto <= 0) {
      setError("El monto debe ser un número entero mayor que cero.");
      return;
    }

    if (!form.spent_on) {
      setError("Indica la fecha del gasto.");
      return;
    }

    setEnviando(true);
    try {
      const cuerpo = { expense: { ...form, amount: monto } };

      if (editandoId) {
        await api.patch(`/expenses/${editandoId}`, cuerpo);
        setMensaje("Gasto actualizado.");
      } else {
        await api.post("/expenses", cuerpo);
        setMensaje("Gasto registrado.");
      }

      setForm(VACIO);
      setEditandoId(null);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function editar(gasto) {
    setEditandoId(gasto.id);
    setForm({
      amount: String(gasto.amount),
      description: gasto.description || "",
      spent_on: gasto.spent_on,
    });
    window.scrollTo(0, 0);
  }

  async function eliminar(gasto) {
    if (!window.confirm(`¿Eliminar este gasto de $${gasto.amount}?`)) return;

    setError(null);
    try {
      await api.delete(`/expenses/${gasto.id}`);
      setMensaje("Gasto eliminado. El monto volvió a tu saldo.");
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1>Mis gastos</h1>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="exito">{mensaje}</p>}

      {resumen && (
        <div className="tarjeta">
          <h2>Resumen del mes</h2>
          <div className="grilla">
            <div>
              <p className="suave">Saldo actual</p>
              <p className="precio">${resumen.saldo_actual ?? 0}</p>
            </div>
            <div>
              <p className="suave">Total gastado</p>
              <p className="precio">${resumen.total_gastado}</p>
            </div>
            <div>
              <p className="suave">Días restantes</p>
              <p className="precio">{resumen.dias_restantes_mes}</p>
            </div>
            <div>
              <p className="suave">Puedes gastar por día</p>
              <p className="precio">${resumen.presupuesto_diario ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="tarjeta">
        <h2>{editandoId ? "Editar gasto" : "Registrar gasto"}</h2>

        <form onSubmit={guardar}>
          <label>
            <span>Monto</span>
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => cambiar("amount", e.target.value)}
              placeholder="3500"
            />
          </label>

          <label>
            <span>Descripción</span>
            <input
              value={form.description}
              onChange={(e) => cambiar("description", e.target.value)}
              placeholder="Almuerzo en el casino"
            />
          </label>

          <label>
            <span>Fecha</span>
            <input
              type="date"
              value={form.spent_on}
              onChange={(e) => cambiar("spent_on", e.target.value)}
            />
          </label>

          <div className="acciones">
            <button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : editandoId ? "Guardar cambios" : "Registrar"}
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

      <h2 style={{ marginTop: 28 }}>Historial</h2>

      {cargando && <p className="cargando">Cargando…</p>}

      {!cargando && gastos.length === 0 && (
        <p className="vacio">Todavía no has registrado gastos este mes.</p>
      )}

      {gastos.map((gasto) => (
        <div className="tarjeta" key={gasto.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p className="precio" style={{ margin: 0 }}>${gasto.amount}</p>
              <p className="suave" style={{ margin: 0 }}>
                {gasto.description || "Sin descripción"} · {gasto.spent_on}
              </p>
            </div>
            <button className="secundario" onClick={() => editar(gasto)}>Editar</button>
            <button className="peligro" onClick={() => eliminar(gasto)}>Eliminar</button>
          </div>
        </div>
      ))}
    </>
  );
}