import { useState, useEffect, useRef } from "react";
import Dashboard from "../layouts/Sidebar";

/* LISTAS */
const PRODUCTOS = [
  "Bolsa plana",
  "Bolsa troquelada",
  "Bolsa envíos",
  "Bolsa celofán",
  "Bolsa asa flexible",
  "Bobina",
  "Rollo perforado",
  "Faldón",
  "Lámina",
  "Otro",
];

const MATERIALES = ["Alta densidad", "Baja densidad", "BOPP", "Otro"];



const CALIBRES = Array.from({ length: 11 }, (_, i) =>
  (150 + i * 25).toString()
);

/* TIPOS */
type MedidaKey =
  | "altura"
  | "ancho"
  | "fuelleFondo"
  | "fuelleLateral1"
  | "fuelleLateral2"
  | "refuerzo"
  | "solapa";

interface ConfigProducto {
  imagen: string;
  medidas: { key: MedidaKey; label: string; position: string }[];
}

/* CONFIGURACIÓN POR PRODUCTO */
const CONFIG_PRODUCTOS: Record<string, ConfigProducto> = {
  "Bolsa plana": {
    imagen: "../src/assets/plana.png",
    medidas: [
      { key: "altura", label: "Altura", position: "left" },
      { key: "ancho", label: "Ancho", position: "top" },
    ],
  },

  "Bolsa troquelada": {
    imagen: "../src/assets/troquelada.png",
    medidas: [
      { key: "altura", label: "Altura", position: "left" },
      { key: "ancho", label: "Ancho", position: "top" },
      { key: "fuelleFondo", label: "Fuelle fondo", position: "bottom" },
      { key: "refuerzo", label: "Refuerzo", position: "right-top" },
      { key: "fuelleLateral1", label: "Fuelle lateral", position: "right" },
      { key: "fuelleLateral2", label: "Fuelle lateral", position: "left-bottom" },
    ],
  },

  "Bolsa celofán": {
    imagen: "../src/assets/celofan.png",
    medidas: [
      { key: "altura", label: "Altura", position: "left" },
      { key: "ancho", label: "Ancho", position: "top" },
      { key: "fuelleFondo", label: "Fuelle fondo", position: "bottom" },
      { key: "refuerzo", label: "Refuerzo", position: "right-top" },
      { key: "fuelleLateral1", label: "Fuelle lateral", position: "right" },
      { key: "fuelleLateral2", label: "Fuelle lateral", position: "left-bottom" },
    ],
  },

  "Bolsa envíos": {
    imagen: "../src/assets/envios.png",
    medidas: [
      { key: "altura", label: "Altura", position: "left" },
      { key: "ancho", label: "Ancho", position: "top" },
      { key: "solapa", label: "Solapa", position: "top-inside" },
      { key: "fuelleFondo", label: "Fuelle fondo", position: "bottom" },
    ],
  },

  "Bolsa asa flexible": {
    imagen: "../src/assets/asaflexible.png",
    medidas: [
      { key: "altura", label: "Altura", position: "left" },
      { key: "ancho", label: "Ancho", position: "top" },
      { key: "fuelleFondo", label: "Fuelle fondo", position: "bottom" },
      { key: "fuelleLateral1", label: "Fuelle lateral", position: "right" },
      { key: "fuelleLateral2", label: "Fuelle lateral", position: "left-bottom" },
    ],
  },
};

