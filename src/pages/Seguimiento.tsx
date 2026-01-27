import { useState } from "react";
import Dashboard from "../layouts/Sidebar";

interface Pedido {
  id: string;
  fecha: string;
  numeroPedido: string;
  cliente: string;
  tipoProducto: "plastico" | "papel" | "carton";
  anticipo: "pendiente" | "pagado";
  diseño: "pendiente" | "aprobado" | "revision";
  ordenProduccion: string;
  procesos: {
    extrusion?: "pendiente" | "proceso" | "finalizado" | "detenido" | "resagado" | "no-aplica";
    impresion?: "pendiente" | "proceso" | "finalizado" | "detenido" | "resagado" | "no-aplica";
    bolseo?: "pendiente" | "proceso" | "finalizado" | "detenido" | "resagado" | "no-aplica";
    troquelado?: "pendiente" | "proceso" | "finalizado" | "detenido" | "resagado" | "no-aplica";
    asaFlexible?: "pendiente" | "proceso" | "finalizado" | "detenido" | "resagado" | "no-aplica";
  };
  estadoCuenta: "pendiente" | "parcial" | "pagado";
  envio: "pendiente" | "proceso" | "enviado";
}

// Datos de ejemplo
const PEDIDOS_EJEMPLO: Pedido[] = [
  {
    id: "1",
    fecha: "2026-01-15",
    numeroPedido: "PED-2026-001",
    cliente: "Distribuidora González",
    tipoProducto: "plastico",
    anticipo: "pagado",
    diseño: "aprobado",
    ordenProduccion: "OP-001",
    procesos: {
      extrusion: "finalizado",
      impresion: "proceso",
      bolseo: "pendiente",
      troquelado: "no-aplica",
      asaFlexible: "no-aplica"
    },
    estadoCuenta: "parcial",
    envio: "pendiente"
  },
  {
    id: "2",
    fecha: "2026-01-18",
    numeroPedido: "PED-2026-002",
    cliente: "Comercial Hernández",
    tipoProducto: "papel",
    anticipo: "pagado",
    diseño: "aprobado",
    ordenProduccion: "OP-002",
    procesos: {
      extrusion: "no-aplica",
      impresion: "finalizado",
      bolseo: "no-aplica",
      troquelado: "finalizado",
      asaFlexible: "no-aplica"
    },
    estadoCuenta: "pagado",
    envio: "enviado"
  },
  {
    id: "3",
    fecha: "2026-01-20",
    numeroPedido: "PED-2026-003",
    cliente: "Supermercado El Ahorro",
    tipoProducto: "plastico",
    anticipo: "pendiente",
    diseño: "revision",
    ordenProduccion: "OP-003",
    procesos: {
      extrusion: "resagado",
      impresion: "pendiente",
      bolseo: "pendiente",
      troquelado: "pendiente",
      asaFlexible: "pendiente"
    },
    estadoCuenta: "pendiente",
    envio: "pendiente"
  },
  {
    id: "4",
    fecha: "2026-01-21",
    numeroPedido: "PED-2026-004",
    cliente: "Boutique Elegancia",
    tipoProducto: "carton",
    anticipo: "pagado",
    diseño: "aprobado",
    ordenProduccion: "OP-004",
    procesos: {
      extrusion: "no-aplica",
      impresion: "proceso",
      bolseo: "no-aplica",
      troquelado: "resagado",
      asaFlexible: "no-aplica"
    },
    estadoCuenta: "parcial",
    envio: "pendiente"
  }
];

