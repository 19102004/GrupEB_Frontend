import Dashboard from "../layouts/Sidebar";
import Modal from "../components/Modal";
import FormularioCliente from "../components/FormularioCliente";
import EditarCliente from "../components/EditarCliente";
import { useState } from "react";

interface Cliente {
  id: number;
  numeroCliente: string;
  nombreEmpresa: string;
  atencionNombre: string;
  impresion: string;
  correo: string;
  telefono: string;
}

interface ClienteCompleto extends Cliente {
  razonSocial: string;
  calle: string;
  numero: string;
  colonia: string;
  codigoPostal: string;
  celular: string;
  poblacion: string;
  estado: string;
  rfc: string;
  cfdi: string;
  mailFacturacion: string;
  metodoPago: string;
  formaPago: string;
  regimenFiscal: string;
  moneda: string;
}

interface DatosCliente {
  correo: string;
  nombreEmpresa: string;
  razonSocial: string;
  atencionNombre: string;
  impresion: string;
  calle: string;
  numero: string;
  colonia: string;
  codigoPostal: string;
  telefono: string;
  celular: string;
  poblacion: string;
  estado: string;
  rfc: string;
  cfdi: string;
  mailFacturacion: string;
  metodoPago: string;
  formaPago: string;
  regimenFiscal: string;
  moneda: string;
}

