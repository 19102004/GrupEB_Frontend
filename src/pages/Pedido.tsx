import { useState } from "react";
import FormularioPedido from "../components/FormularioPedido";
import CrearPedido from "../components/CrearPedido";
import Modal from "../components/Modal";
import Dashboard from "../layouts/Sidebar";

interface Producto {
  nombre: string;
  cantidades: [number, number, number];
  precios: [number, number, number];
  calibre: string;
  tintas: number;
  caras: number;
}

interface Pedido {
  id: number;
  numeroPedido: string;
  fecha: string;
  cliente: string;
  empresa: string;
  telefono: string;
  correo: string;
  productos: Producto[];
  total: number;
  observaciones: string;
  disenoAprobado: boolean;
  anticipoAprobado: boolean;
}

export default function Pedidos() {
  const [busqueda, setBusqueda] = useState("");
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState<number | null>(null);
  
  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: 1,
      numeroPedido: "PED-2025-001",
      fecha: "2025-01-20",
      cliente: "María González García",
      empresa: "Distribuidora González",
      telefono: "33-1234-5678",
      correo: "maria.gonzalez@empresa.com",
      productos: [
        {
          nombre: "Bolsa plana 30x40 baja densidad",
          cantidades: [2000, 0, 0],
          precios: [1.4, 0, 0],
          calibre: "200",
          tintas: 2,
          caras: 1
        },
        {
          nombre: "Bolsa troquelada 40x50 alta densidad",
          cantidades: [500, 0, 0],
          precios: [2.0, 0, 0],
          calibre: "250",
          tintas: 3,
          caras: 2
        }
      ],
      total: 3800,
      observaciones: "Entrega urgente",
      disenoAprobado: true,
      anticipoAprobado: false
    },
    {
      id: 2,
      numeroPedido: "PED-2025-002",
      fecha: "2025-01-21",
      cliente: "Carlos Hernández López",
      empresa: "Comercial Hernández",
      telefono: "33-8765-4321",
      correo: "carlos.hdez@comercial.mx",
      productos: [
        {
          nombre: "Bolsa celofán 30x40 BOPP",
          cantidades: [5000, 0, 0],
          precios: [1.6, 0, 0],
          calibre: "175",
          tintas: 1,
          caras: 1
        }
      ],
      total: 8000,
      observaciones: "Cliente preferente",
      disenoAprobado: true,
      anticipoAprobado: true
    },
    {
      id: 3,
      numeroPedido: "PED-2025-003",
      fecha: "2025-01-22",
      cliente: "Ana Patricia Ruiz",
      empresa: "Tienda La Esperanza",
      telefono: "33-5555-6666",
      correo: "ana.ruiz@tienda.com",
      productos: [
        {
          nombre: "Bolsa asa flexible 40x50 alta densidad",
          cantidades: [1500, 0, 0],
          precios: [2.5, 0, 0],
          calibre: "225",
          tintas: 4,
          caras: 2
        }
      ],
      total: 3750,
      observaciones: "",
      disenoAprobado: false,
      anticipoAprobado: false
    }
  ]);

  const normalizarTexto = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,\-]/g, "")
      .trim();
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (!busqueda) return true;

    const terminoBusqueda = normalizarTexto(busqueda);

    return (
      normalizarTexto(pedido.cliente).includes(terminoBusqueda) ||
      normalizarTexto(pedido.empresa).includes(terminoBusqueda) ||
      normalizarTexto(pedido.correo).includes(terminoBusqueda) ||
      normalizarTexto(pedido.telefono).includes(terminoBusqueda) ||
      pedido.numeroPedido.toLowerCase().includes(terminoBusqueda) ||
      pedido.id.toString().includes(terminoBusqueda)
    );
  });

  const handleEditar = (pedido: Pedido) => {
    setPedidoEditando(pedido);
    setModalEditarOpen(true);
  };

  const handleEliminar = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este pedido?")) {
      setPedidos(pedidos.filter(pedido => pedido.id !== id));
    }
  };

  const toggleDetalles = (id: number) => {
    setMostrarDetalles(mostrarDetalles === id ? null : id);
  };

  const getEstadoBadge = (pedido: Pedido) => {
    const { disenoAprobado, anticipoAprobado } = pedido;
    
    if (!anticipoAprobado && !disenoAprobado) {
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ⚠️ Pendiente anticipo
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            🎨 Pendiente diseño
          </span>
        </div>
      );
    } else if (!anticipoAprobado) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ⚠️ Pendiente anticipo
        </span>
      );
    } else if (!disenoAprobado) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          🎨 Pendiente diseño
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Completo
        </span>
      );
    }
  };

  const handleGuardarEdicion = (pedidoActualizado: Pedido) => {
    setPedidos(pedidos.map(p => p.id === pedidoActualizado.id ? pedidoActualizado : p));
    setModalEditarOpen(false);
    setPedidoEditando(null);
  };

  const handleCrearPedido = (datosPedido: any) => {
    const nuevoId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1;
    const numeroPedido = `PED-2025-${String(nuevoId).padStart(3, '0')}`;
    const fecha = new Date().toISOString().split('T')[0];

    // Calcular el total
    const total = datosPedido.productos.reduce((sum: number, prod: Producto) => {
      const subtotal = prod.cantidades.reduce(
        (s: number, cant: number, i: number) => s + cant * prod.precios[i],
        0
      );
      return sum + subtotal;
    }, 0);

    const pedidoCompleto: Pedido = {
      id: nuevoId,
      numeroPedido,
      fecha,
      cliente: datosPedido.cliente,
      empresa: datosPedido.empresa,
      telefono: datosPedido.telefono,
      correo: datosPedido.correo,
      productos: datosPedido.productos,
      total: total,
      observaciones: datosPedido.observaciones,
      disenoAprobado: datosPedido.disenoAprobado,
      anticipoAprobado: datosPedido.anticipoAprobado
    };

    setPedidos([...pedidos, pedidoCompleto]);
    setModalCrearOpen(false);
  };

  return (
    <Dashboard userName="Administrador">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedidos</h1>
        <p className="text-gray-600 mb-6">
          Gestión y seguimiento de pedidos activos
        </p>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, empresa, correo, teléfono o número de pedido..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {busqueda && (
            <p className="mt-2 text-sm text-gray-600">
              Se encontraron {pedidosFiltrados.length} resultado(s)
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((pedido) => (
                    <>
                      <tr key={pedido.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pedido.fecha}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {pedido.numeroPedido}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pedido.cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pedido.empresa || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${pedido.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getEstadoBadge(pedido)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleDetalles(pedido.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            {mostrarDetalles === pedido.id ? "Ocultar" : "Ver"}
                          </button>
                          <button
                            onClick={() => handleEditar(pedido)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(pedido.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>

                      {mostrarDetalles === pedido.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Detalles del Pedido</h4>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <p className="text-sm font-medium text-gray-700">Teléfono:</p>
                                  <p className="text-sm text-gray-900">{pedido.telefono}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <p className="text-sm font-medium text-gray-700">Correo:</p>
                                  <p className="text-sm text-gray-900">{pedido.correo}</p>
                                </div>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Producto</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Calibre</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Tintas</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Caras</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Cantidades</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Precios Unit.</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {pedido.productos.map((producto, idx) => {
                                      const subtotal = producto.cantidades.reduce(
                                        (sum, cant, i) => sum + cant * producto.precios[i],
                                        0
                                      );
                                      return (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 text-sm text-gray-900">{producto.nombre}</td>
                                          <td className="px-4 py-3 text-sm text-gray-900">{producto.calibre}</td>
                                          <td className="px-4 py-3 text-sm text-gray-900">{producto.tintas}</td>
                                          <td className="px-4 py-3 text-sm text-gray-900">{producto.caras}</td>
                                          <td className="px-4 py-3 text-sm text-gray-900">
                                            {producto.cantidades.map((cant, i) => 
                                              cant > 0 ? <div key={i}>Cant. {i+1}: {cant.toLocaleString()}</div> : null
                                            )}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900">
                                            {producto.precios.map((precio, i) => 
                                              producto.cantidades[i] > 0 ? <div key={i}>${precio.toFixed(4)}</div> : null
                                            )}
                                          </td>
                                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">${subtotal.toFixed(2)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {pedido.observaciones && (
                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <p className="text-sm font-medium text-gray-700">Observaciones:</p>
                                  <p className="text-sm text-gray-600 mt-1">{pedido.observaciones}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron pedidos que coincidan con "{busqueda}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setModalCrearOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
          >
            + Nuevo Pedido
          </button>
        </div>

        {/* Modal Editar */}
        <Modal isOpen={modalEditarOpen} onClose={() => setModalEditarOpen(false)} title="Editar Pedido">
          {pedidoEditando && (
            <FormularioPedido 
              pedido={pedidoEditando} 
              onSave={handleGuardarEdicion} 
              onCancel={() => setModalEditarOpen(false)} 
            />
          )}
        </Modal>

        {/* Modal Crear */}
        <Modal isOpen={modalCrearOpen} onClose={() => setModalCrearOpen(false)} title="Nuevo Pedido">
          <CrearPedido 
            onSubmit={handleCrearPedido} 
            onCancel={() => setModalCrearOpen(false)} 
          />
        </Modal>
      </div>
    </Dashboard>
  );
}