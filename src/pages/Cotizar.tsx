import Dashboard from "../layouts/Sidebar";
import { useState } from "react";

interface Cotizacion {
  id: number;
  folio: string;
  fecha: string;
  empresa: string;
  estado: "rechazada" | "autorizada" | "por_autorizar";
}

export default function Cotizar() {
  const [cotizaciones] = useState<Cotizacion[]>([
    {
      id: 1,
      folio: "COT-001",
      fecha: "2025-01-10",
      empresa: "Empresa Alpha",
      estado: "autorizada",
    },
    {
      id: 2,
      folio: "COT-002",
      fecha: "2025-01-12",
      empresa: "Servicios Beta",
      estado: "por_autorizar",
    },
    {
      id: 3,
      folio: "COT-003",
      fecha: "2025-01-13",
      empresa: "Industria Gamma",
      estado: "rechazada",
    },
    {
      id: 4,
      folio: "COT-004",
      fecha: "2025-01-14",
      empresa: "Comercial Delta",
      estado: "autorizada",
    },
  ]);

  const getEstadoBadge = (estado: Cotizacion["estado"]) => {
    switch (estado) {
      case "autorizada":
        return "bg-green-100 text-green-700";
      case "rechazada":
        return "bg-red-100 text-red-700";
      case "por_autorizar":
        return "bg-gray-200 text-gray-700";
      default:
        return "";
    }
  };

  const getEstadoTexto = (estado: Cotizacion["estado"]) => {
    switch (estado) {
      case "autorizada":
        return "Autorizada";
      case "rechazada":
        return "Rechazada";
      case "por_autorizar":
        return "Por autorizar";
    }
  };

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-4">Cotizaciones</h1>

      <p className="text-slate-400 mb-6">
        Listado de cotizaciones registradas en el sistema.
      </p>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Folio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {cotizaciones.map((cotizacion) => (
              <tr key={cotizacion.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cotizacion.folio}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cotizacion.fecha}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cotizacion.empresa}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(
                      cotizacion.estado
                    )}`}
                  >
                    {getEstadoTexto(cotizacion.estado)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
        >
          + Hacer cotización
        </button>
      </div>
    </Dashboard>
  );
}
