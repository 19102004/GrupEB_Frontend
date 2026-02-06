import { useState, useEffect } from "react";
import { getRegimenesFiscales, getMetodosPago, getFormasPago } from "../services/catalogosService";
import type { RegimenFiscal, MetodoPago, FormaPago } from "../types/clientes.types";
import type { CreateClienteRequest, UpdateClienteRequest, Cliente } from "../types/clientes.types";

// ✅ 10 Monedas más utilizadas en el mundo
const MONEDAS = [
  { codigo: "MXN", nombre: "Peso mexicano (MXN)" },
  { codigo: "USD", nombre: "Dólar estadounidense (USD)" },
  { codigo: "EUR", nombre: "Euro (EUR)" },
  { codigo: "JPY", nombre: "Yen japonés (JPY)" },
  { codigo: "GBP", nombre: "Libra esterlina (GBP)" },
  { codigo: "CNY", nombre: "Yuan chino (CNY)" },
  { codigo: "CAD", nombre: "Dólar canadiense (CAD)" },
  { codigo: "CHF", nombre: "Franco suizo (CHF)" },
  { codigo: "AUD", nombre: "Dólar australiano (AUD)" },
  { codigo: "INR", nombre: "Rupia india (INR)" },
];

interface FormularioClienteProps {
  onSubmit: (datos: CreateClienteRequest | UpdateClienteRequest) => void;
  onCancel: () => void;
  clienteEditar?: Cliente | null;
}

