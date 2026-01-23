import { useState } from "react";

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  empresa: string;
}

interface Producto {
  descripcion: string;
  medidas: string;
  cantidad: number;
  calibre: string;
  tintas: number;
  caras: number;
  material: string;
  asaSuaje: string;
  precioUnitario: number;
  importe: number;
}

interface DatosPedido {
  cliente: string;
  telefono: string;
  correo: string;
  empresa: string;
  productos: Producto[];
  observaciones: string;
  disenoAprobado: boolean;
  anticipoAprobado: boolean;
  total: number;
}

interface CrearPedidoProps {
  onSubmit: (datos: DatosPedido) => void;
  onCancel: () => void;
}

const CLIENTES_EXISTENTES: Cliente[] = [
  { id: "1", nombre: "María González García", telefono: "33-1234-5678", correo: "maria.gonzalez@empresa.com", empresa: "Distribuidora González" },
  { id: "2", nombre: "Carlos Hernández López", telefono: "33-8765-4321", correo: "carlos.hdez@comercial.mx", empresa: "Comercial Hernández" },
  { id: "3", nombre: "Ana Patricia Ruiz", telefono: "33-5555-6666", correo: "ana.ruiz@tienda.com", empresa: "Tienda La Esperanza" }
];

const PRODUCTOS = ["Bolsa plana", "Bolsa troquelada", "Bolsa celofán", "Bolsa envíos", "Bolsa asa flexible"];
const MEDIDAS = ["20x30", "30x40", "40x50", "50x60", "60x90"];
const CALIBRES = ["150", "175", "200", "225", "250", "275", "300"];
const MATERIALES = ["Alta Densidad", "Baja Densidad", "BOPP"];