export default function Seguimiento() {
  const [pedidos] = useState<Pedido[]>(PEDIDOS_EJEMPLO);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "plastico" | "papel" | "carton">("todos");
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "finalizado":
      case "aprobado":
      case "pagado":
      case "enviado":
        return "bg-green-100 text-green-800 border-green-300";
      case "proceso":
      case "revision":
      case "parcial":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "detenido":
        return "bg-red-100 text-red-800 border-red-300";
      case "pendiente":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "resagado":
        return "bg-black text-white border-black";
      case "no-aplica":
        return "bg-gray-100 text-gray-500 border-gray-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case "finalizado": return "Finalizado";
      case "proceso": return "En Proceso";
      case "pendiente": return "Pendiente";
      case "detenido": return "Detenido";
      case "resagado": return "Resagado";
      case "no-aplica": return "N/A";
      case "aprobado": return "Aprobado";
      case "revision": return "En Revisión";
      case "pagado": return "Pagado";
      case "parcial": return "Pago Parcial";
      case "enviado": return "Enviado";
      default: return estado;
    }
  };

  const pedidosFiltrados = filtroTipo === "todos" 
    ? pedidos 
    : pedidos.filter(p => p.tipoProducto === filtroTipo);

  // Vista de pantalla completa
  if (pantallaCompleta) {
    return (
      
        <div className="p-6">
          {/* Header con botón de salir */}
          <button
              onClick={() => setPantallaCompleta(false)}
              className="ml-auto mb-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5 left-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
            
         

          {/* Tabla en pantalla completa */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase tracking-wider">N° Pedido</th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">Anticipo</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">Diseño</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">OP</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">Extrusión</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">Impresión</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">Bolseo</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">Troquelado</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">Asa Flex</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">Pago</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">Envío</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-base text-gray-900 ">{pedido.fecha}</td>
                      <td className="px-4 py-4 text-base  text-blue-600">{pedido.numeroPedido}</td>
                      <td className="px-4 py-4 text-base text-gray-900">{pedido.cliente}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 capitalize">
                          {pedido.tipoProducto}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${obtenerColorEstado(pedido.anticipo)}`}>
                          {obtenerTextoEstado(pedido.anticipo)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${obtenerColorEstado(pedido.diseño)}`}>
                          {obtenerTextoEstado(pedido.diseño)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-base text-center text-gray-900">{pedido.ordenProduccion}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${obtenerColorEstado(pedido.procesos.extrusion || "")}`}>
                          {obtenerTextoEstado(pedido.procesos.extrusion || "")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${obtenerColorEstado(pedido.procesos.impresion || "")}`}>
                          {obtenerTextoEstado(pedido.procesos.impresion || "")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${obtenerColorEstado(pedido.procesos.bolseo || "")}`}>
                          {obtenerTextoEstado(pedido.procesos.bolseo || "")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${obtenerColorEstado(pedido.procesos.troquelado || "")}`}>
                          {obtenerTextoEstado(pedido.procesos.troquelado || "")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${obtenerColorEstado(pedido.procesos.asaFlexible || "")}`}>
                          {obtenerTextoEstado(pedido.procesos.asaFlexible || "")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${obtenerColorEstado(pedido.estadoCuenta)}`}>
                          {obtenerTextoEstado(pedido.estadoCuenta)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${obtenerColorEstado(pedido.envio)}`}>
                          {obtenerTextoEstado(pedido.envio)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista normal con Dashboard
  return (
    <Dashboard userName="Administrador">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguimiento de Pedidos</h1>
        <p className="text-gray-600">Monitorea el estado de todos los pedidos en tiempo real</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroTipo("todos")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === "todos"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo("plastico")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === "plastico"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Plástico
            </button>
            <button
              onClick={() => setFiltroTipo("papel")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === "papel"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Papel
            </button>
            <button
              onClick={() => setFiltroTipo("carton")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === "carton"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cartón
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Leyenda de Estados:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-700">Finalizado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm text-gray-700">En Proceso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm text-gray-700">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-700">Detenido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-black"></div>
            <span className="text-sm text-gray-700">Resagado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400"></div>
            <span className="text-sm text-gray-700">No Aplica</span>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Pedidos</h2>
          <button
            onClick={() => setPantallaCompleta(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">N° Pedido</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Anticipo</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Diseño</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Orden Produccion</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Extrusión</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Impresión</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Bolseo</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Troquelado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Asa Flex</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Pago</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Envío</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{pedido.fecha}</td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{pedido.numeroPedido}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{pedido.cliente}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                      {pedido.tipoProducto}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${obtenerColorEstado(pedido.anticipo)}`}>
                      {obtenerTextoEstado(pedido.anticipo)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${obtenerColorEstado(pedido.diseño)}`}>
                      {obtenerTextoEstado(pedido.diseño)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">{pedido.ordenProduccion}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${obtenerColorEstado(pedido.procesos.extrusion || "")}`}>
                      {obtenerTextoEstado(pedido.procesos.extrusion || "")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${obtenerColorEstado(pedido.procesos.impresion || "")}`}>
                      {obtenerTextoEstado(pedido.procesos.impresion || "")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${obtenerColorEstado(pedido.procesos.bolseo || "")}`}>
                      {obtenerTextoEstado(pedido.procesos.bolseo || "")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${obtenerColorEstado(pedido.procesos.troquelado || "")}`}>
                      {obtenerTextoEstado(pedido.procesos.troquelado || "")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${obtenerColorEstado(pedido.procesos.asaFlexible || "")}`}>
                      {obtenerTextoEstado(pedido.procesos.asaFlexible || "")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${obtenerColorEstado(pedido.estadoCuenta)}`}>
                      {obtenerTextoEstado(pedido.estadoCuenta)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${obtenerColorEstado(pedido.envio)}`}>
                      {obtenerTextoEstado(pedido.envio)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pedidosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-900">No hay pedidos</p>
          <p className="text-sm text-gray-500 mt-1">No se encontraron pedidos con los filtros seleccionados</p>
        </div>
      )}
    </Dashboard>
  );
}