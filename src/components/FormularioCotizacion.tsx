import { useState } from "react";

  interface Cliente {
    id: string;
    nombre: string;
    telefono: string;
    correo: string;
    empresa: string;
  }

  interface FormularioCotizacionProps {
    onSubmit: (datos: DatosCotizacion) => void;
    onCancel: () => void;
  }

  // Datos precargados de clientes existentes
  const CLIENTES_EXISTENTES: Cliente[] = [
    {
      id: "1",
      nombre: "María González García",
      telefono: "33-1234-5678",
      correo: "maria.gonzalez@empresa.com",
      empresa: "Distribuidora González"
    },
    {
      id: "2",
      nombre: "Carlos Hernández López",
      telefono: "33-8765-4321",
      correo: "carlos.hdez@comercial.mx",
      empresa: "Comercial Hernández"
    },
    {
      id: "3",
      nombre: "Ana Patricia Ruiz",
      telefono: "33-5555-6666",
      correo: "ana.ruiz@tienda.com",
      empresa: "Tienda La Esperanza"
    },
    {
      id: "4",
      nombre: "Roberto Martínez",
      telefono: "33-9999-1111",
      correo: "roberto.m@supermercado.mx",
      empresa: "Supermercado El Ahorro"
    },
    {
      id: "5",
      nombre: "Laura Sánchez Díaz",
      telefono: "33-7777-8888",
      correo: "laura.sanchez@boutique.com",
      empresa: "Boutique Elegancia"
    },
    {
      id: "6",
      nombre: "José Luis Ramírez",
      telefono: "33-3333-4444",
      correo: "jl.ramirez@farmacia.mx",
      empresa: "Farmacia San José"
    }
  ];

  interface Producto {
    nombre: string;
    cantidades: [number, number, number];
    precios: [number, number, number];
    calibre: string;
    tintas: number;
    caras: number;
  }


  interface DatosCotizacion {
    cliente: string;
    telefono: string;
    correo: string;
    empresa: string;
    productos: Producto[];
    observaciones: string;
  }

  const PRODUCTOS_DISPONIBLES = [
    "Bolsa plana 30x40 baja densidad",
    "Bolsa plana 40x50 baja densidad",
    "Bolsa plana 50x60 baja densidad",
    "Bolsa troquelada 30x40 alta densidad",
    "Bolsa troquelada 40x50 alta densidad",
    "Bolsa troquelada 50x60 alta densidad",
    "Bolsa celofán 20x30 BOPP",
    "Bolsa celofán 30x40 BOPP",
    "Bolsa celofán 40x50 BOPP",
    "Bolsa envíos 30x40 alta densidad",
    "Bolsa envíos 40x50 alta densidad",
    "Bolsa envíos 50x70 alta densidad",
    "Bolsa asa flexible 30x40 alta densidad",
    "Bolsa asa flexible 40x50 alta densidad",
    "Bolsa asa flexible 50x60 alta densidad",
    "Bobina alta densidad 30cm",
    "Bobina alta densidad 50cm",
    "Bobina baja densidad 40cm",
    "Faldón BOPP 60x90",
    "Faldón BOPP 80x120",
    "Lámina BOPP 100x150",
    "Lámina BOPP 120x180"
  ];

  const CALIBRES = ["150", "175", "200", "225", "250", "275", "300", "325", "350", "375", "400"];

  export default function FormularioCotizacion({
    onSubmit,
    onCancel,
  }: FormularioCotizacionProps) {
    const [paso, setPaso] = useState(1);
    const [datos, setDatos] = useState<DatosCotizacion>({
      cliente: "",
      telefono: "",
      correo: "",
      empresa: "",
      productos: [],
      observaciones: "",
    });

    const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
    const [busquedaCliente, setBusquedaCliente] = useState("");

  const [productoActual, setProductoActual] = useState<Producto>({
    nombre: "",
    cantidades: [0, 0, 0],
    precios: [0, 0, 0],
    calibre: "200",
    tintas: 1,
    caras: 1,
  });



    const [productosFiltrados, setProductosFiltrados] = useState<string[]>([]);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [mostrarDropdownCalibre, setMostrarDropdownCalibre] = useState(false);
    const [mostrarDropdownCaras, setMostrarDropdownCaras] = useState(false);

    /* FUNCIÓN PARA NORMALIZAR TEXTO (QUITAR ACENTOS) */
    const normalizarTexto = (texto: string) => {
      return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    };

    // Función para seleccionar un cliente existente
    const seleccionarCliente = (cliente: Cliente) => {
      setDatos({
        ...datos,
        cliente: cliente.nombre,
        telefono: cliente.telefono,
        correo: cliente.correo,
        empresa: cliente.empresa
      });
      setMostrarModalClientes(false);
      setBusquedaCliente("");
    };

    // Filtrar clientes según búsqueda
    const clientesFiltrados = CLIENTES_EXISTENTES.filter((cliente) => {
      const busqueda = normalizarTexto(busquedaCliente);
      return (
        normalizarTexto(cliente.nombre).includes(busqueda) ||
        normalizarTexto(cliente.empresa).includes(busqueda) ||
        cliente.telefono.includes(busquedaCliente) ||
        cliente.correo.toLowerCase().includes(busquedaCliente.toLowerCase())
      );
    });

    // Inputs del cliente
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setDatos({ ...datos, [name]: value });
    };

    // Inputs del producto
    const handleProductoChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;

      if (name === "tintas") {
        if (value === "") {
          setProductoActual({
            ...productoActual,
            [name]: "" as any,
          });
        } else {
          setProductoActual({
            ...productoActual,
            [name]: Number(value),
          });
        }
      } else {
        setProductoActual({
          ...productoActual,
          [name]: value,
        });

        // Si es el nombre del producto, filtrar lista sin acentos
        if (name === "nombre") {
          const valorNormalizado = normalizarTexto(value);
          const filtered = PRODUCTOS_DISPONIBLES.filter((p) =>
            normalizarTexto(p).includes(valorNormalizado)
          );
          setProductosFiltrados(filtered);
          setMostrarDropdown(value.length > 0);
        }
      }
    };

    // Función para calcular precio por bolsa según cantidad
    const calcularPrecioPorBolsa = (cantidad: number): number => {
      if (cantidad === 0) return 0;
      
      const BOLSAS_POR_KG = 88.652;
      const kilos = cantidad / BOLSAS_POR_KG;
      
      // Tabla de precios por kilo según volumen
      let precioKg: number;
      if (kilos >= 1000) precioKg = 90;
      else if (kilos >= 500) precioKg = 90;
      else if (kilos >= 300) precioKg = 95;
      else if (kilos >= 200) precioKg = 120;
      else if (kilos >= 100) precioKg = 150;
      else if (kilos >= 75) precioKg = 180;
      else if (kilos >= 50) precioKg = 200;
      else if (kilos >= 30) precioKg = 250;
      else precioKg = 250; // Menos de 30kg
      
      // Calcular precio por bolsa
      const precioPorBolsa = precioKg / BOLSAS_POR_KG;
      return Number(precioPorBolsa.toFixed(4));
    };

    const handleCantidadChange = (index: number, value: string) => {
      const nuevasCantidades = [...productoActual.cantidades];
      const nuevosPrecios = [...productoActual.precios];
      
      const cantidad = value === "" ? 0 : Number(value);
      nuevasCantidades[index] = cantidad;
      
      // Calcular automáticamente el precio según la cantidad
      nuevosPrecios[index] = calcularPrecioPorBolsa(cantidad);

      setProductoActual({
        ...productoActual,
        cantidades: nuevasCantidades as [number, number, number],
        precios: nuevosPrecios as [number, number, number],
      });
    };

  const handlePrecioChange = (index: number, value: string) => {
    const nuevosPrecios = [...productoActual.precios];
    nuevosPrecios[index] = value === "" ? 0 : Number(value);

    setProductoActual({
      ...productoActual,
      precios: nuevosPrecios as [number, number, number],
    });
  };


    const handleAgregarProducto = () => {
    const tieneValoresValidos = productoActual.cantidades.some(
      (cant, i) => cant > 0 && productoActual.precios[i] > 0
    );

    if (productoActual.nombre && tieneValoresValidos) {
      setDatos({
        ...datos,
        productos: [...datos.productos, productoActual],
      });

      setProductoActual({
        nombre: "",
        cantidades: [0, 0, 0],
        precios: [0, 0, 0],
        calibre: "200",
        tintas: 1,
        caras: 1,
      });

      setProductosFiltrados([]);
      setMostrarDropdown(false);
    }
  };

    const handleEliminarProducto = (index: number) => {
      setDatos({
        ...datos,
        productos: datos.productos.filter((_, i) => i !== index),
      });
    };

    const handleSiguiente = () => {
      if (datos.cliente && datos.telefono && datos.correo) {
        setPaso(2);
      }
    };

    const handleAtras = () => setPaso(1);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (datos.productos.length > 0) {
        onSubmit(datos);
      }
    };

    const calcularTotal = () => {
    return datos.productos.reduce((total, prod) => {
      const subtotal = prod.cantidades.reduce(
        (sum, cant, i) => sum + cant * prod.precios[i],
        0
      );
      return total + subtotal;
    }, 0);
  };


    return (
      <div className="relative">
        {/* Modal de búsqueda de clientes */}
        {mostrarModalClientes && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Buscar Cliente Existente
                  </h3>
                  <button
                    onClick={() => {
                      setMostrarModalClientes(false);
                      setBusquedaCliente("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    placeholder="Buscar por nombre, empresa, teléfono o correo..."
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                    autoFocus
                  />
                  <svg 
                    className="w-5 h-5 text-gray-400 absolute left-3 top-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="overflow-y-auto max-h-96">
                {clientesFiltrados.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {clientesFiltrados.map((cliente) => (
                      <div
                        key={cliente.id}
                        onClick={() => seleccionarCliente(cliente)}
                        className="p-4 hover:bg-purple-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{cliente.nombre}</h4>
                            <p className="text-sm text-gray-600 mt-1">{cliente.empresa}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {cliente.telefono}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {cliente.correo}
                              </span>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium">No se encontraron clientes</p>
                    <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                paso === 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {/* PASO 1 - Datos del Cliente */}
        <div className={paso === 1 ? "block" : "hidden"}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Datos del Cliente
            </h3>
            <button
              type="button"
              onClick={() => setMostrarModalClientes(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Cliente Existente
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente
              </label>
              <input
                type="text"
                name="cliente"
                value={datos.cliente}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-gray-900 bg-white placeholder-gray-400"
                placeholder="Juan Pérez"
                required
              />
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
                  required
                />
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
                  placeholder="cliente@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa (Opcional)
              </label>
              <input
                type="text"
                name="empresa"
                value={datos.empresa}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-gray-900 bg-white placeholder-gray-400"
                placeholder="Nombre de la empresa"
              />
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

        {/* PASO 2 - Productos */}
        <div className={paso === 2 ? "block" : "hidden"}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Agregar Productos
          </h3>   

          {/* Formulario de producto */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 relative">
            <div className="space-y-3">
              {/* Producto */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="nombre"
                    value={productoActual.nombre}
                    onChange={handleProductoChange}
                    placeholder="Escribe para buscar..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    autoComplete="off"
                    onFocus={() => {
                      if (productoActual.nombre) {
                        setMostrarDropdown(true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarDropdown(!mostrarDropdown);
                      if (!mostrarDropdown) {
                        setProductosFiltrados(PRODUCTOS_DISPONIBLES);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform ${mostrarDropdown ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {/* Lista de sugerencias */}
                {mostrarDropdown && productosFiltrados.length > 0 && (
                  <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg bg-white z-10 absolute w-full shadow-lg">
                    {productosFiltrados.map((p, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                        onClick={() => {
                          setProductoActual({ ...productoActual, nombre: p });
                          setProductosFiltrados([]);
                          setMostrarDropdown(false);
                        }}
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Calibre y Cantidad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calibre
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productoActual.calibre}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
                      onClick={() => setMostrarDropdownCalibre(!mostrarDropdownCalibre)}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarDropdownCalibre(!mostrarDropdownCalibre)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <svg 
                        className={`w-5 h-5 transition-transform ${mostrarDropdownCalibre ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {mostrarDropdownCalibre && (
                    <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg bg-white z-10 absolute w-full shadow-lg">
                      {CALIBRES.map((calibre) => (
                        <li
                          key={calibre}
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                          onClick={() => {
                            setProductoActual({ ...productoActual, calibre });
                            setMostrarDropdownCalibre(false);
                          }}
                        >
                          {calibre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Cantidades
    </label>
    <div className="grid grid-cols-3 gap-2">
      {productoActual.cantidades.map((cantidad, index) => (
        <input
          key={index}
          type="number"
          min="0"
          value={cantidad === 0 ? "" : cantidad}
          onChange={(e) => handleCantidadChange(index, e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
          placeholder={`Cant. ${index + 1}`}
        />
      ))}
    </div>
  </div>

              </div>

              {/* Tintas y Caras */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tintas
                  </label>
                  <input
                    type="number"
                    name="tintas"
                    value={productoActual.tintas}
                    onChange={handleProductoChange}
                    min="1"
                    max="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="0"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caras
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${productoActual.caras} cara${productoActual.caras > 1 ? 's' : ''}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
                      onClick={() => setMostrarDropdownCaras(!mostrarDropdownCaras)}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarDropdownCaras(!mostrarDropdownCaras)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <svg 
                        className={`w-5 h-5 transition-transform ${mostrarDropdownCaras ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {mostrarDropdownCaras && (
                    <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg bg-white z-10 absolute w-full shadow-lg">
                      <li
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                        onClick={() => {
                          setProductoActual({ ...productoActual, caras: 1 });
                          setMostrarDropdownCaras(false);
                        }}
                      >
                        1 cara
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                        onClick={() => {
                          setProductoActual({ ...productoActual, caras: 2 });
                          setMostrarDropdownCaras(false);
                        }}
                      >
                        2 caras
                      </li>
                    </ul>
                  )}
                </div>
              </div>

              {/* Precio */}
              <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Precios unitarios (calculados automáticamente)
    </label>
    <div className="grid grid-cols-3 gap-2">
      {productoActual.precios.map((precio, index) => (
        <div key={index} className="relative">
          <input
            type="text"
            value={precio === 0 ? "" : `${precio.toFixed(4)}`}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 cursor-not-allowed"
            placeholder="Auto"
          />
          {productoActual.cantidades[index] > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {(productoActual.cantidades[index] / 88.652).toFixed(2)} kg
            </div>
          )}
        </div>
      ))}
    </div>
  </div>

            </div>

            <button
              type="button"
              onClick={handleAgregarProducto}
              className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Agregar Producto
            </button>
          </div>

          {/* Lista de productos */}
          {datos.productos.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Productos agregados:
              </h4>
              <div className="space-y-2">
                {datos.productos.map((prod, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{prod.nombre}</p>
                      <p className="text-sm text-gray-500">
                        Calibre: {prod.calibre} | Tintas: {prod.tintas} | Caras: {prod.caras}
                      </p>
                      {prod.cantidades.map((cant, i) =>
    cant > 0 ? (
      <p key={i} className="text-sm text-gray-600">
        {cant} x ${prod.precios[i].toFixed(2)} = $
        {(cant * prod.precios[i]).toFixed(2)}
      </p>
    ) : null
  )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEliminarProducto(index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  Total: ${calcularTotal().toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (Opcional)
            </label>
            <textarea
              name="observaciones"
              value={datos.observaciones}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        text-gray-900 bg-white placeholder-gray-400"
              placeholder="Notas adicionales sobre la cotización..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleAtras}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={datos.productos.length === 0}
              className={`px-6 py-2 rounded-lg font-semibold ${
                datos.productos.length === 0
                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Crear Cotización
            </button>
          </div>
        </div>
      </div>
    );
  }