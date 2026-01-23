import { useState } from "react";

interface Producto {
  nombre: string;
  cantidades: [number, number, number];
  precios: [number, number, number];
  calibre: string;
  tintas: number;
  caras: number;
  disenoAprobado: boolean;
  cantidadesSeleccionadas?: boolean[];
  observacionesDiseno?: string;
  // Estado de cuenta (producción real)
  cantidadProducida?: number;
  precioProduccion?: number;
}

interface Pago {
  id: number;
  tipo: "Anticipo" | "Abono" | "Liquidacion";
  monto: number;
  metodo: "Efectivo" | "Transferencia" | "Deposito";
  fecha: string;
}

interface Cotizacion {
  id: number;
  cliente: string;
  telefono: string;
  correo: string;
  empresa: string;
  productos: Producto[];
  observaciones: string;
  total: number;
  fecha: string;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  anticipoAprobado: boolean;
  pagos?: Pago[];
}

interface EditarAntLiqProps {
  cotizacion: Cotizacion;
  onSave: (cotizacionActualizada: Cotizacion) => void;
  onCancel: () => void;
}

export default function EditarAntLiq({ cotizacion, onSave, onCancel }: EditarAntLiqProps) {
  // Calcular total del pedido original para inicializar pagos
  const calcularTotalInicial = () => {
    const subtotal = cotizacion.productos.reduce((total, prod) => {
      const cantidadesSeleccionadas = prod.cantidadesSeleccionadas || [false, false, false];
      const subtotal = cantidadesSeleccionadas.reduce((sum, seleccionada, idx) => {
        if (seleccionada) {
          const cantidad = Number(prod.cantidades[idx]) || 0;
          const precio = Number(prod.precios[idx]) || 0;
          return sum + (cantidad * precio);
        }
        return sum;
      }, 0);
      return total + subtotal;
    }, 0);
    const iva = subtotal * 0.16;
    return subtotal + iva;
  };

  const totalInicial = calcularTotalInicial();

  const [form, setForm] = useState<Cotizacion>({ 
    ...cotizacion,
    productos: cotizacion.productos.map((p, index) => {
      const cantidadesSeleccionadas = p.cantidadesSeleccionadas || [false, false, false];
      
      // Simular producción real con merma variable
      let cantidadPedida = 0;
      let precioPedido = 0;
      
      cantidadesSeleccionadas.forEach((seleccionada, idx) => {
        if (seleccionada) {
          cantidadPedida = p.cantidades[idx];
          precioPedido = p.precios[idx];
        }
      });
      
      // Simular cantidades producidas (con merma variable entre 8% y 12%)
      const mermaAleatoria = 0.08 + (Math.random() * 0.04);
      const cantidadProducida = cantidadPedida > 0 ? Math.floor(cantidadPedida * (1 + mermaAleatoria)) : 0;
      
      return {
        ...p,
        cantidadesSeleccionadas,
        cantidadProducida: p.cantidadProducida || cantidadProducida,
        precioProduccion: p.precioProduccion || precioPedido
      };
    }),
    pagos: cotizacion.pagos || [
      // Simular un anticipo del 50% ya registrado
      {
        id: 1,
        tipo: "Anticipo",
        monto: totalInicial * 0.50,
        metodo: "Transferencia",
        fecha: "2025-01-16"
      }
    ]
  });

  const [mostrarPagos, setMostrarPagos] = useState(false);
  const [nuevoPago, setNuevoPago] = useState({
    tipo: "Anticipo" as "Anticipo" | "Abono" | "Liquidacion",
    monto: "",
    metodo: "Efectivo" as "Efectivo" | "Transferencia" | "Deposito"
  });

  const handleGuardar = () => {
    onSave({ ...form });
  };

  const handleIngresarPago = () => {
    if (!nuevoPago.monto || parseFloat(nuevoPago.monto) <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    const pago: Pago = {
      id: (form.pagos?.length || 0) + 1,
      tipo: nuevoPago.tipo,
      monto: parseFloat(nuevoPago.monto),
      metodo: nuevoPago.metodo,
      fecha: new Date().toISOString().split('T')[0]
    };

    setForm({
      ...form,
      pagos: [...(form.pagos || []), pago]
    });

    setNuevoPago({
      tipo: "Anticipo",
      monto: "",
      metodo: "Efectivo"
    });
  };

  const calcularSubtotalPorCantidad = (producto: Producto, index: number) => {
    const cantidad = Number(producto.cantidades[index]) || 0;
    const precio = Number(producto.precios[index]) || 0;
    return cantidad * precio;
  };

  // Cálculos del Pedido Original
  const calcularSubtotalPedido = () => {
    return form.productos.reduce((total, prod) => {
      const cantidadesSeleccionadas = prod.cantidadesSeleccionadas || [false, false, false];
      const subtotal = cantidadesSeleccionadas.reduce((sum, seleccionada, idx) => {
        if (seleccionada) {
          return sum + calcularSubtotalPorCantidad(prod, idx);
        }
        return sum;
      }, 0);
      return total + subtotal;
    }, 0);
  };

  const subtotalPedido = calcularSubtotalPedido();
  const ivaPedido = subtotalPedido * 0.16;
  const totalPedido = subtotalPedido + ivaPedido;

  // Cálculos del Estado de Cuenta (Producción Real)
  const calcularSubtotalProduccion = () => {
    return form.productos.reduce((total, prod) => {
      const cantidadProducida = Number(prod.cantidadProducida) || 0;
      const precioProduccion = Number(prod.precioProduccion) || 0;
      return total + (cantidadProducida * precioProduccion);
    }, 0);
  };

  const subtotalProduccion = calcularSubtotalProduccion();
  const ivaProduccion = subtotalProduccion * 0.16;
  const totalProduccion = subtotalProduccion + ivaProduccion;

  // Cálculo de pagos
  const totalPagado = (form.pagos || []).reduce((sum, pago) => sum + pago.monto, 0);
  const saldoPendiente = totalProduccion - totalPagado;

  return (
    <div className="space-y-5">
      {/* Información del Cliente */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wider">
          Información del Cliente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {form.cliente}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {form.empresa}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {form.telefono}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {form.correo}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Financiero del Pedido Original */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border-2 border-blue-300">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Resumen Financiero del Pedido
        </h3>
        
        {/* Productos del Pedido */}
        <div className="space-y-3 mb-4">
          {form.productos.map((producto, indexProd) => {
            const cantidadesSeleccionadas = producto.cantidadesSeleccionadas || [false, false, false];
            
            return (
              <div key={indexProd} className="bg-white p-3 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">{producto.nombre}</h4>
                <div className="text-xs text-gray-600 mb-2">
                  Calibre: {producto.calibre} | Tintas: {producto.tintas} | Caras: {producto.caras}
                </div>
                
                {producto.cantidades.map((cantidad, indexCant) => {
                  if (cantidad === 0 || !cantidadesSeleccionadas[indexCant]) return null;
                  const subtotal = calcularSubtotalPorCantidad(producto, indexCant);
                  
                  return (
                    <div key={indexCant} className="bg-blue-50 p-2 rounded text-xs flex justify-between items-center">
                      <div>
                        <span className="font-medium">{cantidad.toLocaleString()} unidades</span>
                        <span className="text-gray-600 ml-2">× ${producto.precios[indexCant].toFixed(2)}</span>
                      </div>
                      <span className="font-bold text-blue-700">${subtotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="space-y-2 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">Subtotal:</span>
            <span className="font-bold text-gray-900">${subtotalPedido.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">IVA (16%):</span>
            <span className="font-bold text-gray-900">${ivaPedido.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t-2 border-blue-300">
            <span className="text-gray-900 font-bold">Total Pedido:</span>
            <span className="text-xl font-bold text-blue-700">${totalPedido.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Estado de Cuenta (Producción Real) */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-300">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Estado de Cuenta - Producción Real
        </h3>
        
        {/* Productos Producidos */}
        <div className="space-y-3 mb-4">
          {form.productos.map((producto, index) => {
            const cantidadProducida = Number(producto.cantidadProducida) || 0;
            const precioProduccion = Number(producto.precioProduccion) || 0;
            const totalProducto = cantidadProducida * precioProduccion;
            
            if (cantidadProducida === 0) return null;

            return (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">{producto.nombre}</h4>
                <div className="text-xs text-gray-600 mb-2">
                  Calibre: {producto.calibre} | Tintas: {producto.tintas} | Caras: {producto.caras}
                </div>
                
                <div className="bg-green-50 p-2 rounded text-xs flex justify-between items-center">
                  <div>
                    <span className="font-medium">{cantidadProducida.toLocaleString()} unidades producidas</span>
                    <span className="text-gray-600 ml-2">× ${precioProduccion.toFixed(2)}</span>
                  </div>
                  <span className="font-bold text-green-700">${totalProducto.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">Subtotal:</span>
            <span className="font-bold text-gray-900">${subtotalProduccion.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">IVA (16%):</span>
            <span className="font-bold text-gray-900">${ivaProduccion.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t-2 border-green-300">
            <span className="text-gray-900 font-bold">Total Real:</span>
            <span className="text-xl font-bold text-green-700">${totalProduccion.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Comparación de Totales */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border-2 border-purple-300">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Comparación y Ajuste
        </h3>
        
        <div className="bg-white p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Total Pedido Original</div>
              <div className="text-lg font-bold text-blue-600">${totalPedido.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Total Real (Producción)</div>
              <div className="text-lg font-bold text-green-600">${totalProduccion.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="pt-3 border-t-2 border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Diferencia (Ajuste):</span>
              <span className={`text-xl font-bold ${
                totalProduccion - totalPedido >= 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {totalProduccion - totalPedido >= 0 ? '+' : ''}${(totalProduccion - totalPedido).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {totalProduccion > totalPedido 
                ? '⚠️ Se debe cobrar más por producción real' 
                : totalProduccion < totalPedido
                ? '✓ Se debe ajustar (reembolso o descuento)'
                : '✓ Los montos coinciden exactamente'}
            </p>
          </div>
        </div>
      </div>

      {/* Sección de Pagos */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-lg border-2 border-yellow-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Gestión de Pagos
          </h3>
          <button
            onClick={() => setMostrarPagos(!mostrarPagos)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {mostrarPagos ? 'Ocultar' : 'Agregar Pago'}
          </button>
        </div>

        {/* Resumen de Pagos */}
        <div className="bg-white p-4 rounded-lg mb-4">
          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
            <div>
              <div className="text-gray-600 mb-1">Total a Cobrar</div>
              <div className="text-lg font-bold text-gray-900">${totalProduccion.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Total Pagado</div>
              <div className="text-lg font-bold text-green-600">${totalPagado.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Saldo Pendiente</div>
              <div className={`text-lg font-bold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${saldoPendiente.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Historial de Pagos */}
          {form.pagos && form.pagos.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">Historial de Pagos:</div>
              <div className="space-y-2">
                {form.pagos.map((pago) => (
                  <div key={pago.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                    <div>
                      <span className="font-semibold">{pago.tipo}</span>
                      <span className="text-gray-500 ml-2">({pago.metodo})</span>
                      <span className="text-gray-400 ml-2">{pago.fecha}</span>
                    </div>
                    <span className="font-bold text-green-700">${pago.monto.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formulario de Nuevo Pago */}
        {mostrarPagos && (
          <div className="bg-white p-4 rounded-lg border-2 border-yellow-400 space-y-4">
            <h4 className="font-semibold text-gray-900">Registrar Nuevo Pago</h4>
            
            {/* Anticipo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
                <select
                  value={nuevoPago.tipo}
                  onChange={(e) => setNuevoPago({...nuevoPago, tipo: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="Anticipo">Anticipo</option>
                  <option value="Abono">Abono</option>
                  <option value="Liquidacion">Liquidación</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={nuevoPago.monto}
                  onChange={(e) => setNuevoPago({...nuevoPago, monto: e.target.value})}
                  placeholder="0.00"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                <select
                  value={nuevoPago.metodo}
                  onChange={(e) => setNuevoPago({...nuevoPago, metodo: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Deposito">Depósito</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleIngresarPago}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ingresar Pago
            </button>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-colors"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}