export default function Plastico() {
  /* MEDIDAS */
  const [medidas, setMedidas] = useState<Record<MedidaKey, string>>({
    altura: "",
    ancho: "",    
    fuelleFondo: "",
    fuelleLateral1: "",
    fuelleLateral2: "",
    refuerzo: "",
    solapa: "",
  });

  const setMedida = (key: MedidaKey, value: string) => {
    setMedidas((prev) => ({ ...prev, [key]: value }));
  };

  /* VALORES */
  const [producto, setProducto] = useState("");
  const [material, setMaterial] = useState("");
  const [calibre, setCalibre] = useState("");
  const [bolsasPorKilo, setBolsasPorKilo] = useState("");

  /* DROPDOWNS */
  const [showProducto, setShowProducto] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showCalibre, setShowCalibre] = useState(false);

  const [productoOtro, setProductoOtro] = useState(false);
  const [materialOtro, setMaterialOtro] = useState(false);

  const productoRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<HTMLDivElement>(null);
  const calibreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      !productoRef.current?.contains(event.target as Node) &&
      !materialRef.current?.contains(event.target as Node) &&
      !calibreRef.current?.contains(event.target as Node)
    ) {
      setShowProducto(false);
      setShowMaterial(false);
      setShowCalibre(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const toggleProducto = (e: React.MouseEvent) => {
  e.stopPropagation();
  setShowProducto((v) => !v);
  setShowMaterial(false);
  setShowCalibre(false);
};

const toggleMaterial = (e: React.MouseEvent) => {
  e.stopPropagation();
  setShowMaterial((v) => !v);
  setShowProducto(false);
  setShowCalibre(false);
};

const toggleCalibre = (e: React.MouseEvent) => {
  e.stopPropagation();
  setShowCalibre((v) => !v);
  setShowMaterial(false);
  setShowProducto(false);
};


  /* FILTRADOS */
  const [productosFiltrados, setProductosFiltrados] = useState(PRODUCTOS);
  const [materialesFiltrados, setMaterialesFiltrados] = useState(MATERIALES);

  const normalizarTexto = (texto: string) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtrar = (
    valor: string,
    lista: string[],
    setFiltrados: Function,
    setShow: Function
  ) => {
    const v = normalizarTexto(valor);
    setFiltrados(lista.filter((i) => normalizarTexto(i).includes(v)));
    setShow(true);
  };

  const FORMATO_MEDIDAS = {
  verticales: ["altura", "fuelleFondo", "refuerzo", "solapa"] as MedidaKey[],
  horizontales: ["ancho", "fuelleLateral1", "fuelleLateral2"] as MedidaKey[],
};

const construirMedidas = () => {
  const verticales = FORMATO_MEDIDAS.verticales
    .map((k) => medidas[k])
    .filter((v) => v);

  const horizontales = FORMATO_MEDIDAS.horizontales
    .map((k) => medidas[k])
    .filter((v) => v);

  if (!verticales.length && !horizontales.length) return "--";

  if (!horizontales.length) return verticales.join("+");
  if (!verticales.length) return horizontales.join("+");

  return `${verticales.join("+")}x${horizontales.join("+")}`;
};





  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-6">Dar de alta producto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORMULARIO */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="grid grid-cols-2 gap-4">
            {/* PRODUCTO */}
            <div ref={productoRef} className="relative">
  <label className="block text-sm font-semibold mb-1">Producto</label>

  <div className="flex gap-2">
    <input
      type="text"
      value={producto}
      readOnly={!productoOtro}
      placeholder={productoOtro ? "Escribe el producto" : "Selecciona producto"}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg
                 text-gray-900 bg-white cursor-pointer"
       onClick={toggleProducto}
       onChange={(e) => productoOtro && setProducto(e.target.value)}
    />

    <button
      type="button"
      onClick={() => setShowProducto((v) => !v)}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg
                 hover:bg-blue-700 flex items-center justify-center"
    >
      <svg
        className={`w-5 h-5 transition-transform ${
          showProducto ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>

  {showProducto && (
    <ul className="absolute w-full bg-white border border-gray-300
                   mt-1 max-h-60 overflow-auto rounded-lg
                   shadow-lg z-10">
      {PRODUCTOS.map((p) => (
        <li
          key={p}
          onClick={() => {
            if (p ==="Otro"){
              setProducto("");
              setProductoOtro(true);
            } else {
              setProducto(p);
              setProductoOtro(false);
            }
            setShowProducto(false);
          }}
          className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
        >
          {p}
        </li>
      ))}
    </ul>
  )}
</div>


            {/* MATERIAL */}
            <div ref={materialRef} className="relative">
  <label className="block text-sm font-semibold mb-1">Material</label>

  <div className="flex gap-2">
    <input
      type="text"
      value={material}
      readOnly={!materialOtro}
      placeholder={materialOtro ? "Escribe el material" : "Selecciona material"}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg
                 text-gray-900 bg-white cursor-pointer"
      onClick={toggleMaterial}
      onChange={(e) => materialOtro && setMaterial(e.target.value)}
    />

    <button
      type="button"
      onClick={() => setShowMaterial((v) => !v)}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg
                 hover:bg-blue-700 flex items-center justify-center"
    >
      <svg
        className={`w-5 h-5 transition-transform ${
          showMaterial ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>

  {showMaterial && (
    <ul className="absolute w-full bg-white border border-gray-300
                   mt-1 max-h-60 overflow-auto rounded-lg
                   shadow-lg z-10">
      {MATERIALES.map((m) => (
        <li
          key={m}
          onClick={() => {
            if (m === "Otro") {
              setMaterialOtro(true);
            } else {
              setMaterial(m);
            setMaterialOtro(false);
            }
            setShowMaterial(false);
          }}
          className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
        >
          {m}
        </li>
      ))}
    </ul>
  )}
</div>


            {/* CALIBRE */}
            <div ref={calibreRef} className="relative">
  <label className="block text-sm font-semibold mb-1">Calibre</label>

  <div className="flex gap-2">
    <input
      type="text"
      value={calibre}
      readOnly
      placeholder="Selecciona calibre"
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg
                 text-gray-900 bg-white cursor-pointer"
      onClick={toggleCalibre}
    />

    <button
      type="button"
      onClick={() => setShowCalibre((v) => !v)}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg
                 hover:bg-blue-700 flex items-center justify-center"
    >
      <svg
        className={`w-5 h-5 transition-transform ${
          showCalibre ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>

  {showCalibre && (
    <ul className="absolute w-full bg-white border border-gray-300
                   mt-1 max-h-60 overflow-auto rounded-lg
                   shadow-lg z-10">
      {CALIBRES.map((c) => (
        <li
          key={c}
          onClick={() => {
            setCalibre(c);
            setShowCalibre(false);
          }}
          className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
        >
          {c}
        </li>
      ))}
    </ul>
  )}
</div>


            {/* MEDIDAS */}
            <div>
              <label className="text-sm font-semibold">Medidas</label>
              <input
                value={construirMedidas()}
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-gray-700 font-medium"
              />
            </div>

            {/* BOLSAS */}
            <div>
              <label className="text-sm font-semibold">Bolsas por kilo</label>
              <input
                value={bolsasPorKilo}
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-gray-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* FIGURA */}
        <div className="bg-white p-6 rounded-xl shadow flex justify-center">
          <div className="relative w-[240px] h-[340px]">
            {producto && CONFIG_PRODUCTOS[producto] ? (
              <>
                <img
                  src={CONFIG_PRODUCTOS[producto].imagen}
                  className="w-full h-full object-contain"
                />

                {CONFIG_PRODUCTOS[producto].medidas.map((m) => (
                  <div
                    key={m.key}
                    className={`absolute flex items-center gap-1 ${
                      m.position === "top" && "top-[-44px] left-1/2 -translate-x-1/2 flex-col"
                    } ${
                      m.position === "left" && "left-[-110px] top-1/2 -translate-y-1/2 flex-row"
                    } ${
                      m.position === "bottom" && "bottom-[8px] left-70 -translate-x-1/2 flex-col-reverse"
                    } ${
                      m.position === "right" && "right-[-80px] top-[-10px] -translate-y-1/2 flex-row-reverse"
                    } ${
                      m.position === "right-top" && "right-[-130px] top-[56px] flex-row-reverse"
                    } ${
                      m.position === "left-bottom" && "left-[-80px] top-[-20px] flex-row"
                    } ${
                      m.position === "top-inside" && "top-[10px] right-[-110px] -translate-x-1/2 flex-col"
                    }`}
                  >
                    <label className="text-[13px] font-medium text-gray-700 whitespace-nowrap">
                      {m.label}
                    </label>
                    <input
                      type="number"
                      value={medidas[m.key]}
                      onChange={(e) => setMedida(m.key, e.target.value)}
                      className="w-18 h-5 text-xs text-center border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-400 text-center mt-20">
                Selecciona un producto
              </p>
            )}
          </div>
        </div>
      </div>
    </Dashboard>
  );
}