export default function Clientes() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<ClienteCompleto | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState<ClienteCompleto[]>([
    { 
      id: 1, numeroCliente: "CLI001", nombreEmpresa: "Imprenta Digital SA", atencionNombre: "Roberto Sánchez", 
      impresion: "Offset", correo: "roberto@imprentadigital.com", telefono: "33-1111-2222",
      razonSocial: "Imprenta Digital SA de CV", calle: "Av. Principal", numero: "123", colonia: "Centro",
      codigoPostal: "44100", celular: "33-1111-2223", poblacion: "Guadalajara", estado: "Jalisco", 
      rfc: "IMP010101ABC", cfdi: "G03", mailFacturacion: "facturacion@imprentadigital.com", 
      metodoPago: "PUE", formaPago: "03", regimenFiscal: "601", moneda: "MXN"
    },
    { 
      id: 2, numeroCliente: "CLI002", nombreEmpresa: "Papelería El Éxito", atencionNombre: "María Fernández", 
      impresion: "Digital", correo: "maria@papeleriaexito.com", telefono: "33-2222-3333",
      razonSocial: "", calle: "", numero: "", colonia: "", codigoPostal: "", celular: "", 
      poblacion: "", estado: "", rfc: "", cfdi: "", mailFacturacion: "", metodoPago: "", 
      formaPago: "", regimenFiscal: "", moneda: ""
    },
    { 
      id: 3, numeroCliente: "CLI003", nombreEmpresa: "Corporativo Azteca", atencionNombre: "Jorge Ramírez", 
      impresion: "Serigrafía", correo: "jorge@corpazteca.com", telefono: "33-3333-4444",
      razonSocial: "", calle: "", numero: "", colonia: "", codigoPostal: "", celular: "", 
      poblacion: "", estado: "", rfc: "", cfdi: "", mailFacturacion: "", metodoPago: "", 
      formaPago: "", regimenFiscal: "", moneda: ""
    },
    { 
      id: 4, numeroCliente: "CLI004", nombreEmpresa: "Diseños Modernos", atencionNombre: "Laura Mendoza", 
      impresion: "Digital", correo: "laura@disenosmodernos.com", telefono: "33-4444-5555",
      razonSocial: "", calle: "", numero: "", colonia: "", codigoPostal: "", celular: "", 
      poblacion: "", estado: "", rfc: "", cfdi: "", mailFacturacion: "", metodoPago: "", 
      formaPago: "", regimenFiscal: "", moneda: ""
    },
    { 
      id: 5, numeroCliente: "CLI005", nombreEmpresa: "Publicidad Creativa", atencionNombre: "Carlos Ruiz", 
      impresion: "Offset", correo: "carlos@pubcreativa.com", telefono: "33-5555-6666",
      razonSocial: "", calle: "", numero: "", colonia: "", codigoPostal: "", celular: "", 
      poblacion: "", estado: "", rfc: "", cfdi: "", mailFacturacion: "", metodoPago: "", 
      formaPago: "", regimenFiscal: "", moneda: ""
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

  const clientesFiltrados = clientes.filter((cliente) => {
    if (!busqueda) return true;

    const terminoBusqueda = normalizarTexto(busqueda);

    return (
      normalizarTexto(cliente.numeroCliente).includes(terminoBusqueda) ||
      normalizarTexto(cliente.nombreEmpresa).includes(terminoBusqueda) ||
      normalizarTexto(cliente.atencionNombre).includes(terminoBusqueda) ||
      normalizarTexto(cliente.impresion).includes(terminoBusqueda) ||
      normalizarTexto(cliente.correo).includes(terminoBusqueda) ||
      normalizarTexto(cliente.telefono).includes(terminoBusqueda)
    );
  });

  const handleEditar = (id: number) => {
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
      setClienteEditando(cliente);
      setModalEditarOpen(true);
    }
  };

  const handleEliminar = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      setClientes(clientes.filter(cliente => cliente.id !== id));
    }
  };

  const handleAgregarCliente = () => {
    setModalOpen(true);
  };

  const generarNumeroCliente = () => {
    if (clientes.length === 0) return "CLI001";
    
    const ultimoNumero = Math.max(...clientes.map(c => {
      const num = parseInt(c.numeroCliente.replace("CLI", ""));
      return isNaN(num) ? 0 : num;
    }));
    
    return `CLI${String(ultimoNumero + 1).padStart(3, "0")}`;
  };

  const handleSubmit = (datos: DatosCliente) => {
    const nuevoCliente: ClienteCompleto = {
      id: clientes.length + 1,
      numeroCliente: generarNumeroCliente(),
      nombreEmpresa: datos.nombreEmpresa || "Sin especificar",
      atencionNombre: datos.atencionNombre || "Sin especificar",
      impresion: datos.impresion || "Sin especificar",
      correo: datos.correo || "Sin especificar",
      telefono: datos.telefono || "Sin especificar",
      razonSocial: datos.razonSocial || "",
      calle: datos.calle || "",
      numero: datos.numero || "",
      colonia: datos.colonia || "",
      codigoPostal: datos.codigoPostal || "",
      celular: datos.celular || "",
      poblacion: datos.poblacion || "",
      estado: datos.estado || "",
      rfc: datos.rfc || "",
      cfdi: datos.cfdi || "",
      mailFacturacion: datos.mailFacturacion || "",
      metodoPago: datos.metodoPago || "",
      formaPago: datos.formaPago || "",
      regimenFiscal: datos.regimenFiscal || "",
      moneda: datos.moneda || ""
    };

    setClientes([...clientes, nuevoCliente]);
    setModalOpen(false);
  };

  const handleEditarSubmit = (datos: ClienteCompleto) => {
    setClientes(clientes.map(cliente => 
      cliente.id === datos.id ? datos : cliente
    ));
    setModalEditarOpen(false);
    setClienteEditando(null);
  };

  const handleCancelar = () => {
    setModalOpen(false);
  };

  const handleCancelarEditar = () => {
    setModalEditarOpen(false);
    setClienteEditando(null);
  };

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <p className="text-slate-400 mb-6">
        Clientes registrados en el sistema GRUPEB.
      </p>

      {/* BUSCADOR */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por número, empresa, atención, impresión, correo o teléfono..."
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
            Se encontraron {clientesFiltrados.length} resultado(s)
          </p>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Atención Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impresión
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cliente.numeroCliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.nombreEmpresa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.atencionNombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.impresion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.correo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.telefono}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditar(cliente.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(cliente.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron clientes que coincidan con "{busqueda}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          onClick={handleAgregarCliente}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
        >
          + Agregar Nuevo Cliente
        </button>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCancelar} title="Nuevo Cliente">
        <FormularioCliente onSubmit={handleSubmit} onCancel={handleCancelar} />
      </Modal>

      <Modal isOpen={modalEditarOpen} onClose={handleCancelarEditar} title="Editar Cliente">
        {clienteEditando && (
          <EditarCliente 
            cliente={clienteEditando} 
            onSubmit={handleEditarSubmit} 
            onCancel={handleCancelarEditar} 
          />
        )}
      </Modal>
    </Dashboard>
  );
}