export default function FormularioCliente({
  onSubmit,
  onCancel,
  clienteEditar,
}: FormularioClienteProps) {
  const [paso, setPaso] = useState(1);
  const [regimenesFiscales, setRegimenesFiscales] = useState<RegimenFiscal[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const esEdicion = !!clienteEditar;

  const [datos, setDatos] = useState<CreateClienteRequest | UpdateClienteRequest>({
    empresa: clienteEditar?.empresa || "",
    correo: clienteEditar?.correo || "",
    telefono: clienteEditar?.telefono || "",
    atencion: clienteEditar?.atencion || "",
    razon_social: clienteEditar?.razon_social || "",
    impresion: clienteEditar?.impresion || "",
    celular: clienteEditar?.celular || "",
    regimen_fiscal_idregimen_fiscal: clienteEditar?.regimen_fiscal_idregimen_fiscal || 0,
    metodo_pago_idmetodo_pago: clienteEditar?.metodo_pago_idmetodo_pago || 0,
    forma_pago_idforma_pago: clienteEditar?.forma_pago_idforma_pago || 0,
    rfc: clienteEditar?.rfc || "",
    correo_facturacion: clienteEditar?.correo_facturacion || "",
    uso_cfdi: clienteEditar?.uso_cfdi || "",
    moneda: clienteEditar?.moneda || "",
    domicilio: clienteEditar?.domicilio || "",
    numero: clienteEditar?.numero || "",
    colonia: clienteEditar?.colonia || "",
    codigo_postal: clienteEditar?.codigo_postal || "",
    poblacion: clienteEditar?.poblacion || "",
    estado: clienteEditar?.estado || "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [regimenesData, metodosData, formasData] = await Promise.all([
        getRegimenesFiscales(),
        getMetodosPago(),
        getFormasPago(),
      ]);
      setRegimenesFiscales(regimenesData);
      setMetodosPago(metodosData);
      setFormasPago(formasData);
    } catch (error) {
      console.error("Error al cargar catálogos:", error);
      alert("Error al cargar catálogos");
    }
  };

  // ✅ VALIDACIONES PASO 1 (solo datos generales)
  const validarPaso1 = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Validar empresa
    if (!datos.empresa || datos.empresa.trim().length < 2) {
      nuevosErrores.empresa = "La empresa debe tener al menos 2 caracteres";
    } else if (datos.empresa.length > 128) {
      nuevosErrores.empresa = "La empresa no puede exceder 128 caracteres";
    }

    // Validar correo
    if (!datos.correo) {
      nuevosErrores.correo = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
      nuevosErrores.correo = "El formato del correo no es válido";
    }

    // Validar teléfono (opcional)
    if (datos.telefono && datos.telefono.trim() !== "") {
      const telefonoLimpio = datos.telefono.replace(/\D/g, "");
      if (telefonoLimpio.length < 10 || telefonoLimpio.length > 15) {
        nuevosErrores.telefono = "El teléfono debe tener entre 10 y 15 dígitos";
      }
    }

    // Validar celular (opcional)
    if (datos.celular && datos.celular.trim() !== "") {
      const celularLimpio = datos.celular.replace(/\D/g, "");
      if (celularLimpio.length < 10 || celularLimpio.length > 15) {
        nuevosErrores.celular = "El celular debe tener entre 10 y 15 dígitos";
      }
    }

    // Validar código postal (opcional)
    if (datos.codigo_postal && datos.codigo_postal.trim() !== "") {
      if (!/^\d{5}$/.test(datos.codigo_postal)) {
        nuevosErrores.codigo_postal = "El código postal debe tener 5 dígitos";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // ✅ VALIDACIONES PASO 2 (datos de facturación)
  const validarPaso2 = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Validar RFC (opcional)
    if (datos.rfc && datos.rfc.trim() !== "") {
      if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(datos.rfc.toUpperCase())) {
        nuevosErrores.rfc = "El formato del RFC no es válido";
      }
    }

    // Validar correo de facturación (opcional)
    if (datos.correo_facturacion && datos.correo_facturacion.trim() !== "") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo_facturacion)) {
        nuevosErrores.correo_facturacion = "El formato del correo de facturación no es válido";
      }
    }

    // Validar régimen fiscal
    if (!datos.regimen_fiscal_idregimen_fiscal || datos.regimen_fiscal_idregimen_fiscal === 0) {
      nuevosErrores.regimen_fiscal_idregimen_fiscal = "Debe seleccionar un régimen fiscal";
    }

    // Validar método de pago
    if (!datos.metodo_pago_idmetodo_pago || datos.metodo_pago_idmetodo_pago === 0) {
      nuevosErrores.metodo_pago_idmetodo_pago = "Debe seleccionar un método de pago";
    }

    // Validar forma de pago
    if (!datos.forma_pago_idforma_pago || datos.forma_pago_idforma_pago === 0) {
      nuevosErrores.forma_pago_idforma_pago = "Debe seleccionar una forma de pago";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Solo hacer parseInt en los IDs de catálogos
    const camposNumericos = [
      'regimen_fiscal_idregimen_fiscal',
      'metodo_pago_idmetodo_pago', 
      'forma_pago_idforma_pago'
    ];
    
    setDatos({ 
      ...datos, 
      [name]: camposNumericos.includes(name) ? parseInt(value) : value 
    });

    // Limpiar error del campo al editarlo
    if (errores[name]) {
      setErrores({ ...errores, [name]: "" });
    }
  };

  const handleSiguiente = () => {
    if (!validarPaso1()) {
      return;
    }

    setPaso(2);
  };

  const handleAtras = () => setPaso(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar paso 2 antes de enviar
    if (!validarPaso2()) {
      return;
    }

    setLoading(true);

    try {
      const datosFinales = { ...datos };

      // Limpiar espacios
      datosFinales.empresa = datosFinales.empresa.trim();
      datosFinales.correo = datosFinales.correo.trim().toLowerCase();

      // Limpiar teléfonos (solo números)
      if (datosFinales.telefono) {
        datosFinales.telefono = datosFinales.telefono.replace(/\D/g, "");
      }
      if (datosFinales.celular) {
        datosFinales.celular = datosFinales.celular.replace(/\D/g, "");
      }

      // Limpiar RFC (mayúsculas)
      if (datosFinales.rfc) {
        datosFinales.rfc = datosFinales.rfc.trim().toUpperCase();
      }

      // Limpiar correo de facturación
      if (datosFinales.correo_facturacion) {
        datosFinales.correo_facturacion = datosFinales.correo_facturacion.trim().toLowerCase();
      }

      await onSubmit(datosFinales);
    } catch (error: any) {
      console.error("Error al guardar cliente:", error);

      // Mostrar errores específicos del backend
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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

      {/* PASO 1: Datos generales */}
      <div className={paso === 1 ? "block" : "hidden"}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {esEdicion ? "Editar Cliente" : "Datos del Cliente"}
        </h3>

        <div className="space-y-4">
          {/* Empresa y Correo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Empresa *
              </label>
              <input
                type="text"
                name="empresa"
                value={datos.empresa}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400
                           ${errores.empresa ? "border-red-500" : "border-gray-300"}`}
                placeholder="Empresa Ejemplo S.A."
              />
              {errores.empresa && (
                <p className="mt-1 text-sm text-red-600">{errores.empresa}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="correo"
                value={datos.correo}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400
                           ${errores.correo ? "border-red-500" : "border-gray-300"}`}
                placeholder="contacto@empresa.com"
              />
              {errores.correo && (
                <p className="mt-1 text-sm text-red-600">{errores.correo}</p>
              )}
            </div>
          </div>

          {/* Atención y Razón Social */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Atención (Nombre contacto)
              </label>
              <input
                type="text"
                name="atencion"
                value={datos.atencion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón Social
              </label>
              <input
                type="text"
                name="razon_social"
                value={datos.razon_social}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="EMPRESA EJEMPLO SA DE CV"
              />
            </div>
          </div>

          {/* Impresión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impresión / Notas
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

          {/* Teléfono y Celular */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={datos.telefono}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setDatos({ ...datos, telefono: value });
                  if (errores.telefono) {
                    setErrores({ ...errores, telefono: "" });
                  }
                }}
                maxLength={15}
                className={`w-full px-4 py-2 border rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400
                           ${errores.telefono ? "border-red-500" : "border-gray-300"}`}
                placeholder="3312345678"
              />
              {errores.telefono && (
                <p className="mt-1 text-sm text-red-600">{errores.telefono}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Celular
              </label>
              <input
                type="tel"
                name="celular"
                value={datos.celular}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setDatos({ ...datos, celular: value });
                  if (errores.celular) {
                    setErrores({ ...errores, celular: "" });
                  }
                }}
                maxLength={15}
                className={`w-full px-4 py-2 border rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400
                           ${errores.celular ? "border-red-500" : "border-gray-300"}`}
                placeholder="3398765432"
              />
              {errores.celular && (
                <p className="mt-1 text-sm text-red-600">{errores.celular}</p>
              )}
            </div>
          </div>

          {/* Domicilio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domicilio
            </label>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                name="domicilio"
                value={datos.domicilio}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Calle"
              />
              <input
                type="text"
                name="numero"
                value={datos.numero}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Número"
              />
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

          {/* Código Postal, Población, Estado */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                name="codigo_postal"
                value={datos.codigo_postal}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setDatos({ ...datos, codigo_postal: value });
                  if (errores.codigo_postal) {
                    setErrores({ ...errores, codigo_postal: "" });
                  }
                }}
                maxLength={5}
                className={`w-full px-4 py-2 border rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400
                           ${errores.codigo_postal ? "border-red-500" : "border-gray-300"}`}
                placeholder="44100"
              />
              {errores.codigo_postal && (
                <p className="mt-1 text-sm text-red-600">{errores.codigo_postal}</p>
              )}
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

      {/* PASO 2: Datos de facturación */}
      <div className={paso === 2 ? "block" : "hidden"}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Datos de Facturación (SAT)
        </h3>

        <div className="space-y-4">
          {/* RFC y Uso CFDI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFC
              </label>
              <input
                type="text"
                name="rfc"
                value={datos.rfc}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setDatos({ ...datos, rfc: value });
                  if (errores.rfc) {
                    setErrores({ ...errores, rfc: "" });
                  }
                }}
                maxLength={13}
                className={`w-full px-4 py-2 border rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400
                           ${errores.rfc ? "border-red-500" : "border-gray-300"}`}
                placeholder="XAXX010101000"
              />
              {errores.rfc && (
                <p className="mt-1 text-sm text-red-600">{errores.rfc}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uso de CFDI
              </label>
              <input
                type="text"
                name="uso_cfdi"
                value={datos.uso_cfdi}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="G03"
              />
            </div>
          </div>

          {/* Correo de Facturación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo de Facturación
            </label>
            <input
              type="email"
              name="correo_facturacion"
              value={datos.correo_facturacion}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 bg-white placeholder-gray-400
                         ${errores.correo_facturacion ? "border-red-500" : "border-gray-300"}`}
              placeholder="facturacion@empresa.com"
            />
            {errores.correo_facturacion && (
              <p className="mt-1 text-sm text-red-600">{errores.correo_facturacion}</p>
            )}
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select
              name="moneda"
              value={datos.moneda}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 bg-white"
            >
              <option value="">Seleccionar moneda...</option>
              {MONEDAS.map((moneda) => (
                <option key={moneda.codigo} value={moneda.codigo}>
                  {moneda.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Régimen Fiscal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Régimen Fiscal *
            </label>
            <select
              name="regimen_fiscal_idregimen_fiscal"
              value={datos.regimen_fiscal_idregimen_fiscal}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 bg-white
                         ${errores.regimen_fiscal_idregimen_fiscal ? "border-red-500" : "border-gray-300"}`}
            >
              <option value={0}>Seleccionar régimen fiscal...</option>
              {regimenesFiscales.map((regimen) => (
                <option key={regimen.idregimen_fiscal} value={regimen.idregimen_fiscal}>
                  ({regimen.codigo}) {regimen.tipo_regimen}
                </option>
              ))}
            </select>
            {errores.regimen_fiscal_idregimen_fiscal && (
              <p className="mt-1 text-sm text-red-600">{errores.regimen_fiscal_idregimen_fiscal}</p>
            )}
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <select
              name="metodo_pago_idmetodo_pago"
              value={datos.metodo_pago_idmetodo_pago}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 bg-white
                         ${errores.metodo_pago_idmetodo_pago ? "border-red-500" : "border-gray-300"}`}
            >
              <option value={0}>Seleccionar método de pago...</option>
              {metodosPago.map((metodo) => (
                <option key={metodo.idmetodo_pago} value={metodo.idmetodo_pago}>
                  ({metodo.codigo}) {metodo.tipo_pago}
                </option>
              ))}
            </select>
            {errores.metodo_pago_idmetodo_pago && (
              <p className="mt-1 text-sm text-red-600">{errores.metodo_pago_idmetodo_pago}</p>
            )}
          </div>

          {/* Forma de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pago *
            </label>
            <select
              name="forma_pago_idforma_pago"
              value={datos.forma_pago_idforma_pago}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 bg-white
                         ${errores.forma_pago_idforma_pago ? "border-red-500" : "border-gray-300"}`}
            >
              <option value={0}>Seleccionar forma de pago...</option>
              {formasPago.map((forma) => (
                <option key={forma.idforma_pago} value={forma.idforma_pago}>
                  ({forma.codigo}) {forma.tipo_forma}
                </option>
              ))}
            </select>
            {errores.forma_pago_idforma_pago && (
              <p className="mt-1 text-sm text-red-600">{errores.forma_pago_idforma_pago}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleAtras}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Atrás
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (esEdicion ? "Guardando..." : "Creando...") : (esEdicion ? "Guardar Cambios" : "Crear Cliente")}
          </button>
        </div>
      </div>
    </form>
  );
}