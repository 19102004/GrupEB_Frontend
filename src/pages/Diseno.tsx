import Dashboard from "../layouts/Sidebar";
import Modal from "../components/Modal";
import { useState, useEffect } from "react";
import { getDisenoByPedido, actualizarEstadoProductoDiseno } from "../services/disenoservice";
import { getPedidos } from "../services/pedidosService";
import type { Diseno, DisenoProducto } from "../types/ventas.types";
import type { Pedido } from "../types/cotizaciones.types";

const ESTADO = { PENDIENTE: 1, EN_PROCESO: 2, APROBADO: 3, RECHAZADO: 4 };

const fmtFecha = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
};

// ── Modal de gestión (reemplaza EditarDiseno hardcodeado) ─────
function EditarDisenoReal({
  pedido,
  onClose,
}: {
  pedido:  Pedido;
  onClose: () => void;
}) {
  const [diseno,    setDiseno]    = useState<Diseno | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState<number | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [obsMap,    setObsMap]    = useState<Record<number, string>>({});

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDisenoByPedido(pedido.no_pedido);
      setDiseno(data);
      const map: Record<number, string> = {};
      data.productos.forEach((p: DisenoProducto) => {
        map[p.iddiseno_producto] = p.observaciones ?? "";
      });
      setObsMap(map);
    } catch (e: any) {
      setError(e.response?.data?.error || "Error al cargar diseño");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id: number, estadoId: number) => {
    setGuardando(id);
    try {
      await actualizarEstadoProductoDiseno(id, {
        estadoId,
        observaciones: obsMap[id] || undefined,
      });
      const actualizado = await getDisenoByPedido(pedido.no_pedido);
      setDiseno(actualizado);
    } catch (e: any) {
      alert(e.response?.data?.error || "Error al actualizar estado");
    } finally {
      setGuardando(null);
    }
  };

  const handleAprobarTodos = async () => {
    if (!diseno || !confirm("¿Aprobar TODOS los productos pendientes?")) return;
    for (const p of diseno.productos) {
      if (p.estado_id !== ESTADO.APROBADO) {
        await handleCambiarEstado(p.iddiseno_producto, ESTADO.APROBADO);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={cargar} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Reintentar</button>
    </div>
  );

  if (!diseno) return null;

  return (
    <div className="space-y-5">

      {/* Info cliente */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-semibold text-gray-900">{pedido.cliente || "—"}</p>
        <p className="text-sm text-gray-500">{pedido.empresa || "—"}</p>
        <p className="text-xs text-gray-400 mt-1">
          Pedido #{pedido.no_pedido}
          {pedido.no_cotizacion ? ` · Cot. #${pedido.no_cotizacion}` : ""}
        </p>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",      value: diseno.total_productos, color: "text-gray-700"   },
          { label: "Aprobados",  value: diseno.aprobados,       color: "text-green-700"  },
          { label: "Rechazados", value: diseno.rechazados,      color: "text-red-700"    },
          { label: "Pendientes", value: diseno.pendientes,      color: "text-orange-600" },
        ].map(item => (
          <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Banner estado general */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
        diseno.diseno_completado   ? "bg-green-50 border-green-200"   :
        diseno.tiene_rechazados    ? "bg-orange-50 border-orange-200" :
                                     "bg-yellow-50 border-yellow-200"
      }`}>
        <span className="text-lg">
          {diseno.diseno_completado ? "✓" : diseno.tiene_rechazados ? "⚠️" : "⏱️"}
        </span>
        <p className={`font-semibold text-sm ${
          diseno.diseno_completado ? "text-green-800"  :
          diseno.tiene_rechazados  ? "text-orange-800" : "text-yellow-800"
        }`}>
          {diseno.diseno_completado
            ? "Todos los diseños aprobados — listo para producción"
            : diseno.tiene_rechazados
              ? "Hay productos rechazados que requieren cambios"
              : "Diseños pendientes de revisión"}
        </p>
      </div>

      {/* Aprobar todos */}
      {!diseno.diseno_completado && (
        <button
          onClick={handleAprobarTodos}
          disabled={guardando !== null}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Aprobar todos
        </button>
      )}

      {/* Productos */}
      <div className="space-y-3">
        {diseno.productos.map(producto => {
          const isGuardando = guardando === producto.iddiseno_producto;
          const aprobado    = producto.estado_id === ESTADO.APROBADO;
          const rechazado   = producto.estado_id === ESTADO.RECHAZADO;

          return (
            <div key={producto.iddiseno_producto}
              className={`bg-white rounded-xl border-2 p-4 transition-all ${
                aprobado ? "border-green-200" : rechazado ? "border-red-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span>{aprobado ? "✓" : rechazado ? "✕" : "⏱️"}</span>
                  <p className="text-sm font-semibold text-gray-900 truncate">{producto.nombre}</p>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  aprobado  ? "bg-green-100 text-green-800"  :
                  rechazado ? "bg-red-100 text-red-800"      :
                  producto.estado_id === ESTADO.EN_PROCESO
                            ? "bg-blue-100 text-blue-800"    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {producto.estado}
                </span>
              </div>

              {/* Observaciones */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Observaciones / cambios solicitados
                </label>
                <textarea
                  value={obsMap[producto.iddiseno_producto] ?? ""}
                  onChange={e => setObsMap(prev => ({
                    ...prev, [producto.iddiseno_producto]: e.target.value
                  }))}
                  rows={2}
                  placeholder="Ej: Cliente solicitó cambiar el color azul por verde"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCambiarEstado(producto.iddiseno_producto, ESTADO.APROBADO)}
                  disabled={isGuardando || aprobado}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    aprobado
                      ? "bg-green-100 text-green-700 cursor-default"
                      : "bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  }`}
                >
                  {isGuardando
                    ? <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                  }
                  {aprobado ? "Aprobado" : "Aprobar"}
                </button>

                <button
                  onClick={() => handleCambiarEstado(producto.iddiseno_producto, ESTADO.RECHAZADO)}
                  disabled={isGuardando || rechazado}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    rechazado
                      ? "bg-red-100 text-red-700 cursor-default"
                      : "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                  }`}
                >
                  {isGuardando
                    ? <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  }
                  {rechazado ? "Rechazado" : "Rechazar"}
                </button>

                {(aprobado || rechazado) && (
                  <button
                    onClick={() => handleCambiarEstado(producto.iddiseno_producto, ESTADO.PENDIENTE)}
                    disabled={isGuardando}
                    className="py-2 px-3 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 border border-gray-200 transition-all disabled:opacity-50"
                    title="Restablecer a pendiente"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function Diseno() {
  const [pedidos,      setPedidos]      = useState<Pedido[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [busqueda,     setBusqueda]     = useState("");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [pedidoActivo, setPedidoActivo] = useState<Pedido | null>(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    try { setPedidos(await getPedidos()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEditar = (pedido: Pedido) => {
    setPedidoActivo(pedido);
    setModalOpen(true);
  };

  const handleCerrar = () => {
    setModalOpen(false);
    setPedidoActivo(null);
  };

  const normalizarTexto = (t: string) =>
    t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,\-]/g, "").trim();

  const filtrados = pedidos.filter(p => {
    if (!busqueda) return true;
    const t = normalizarTexto(busqueda);
    return (
      normalizarTexto(p.cliente ?? "").includes(t) ||
      normalizarTexto(p.empresa ?? "").includes(t) ||
      p.no_pedido.toString().includes(t)
    );
  });

  const getEstadoBadge = (ped: Pedido) => {
    const aprobados = ped.productos.filter((p: any) => p.disenoAprobado).length;
    const todos     = ped.productos.length;
    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          ped.es_directo ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
        }`}>
          {ped.es_directo ? "Directo" : `Cot. #${ped.no_cotizacion}`}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          aprobados === todos && todos > 0 ? "bg-blue-100 text-blue-800" : "bg-orange-50 text-orange-700"
        }`}>
          🎨 {todos} diseño(s)
        </span>
      </div>
    );
  };

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-4">Gestión de Diseños</h1>
      <p className="text-slate-400 mb-6">
        Administra y aprueba los diseños de productos de cada pedido.
      </p>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, empresa o N° pedido..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {busqueda && (
          <p className="mt-2 text-sm text-gray-600">{filtrados.length} resultado(s)</p>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["N° Pedido", "Fecha", "Cliente", "Empresa", "Productos", "Estado", "Acciones"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
                <p className="mt-3 text-gray-500">Cargando pedidos...</p>
              </td></tr>
            ) : filtrados.length > 0 ? filtrados.map(ped => (
              <tr key={ped.no_pedido} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{ped.no_pedido}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fmtFecha(ped.fecha)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {ped.cliente || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ped.empresa || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs">
                    {ped.productos.length} producto(s)
                    <div className="text-xs text-gray-400 mt-1">
                      {ped.productos.slice(0, 2).map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-orange-500">⏱️</span>
                          <span>{(p.nombre || "Producto").substring(0, 30)}...</span>
                        </div>
                      ))}
                      {ped.productos.length > 2 && (
                        <div>+ {ped.productos.length - 2} más</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getEstadoBadge(ped)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditar(ped)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Ver/Editar
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                {busqueda
                  ? `No se encontraron pedidos que coincidan con "${busqueda}"`
                  : "No hay pedidos registrados"}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCerrar} title="Gestionar Diseños">
        {pedidoActivo && (
          <EditarDisenoReal
            pedido={pedidoActivo}
            onClose={handleCerrar}
          />
        )}
      </Modal>
    </Dashboard>
  );
}