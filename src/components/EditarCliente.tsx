import { useState } from "react";

interface EditarClienteProps {
  cliente: ClienteCompleto;
  onSubmit: (datos: ClienteCompleto) => void;
  onCancel: () => void;
}

interface ClienteCompleto {
  id: number;
  numeroCliente: string;
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

const REGIMENES_FISCALES = [
  "(622) Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
  "(606) Arrendamiento",
  "(624) Coordinados",
  "(608) Demás ingresos",
  "(601) General de Ley Personas Morales",
  "(621) Incorporación Fiscal",
  "(611) Ingresos por Dividendos (socios y accionistas)",
  "(614) Ingresos por intereses",
  "(623) Opcional para Grupos de Sociedades",
  "(612) Personas Físicas con Actividades Empresariales y Profesionales",
  "(603) Personas Morales con Fines no Lucrativos",
  "(610) Residentes en el Extranjero sin Establecimiento Permanente en México",
  "(626) Régimen Simplificado de Confianza",
  "(607) Régimen de Enajenación o Adquisición de Bienes",
  "(625) Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
  "(615) Régimen de los ingresos por obtención de premios",
  "(616) Sin obligaciones fiscales",
  "(620) Sociedades Cooperativas de Producción que optan por diferir sus ingresos",
  "(605) Sueldos y Salarios e Ingresos Asimilados a Salarios"
];

const METODOS_PAGO = [
  "(01) Efectivo",
  "(02) Cheque nominativo",
  "(03) Transferencia electrónica de fondos",
  "(04) Tarjeta de crédito",
  "(05) Monedero electrónico",
  "(06) Dinero electrónico",
  "(08) Vales de despensa",
  "(12) Dación en pago",
  "(13) Pago por subrogación",
  "(14) Pago por consignación",
  "(15) Condonación",
  "(17) Compensación",
  "(23) Novación",
  "(24) Confusión",
  "(25) Remisión de deuda",
  "(26) Prescripción o caducidad",
  "(27) A satisfacción del acreedor",
  "(28) Tarjeta de débito",
  "(29) Tarjeta de servicios"
];

const FORMAS_PAGO = [
  "(PUE) Pago en una sola exhibición",
  "(PPD) Pago en parcialidades o diferido",
  "(30) Aplicación de anticipos",
  "(31) Intermediario pagos",
  "(99) Por definir"
];

export default function EditarCliente({
  cliente,
  onSubmit,
  onCancel,
}: EditarClienteProps) {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState<ClienteCompleto>(cliente);

  const [dropdownRegimenAbierto, setDropdownRegimenAbierto] = useState(false);
  const [dropdownMetodoAbierto, setDropdownMetodoAbierto] = useState(false);
  const [dropdownFormaAbierto, setDropdownFormaAbierto] = useState(false);

  const [regimenesFiltrados, setRegimenesFiltrados] = useState(REGIMENES_FISCALES);
  const [metodosFiltrados, setMetodosFiltrados] = useState(METODOS_PAGO);
  const [formasFiltradas, setFormasFiltradas] = useState(FORMAS_PAGO);

  const normalizarTexto = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });

    // Filtrar opciones según el campo
    if (name === "regimenFiscal") {
      const filtrados = REGIMENES_FISCALES.filter(r =>
        normalizarTexto(r).includes(normalizarTexto(value))
      );
      setRegimenesFiltrados(filtrados);
      if (value) setDropdownRegimenAbierto(true);
    } else if (name === "metodoPago") {
      const filtrados = METODOS_PAGO.filter(m =>
        normalizarTexto(m).includes(normalizarTexto(value))
      );
      setMetodosFiltrados(filtrados);
      if (value) setDropdownMetodoAbierto(true);
    } else if (name === "formaPago") {
      const filtrados = FORMAS_PAGO.filter(f =>
        normalizarTexto(f).includes(normalizarTexto(value))
      );
      setFormasFiltradas(filtrados);
      if (value) setDropdownFormaAbierto(true);
    }
  };

  const handleSiguiente = () => {
    setPaso(2);
  };

  const handleAtras = () => setPaso(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(datos);
  };

  return (
    <div onSubmit={handleSubmit}>
      {/* Indicador de pasos */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              paso === 1 ? "bg-blue-600 text-white" : "bg-green-600 text-white"
            }`}
          >
            {paso === 1 ? "1" : "✓"}
          </div>
          <div
            className={`w-24 h-1 ${
              paso === 2 ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              paso === 2
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {/* PASO 1 - DATOS GENERALES */}
      <div className={paso === 1 ? "block" : "hidden"}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Datos Generales
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Empresa
              </label>
              <input
                type="text"
                name="nombreEmpresa"
                value={datos.nombreEmpresa}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Imprenta Digital SA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón Social
              </label>
              <input
                type="text"
                name="razonSocial"
                value={datos.razonSocial}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Imprenta Digital SA de CV"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Atención (Nombre)
              </label>
              <input
                type="text"
                name="atencionNombre"
                value={datos.atencionNombre}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Roberto Sánchez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impresión
              </label>
              <input
                type="text"
                name="impresion"
                value={datos.impresion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Offset, Digital, Serigrafía..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={datos.correo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 bg-white placeholder-gray-400"
              placeholder="contacto@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domicilio
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  name="calle"
                  value={datos.calle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Calle"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="numero"
                  value={datos.numero}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-gray-900 bg-white placeholder-gray-400"
                  placeholder="# Número"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="colonia"
                  value={datos.colonia}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Colonia"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                name="codigoPostal"
                value={datos.codigoPostal}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="44100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Población
              </label>
              <input
                type="text"
                name="poblacion"
                value={datos.poblacion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Guadalajara"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <input
                type="text"
                name="estado"
                value={datos.estado}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Jalisco"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={datos.telefono}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="33-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Celular
              </label>
              <input
                type="tel"
                name="celular"
                value={datos.celular}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="33-9876-5432"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSiguiente}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* PASO 2 - DATOS DE FACTURACIÓN */}
      <div className={paso === 2 ? "block" : "hidden"}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Datos de Facturación (SAT)
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFC
              </label>
              <input
                type="text"
                name="rfc"
                value={datos.rfc}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="XAXX010101000"
              />
            </div>

            {/* Régimen Fiscal - Desplegable con búsqueda */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Régimen Fiscal
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="regimenFiscal"
                  value={datos.regimenFiscal}
                  onChange={handleInputChange}
                  placeholder="Escribe para buscar..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  autoComplete="off"
                  onFocus={() => {
                    if (datos.regimenFiscal) {
                      setDropdownRegimenAbierto(true);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setDropdownRegimenAbierto(!dropdownRegimenAbierto);
                    if (!dropdownRegimenAbierto) {
                      setRegimenesFiltrados(REGIMENES_FISCALES);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${dropdownRegimenAbierto ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {dropdownRegimenAbierto && regimenesFiltrados.length > 0 && (
                <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg bg-white z-10 absolute w-full shadow-lg">
                  {regimenesFiltrados.map((r, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                      onClick={() => {
                        setDatos({ ...datos, regimenFiscal: r });
                        setDropdownRegimenAbierto(false);
                      }}
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mail de Facturación
            </label>
            <input
              type="email"
              name="mailFacturacion"
              value={datos.mailFacturacion}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 bg-white placeholder-gray-400"
              placeholder="facturacion@empresa.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uso de CFDI
              </label>
              <input
                type="text"
                name="cfdi"
                value={datos.cfdi}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="G03 - Gastos en general"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda
              </label>
              <input
                type="text"
                name="moneda"
                value={datos.moneda}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="MXN, USD, EUR..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Método de Pago - Desplegable con búsqueda */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="metodoPago"
                  value={datos.metodoPago}
                  onChange={handleInputChange}
                  placeholder="Escribe para buscar..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  autoComplete="off"
                  onFocus={() => {
                    if (datos.metodoPago) {
                      setDropdownMetodoAbierto(true);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setDropdownMetodoAbierto(!dropdownMetodoAbierto);
                    if (!dropdownMetodoAbierto) {
                      setMetodosFiltrados(METODOS_PAGO);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${dropdownMetodoAbierto ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {dropdownMetodoAbierto && metodosFiltrados.length > 0 && (
                <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg bg-white z-10 absolute w-full shadow-lg">
                  {metodosFiltrados.map((m, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                      onClick={() => {
                        setDatos({ ...datos, metodoPago: m });
                        setDropdownMetodoAbierto(false);
                      }}
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Forma de Pago - Desplegable con búsqueda */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de Pago
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="formaPago"
                  value={datos.formaPago}
                  onChange={handleInputChange}
                  placeholder="Escribe para buscar..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  autoComplete="off"
                  onFocus={() => {
                    if (datos.formaPago) {
                      setDropdownFormaAbierto(true);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setDropdownFormaAbierto(!dropdownFormaAbierto);
                    if (!dropdownFormaAbierto) {
                      setFormasFiltradas(FORMAS_PAGO);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${dropdownFormaAbierto ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {dropdownFormaAbierto && formasFiltradas.length > 0 && (
                <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg bg-white z-10 absolute w-full shadow-lg">
                  {formasFiltradas.map((f, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                      onClick={() => {
                        setDatos({ ...datos, formaPago: f });
                        setDropdownFormaAbierto(false);
                      }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleAtras}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
          >
            Atrás
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}