export default function CrearPedido({ onSubmit, onCancel }: CrearPedidoProps) {
  const [paso, setPaso] = useState(1);
  const [modalClientes, setModalClientes] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [datos, setDatos] = useState<DatosPedido>({
    cliente: "", telefono: "", correo: "", empresa: "", productos: [], observaciones: "",
    disenoAprobado: false, anticipoAprobado: false, total: 0
  });

  const [producto, setProducto] = useState<Producto>({
    descripcion: "", medidas: "", cantidad: 0, calibre: "200", tintas: 1, caras: 1,
    material: "Alta Densidad", asaSuaje: "Sin asa/suaje", precioUnitario: 0, importe: 0
  });

  const [dropdowns, setDropdowns] = useState({ producto: false, medidas: false, calibre: false });

  const normalizar = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const clientesFiltrados = CLIENTES_EXISTENTES.filter((c) => {
    const b = normalizar(busqueda);
    return normalizar(c.nombre).includes(b) || normalizar(c.empresa).includes(b) || 
           c.telefono.includes(busqueda) || c.correo.toLowerCase().includes(busqueda.toLowerCase());
  });

  const seleccionarCliente = (c: Cliente) => {
    setDatos({ ...datos, cliente: c.nombre, telefono: c.telefono, correo: c.correo, empresa: c.empresa });
    setModalClientes(false);
    setBusqueda("");
  };

  const cambiarProducto = (campo: string, valor: any) => {
    const nuevo = { ...producto, [campo]: valor };
    if (campo === 'cantidad' || campo === 'precioUnitario') {
      const cant = campo === 'cantidad' ? Number(valor) : nuevo.cantidad;
      const precio = campo === 'precioUnitario' ? Number(valor) : nuevo.precioUnitario;
      nuevo.importe = cant * precio;
    }
    setProducto(nuevo);
  };

  const agregarProducto = () => {
    if (producto.descripcion && producto.cantidad > 0 && producto.precioUnitario > 0) {
      const nuevos = [...datos.productos, producto];
      setDatos({ ...datos, productos: nuevos, total: nuevos.reduce((s, p) => s + p.importe, 0) });
      setProducto({ descripcion: "", medidas: "", cantidad: 0, calibre: "200", tintas: 1, caras: 1,
        material: "Alta Densidad", asaSuaje: "Sin asa/suaje", precioUnitario: 0, importe: 0 });
    }
  };

  const eliminarProducto = (i: number) => {
    const nuevos = datos.productos.filter((_, idx) => idx !== i);
    setDatos({ ...datos, productos: nuevos, total: nuevos.reduce((s, p) => s + p.importe, 0) });
  };

  return (
    <div className="relative">
      {modalClientes && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-semibold">Buscar Cliente</h3>
                <button onClick={() => { setModalClientes(false); setBusqueda(""); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar..." className="w-full px-4 py-3 border rounded-lg text-gray-900" autoFocus />
            </div>
            <div className="overflow-y-auto max-h-96">
              {clientesFiltrados.map((c) => (
                <div key={c.id} onClick={() => seleccionarCliente(c)}
                  className="p-4 hover:bg-blue-50 cursor-pointer border-b">
                  <h4 className="font-semibold">{c.nombre}</h4>
                  <p className="text-sm text-gray-600">{c.empresa}</p>
                  <p className="text-sm text-gray-500">{c.telefono} • {c.correo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paso === 1 ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}>
            {paso === 1 ? "1" : "✓"}
          </div>
          <div className={`w-24 h-1 ${paso === 2 ? "bg-blue-600" : "bg-gray-300"}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paso === 2 ? "bg-blue-600 text-white" : "bg-gray-300"}`}>2</div>
        </div>
      </div>

      {paso === 1 && (
        <div>
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-semibold">Datos del Cliente</h3>
            <button onClick={() => setModalClientes(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Buscar Cliente</button>
          </div>
          {datos.cliente ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold">{datos.cliente}</h4>
                  <p className="text-sm text-gray-600">{datos.empresa}</p>
                  <p className="text-sm text-gray-500">{datos.telefono} • {datos.correo}</p>
                </div>
                <button onClick={() => setDatos({ ...datos, cliente: "", telefono: "", correo: "", empresa: "" })}
                  className="text-red-600">✕</button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed rounded-lg">
              <p className="text-gray-500 mb-2">No se ha seleccionado ningún cliente</p>
              <button onClick={() => setModalClientes(true)} className="text-blue-600 font-medium">Seleccionar Cliente</button>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onCancel} className="px-6 py-2 border rounded-lg">Cancelar</button>
            <button onClick={() => setPaso(2)} disabled={!datos.cliente}
              className={`px-6 py-2 rounded-lg ${datos.cliente ? "bg-blue-600 text-white" : "bg-gray-300 cursor-not-allowed"}`}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-6">Agregar Productos</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Producto</label>
                <div className="flex gap-2">
                  <input type="text" value={producto.descripcion} onChange={(e) => cambiarProducto('descripcion', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg" />
                  <button onClick={() => setDropdowns({ ...dropdowns, producto: !dropdowns.producto })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg">▼</button>
                </div>
                {dropdowns.producto && (
                  <ul className="absolute z-10 w-full border mt-1 max-h-60 overflow-auto rounded-lg bg-white shadow-lg">
                    {PRODUCTOS.map((p) => (
                      <li key={p} onClick={() => { cambiarProducto('descripcion', p); setDropdowns({ ...dropdowns, producto: false }); }}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer">{p}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Medidas</label>
                <div className="flex gap-2">
                  <input type="text" value={producto.medidas} onChange={(e) => cambiarProducto('medidas', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg" />
                  <button onClick={() => setDropdowns({ ...dropdowns, medidas: !dropdowns.medidas })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg">▼</button>
                </div>
                {dropdowns.medidas && (
                  <ul className="absolute z-10 w-full border mt-1 max-h-60 overflow-auto rounded-lg bg-white shadow-lg">
                    {MEDIDAS.map((m) => (
                      <li key={m} onClick={() => { cambiarProducto('medidas', m); setDropdowns({ ...dropdowns, medidas: false }); }}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer">{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div><label className="block text-sm font-medium mb-1">Cantidad</label>
                <input type="number" value={producto.cantidad || ""} onChange={(e) => cambiarProducto('cantidad', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Tintas</label>
                <input type="number" value={producto.tintas} onChange={(e) => cambiarProducto('tintas', Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Caras</label>
                <select value={producto.caras} onChange={(e) => cambiarProducto('caras', Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value={1}>1</option><option value={2}>2</option>
                </select></div>
              <div><label className="block text-sm font-medium mb-1">Material</label>
                <select value={producto.material} onChange={(e) => cambiarProducto('material', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg">
                  {MATERIALES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium mb-1">Precio Unitario</label>
                <input type="number" step="0.01" value={producto.precioUnitario || ""} onChange={(e) => cambiarProducto('precioUnitario', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Importe</label>
                <input type="text" value={`$${producto.importe.toFixed(2)}`} readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100" /></div>
            </div>
            <button onClick={agregarProducto} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg">+ Agregar</button>
          </div>

          {datos.productos.length > 0 && (
            <div className="mb-4 space-y-2">
              {datos.productos.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{p.descripcion} {p.medidas}</p>
                    <p className="text-sm text-gray-500">{p.cantidad} × ${p.precioUnitario.toFixed(2)} = ${p.importe.toFixed(2)}</p>
                  </div>
                  <button onClick={() => eliminarProducto(i)} className="text-red-600">✕</button>
                </div>
              ))}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold">Total: ${datos.total.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Observaciones</label>
            <textarea value={datos.observaciones} onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
              rows={3} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex items-center">
              <input type="checkbox" checked={datos.disenoAprobado}
                onChange={(e) => setDatos({ ...datos, disenoAprobado: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded" />
              <span className="ml-2 text-sm">Diseño Aprobado</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={datos.anticipoAprobado}
                onChange={(e) => setDatos({ ...datos, anticipoAprobado: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded" />
              <span className="ml-2 text-sm">Anticipo Pagado</span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setPaso(1)} className="px-6 py-2 border rounded-lg">Atrás</button>
            <button onClick={() => onSubmit(datos)} disabled={datos.productos.length === 0}
              className={`px-6 py-2 rounded-lg ${datos.productos.length > 0 ? "bg-green-600 text-white" : "bg-gray-300 cursor-not-allowed"}`}>
              Crear Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}