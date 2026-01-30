import { useState, useEffect, useRef } from "react";

export type MedidaKey =
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

export const CONFIG_PRODUCTOS: Record<string, ConfigProducto> = {
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
  "Bobina": {
    imagen: "../src/assets/bobina.png",
    medidas: [
      { key: "altura", label: "Altura", position: "left" },
      { key: "ancho", label: "Ancho", position: "top" },
    ],
  },
  "Rollo perforado": {
    imagen: "../src/assets/rolloPerf.png",
    medidas: [
      { key: "altura", label: "Altura", position: "left" },
      { key: "ancho", label: "Ancho", position: "top" },
    ],
  },
  "Faldón": {
    imagen: "../src/assets/faldon.png",
    medidas: [
      { key: "altura", label: "Altura", position: "left" },
      { key: "ancho", label: "Ancho", position: "top" },
    ],
  },
  "Lámina": {
    imagen: "../src/assets/lamina.png",
    medidas: [
      { key: "altura", label: "Altura", position: "left" },
      { key: "ancho", label: "Ancho", position: "top" },
    ],
  },
};

export const TIPOS_PRODUCTOS = [
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

export const MATERIALES = ["Alta densidad", "Baja densidad", "BOPP", "Otro"];

export const CALIBRES = Array.from({ length: 11 }, (_, i) =>
  (150 + i * 25).toString()
);

export const FORMATO_MEDIDAS = {
  verticales: ["altura", "fuelleFondo", "refuerzo", "solapa"] as MedidaKey[],
  horizontales: ["ancho", "fuelleLateral1", "fuelleLateral2"] as MedidaKey[],
};

export interface DatosProducto {
  tipoProducto: string;
  material: string;
  calibre: string;
  medidas: Record<MedidaKey, string>;
  medidasFormateadas: string;
  nombreCompleto: string;
}

interface SelectorProductoProps {
  onProductoChange: (datos: DatosProducto) => void;
  mostrarFigura?: boolean;
}

export default function SelectorProducto({
  onProductoChange,
  mostrarFigura = true,
}: SelectorProductoProps) {
  const [tipoProducto, setTipoProducto] = useState("");
  const [material, setMaterial] = useState("");
  const [calibre, setCalibre] = useState("");
  const [medidas, setMedidas] = useState<Record<MedidaKey, string>>({
    altura: "",
    ancho: "",
    fuelleFondo: "",
    fuelleLateral1: "",
    fuelleLateral2: "",
    refuerzo: "",
    solapa: "",
  });

  const [productoOtro, setProductoOtro] = useState(false);
  const [materialOtro, setMaterialOtro] = useState(false);

  const [mostrarDropdownTipo, setMostrarDropdownTipo] = useState(false);
  const [mostrarDropdownMaterial, setMostrarDropdownMaterial] = useState(false);
  const [mostrarDropdownCalibre, setMostrarDropdownCalibre] = useState(false);

  const tipoRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<HTMLDivElement>(null);
  const calibreRef = useRef<HTMLDivElement>(null);

  // Construir medidas formateadas
  const construirMedidasFormateadas = () => {
    const verticales = FORMATO_MEDIDAS.verticales
      .map((k) => medidas[k])
      .filter((v) => v);

    const horizontales = FORMATO_MEDIDAS.horizontales
      .map((k) => medidas[k])
      .filter((v) => v);

    if (!verticales.length && !horizontales.length) return "";

    if (!horizontales.length) return verticales.join("+");
    if (!verticales.length) return horizontales.join("+");

    return `${verticales.join("+")}x${horizontales.join("+")}`;
  };

  // Construir nombre completo del producto
  const construirNombreCompleto = () => {
    if (!tipoProducto || !material) return "";
    
    const medidasFormateadas = construirMedidasFormateadas();
    if (!medidasFormateadas) return "";
    
    return `${tipoProducto} ${medidasFormateadas} ${material.toLowerCase()}`;
  };

  // Notificar cambios al componente padre
  useEffect(() => {
    const nombreCompleto = construirNombreCompleto();
    const medidasFormateadas = construirMedidasFormateadas();

    onProductoChange({
      tipoProducto,
      material,
      calibre,
      medidas: { ...medidas },
      medidasFormateadas,
      nombreCompleto,
    });
  }, [tipoProducto, material, calibre, medidas]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !tipoRef.current?.contains(event.target as Node) &&
        !materialRef.current?.contains(event.target as Node) &&
        !calibreRef.current?.contains(event.target as Node)
      ) {
        setMostrarDropdownTipo(false);
        setMostrarDropdownMaterial(false);
        setMostrarDropdownCalibre(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const setMedida = (key: MedidaKey, value: string) => {
    setMedidas((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`grid ${mostrarFigura ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
      {/* Columna izquierda: Formulario */}
      <div className="space-y-4">
        {/* Tipo de Producto */}
        <div ref={tipoRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Producto
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tipoProducto}
              readOnly={!productoOtro}
              placeholder={productoOtro ? "Escribe el producto" : "Selecciona tipo"}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
              onClick={() => setMostrarDropdownTipo(!mostrarDropdownTipo)}
              onChange={(e) => productoOtro && setTipoProducto(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setMostrarDropdownTipo(!mostrarDropdownTipo)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${mostrarDropdownTipo ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {mostrarDropdownTipo && (
            <ul className="absolute w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg shadow-lg z-20">
              {TIPOS_PRODUCTOS.map((tipo) => (
                <li
                  key={tipo}
                  onClick={() => {
                    if (tipo === "Otro") {
                      setTipoProducto("");
                      setProductoOtro(true);
                    } else {
                      setTipoProducto(tipo);
                      setProductoOtro(false);
                    }
                    setMostrarDropdownTipo(false);
                    // Resetear medidas al cambiar tipo
                    setMedidas({
                      altura: "",
                      ancho: "",
                      fuelleFondo: "",
                      fuelleLateral1: "",
                      fuelleLateral2: "",
                      refuerzo: "",
                      solapa: "",
                    });
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                >
                  {tipo}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Material */}
        <div ref={materialRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Material
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={material}
              readOnly={!materialOtro}
              placeholder={materialOtro ? "Escribe el material" : "Selecciona material"}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
              onClick={() => setMostrarDropdownMaterial(!mostrarDropdownMaterial)}
              onChange={(e) => materialOtro && setMaterial(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setMostrarDropdownMaterial(!mostrarDropdownMaterial)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${mostrarDropdownMaterial ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {mostrarDropdownMaterial && (
            <ul className="absolute w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg shadow-lg z-20">
              {MATERIALES.map((mat) => (
                <li
                  key={mat}
                  onClick={() => {
                    if (mat === "Otro") {
                      setMaterialOtro(true);
                      setMaterial("");
                    } else {
                      setMaterial(mat);
                      setMaterialOtro(false);
                    }
                    setMostrarDropdownMaterial(false);
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                >
                  {mat}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Calibre */}
        <div ref={calibreRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calibre
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={calibre}
              readOnly
              placeholder="Selecciona calibre"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
              onClick={() => setMostrarDropdownCalibre(!mostrarDropdownCalibre)}
            />
            <button
              type="button"
              onClick={() => setMostrarDropdownCalibre(!mostrarDropdownCalibre)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <ul className="absolute w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg shadow-lg z-20">
              {CALIBRES.map((cal) => (
                <li
                  key={cal}
                  onClick={() => {
                    setCalibre(cal);
                    setMostrarDropdownCalibre(false);
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                >
                  {cal}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Nombre generado automáticamente */}
        {construirNombreCompleto() && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Nombre del producto:
            </p>
            <p className="text-sm text-gray-900">{construirNombreCompleto()}</p>
          </div>
        )}

        {/* Medidas formateadas */}
        {construirMedidasFormateadas() && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medidas
            </label>
            <input
              value={construirMedidasFormateadas()}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium bg-gray-50"
            />
          </div>
        )}
      </div>

      {/* Columna derecha: Figura con medidas */}
      {mostrarFigura && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="relative w-full h-[400px] flex items-center justify-center">
            {tipoProducto && CONFIG_PRODUCTOS[tipoProducto] ? (
              <>
                <img
                  src={CONFIG_PRODUCTOS[tipoProducto].imagen}
                  alt={tipoProducto}
                  className="max-w-[200px] max-h-[300px] object-contain"
                />

                {CONFIG_PRODUCTOS[tipoProducto].medidas.map((m) => (
                  <div
                    key={m.key}
                    className={`absolute flex items-center gap-1 ${
                      m.position === "top" && "top-4 left-1/2 -translate-x-1/2 flex-col"
                    } ${
                      m.position === "left" && "left-4 top-1/2 -translate-y-1/2 flex-row"
                    } ${
                      m.position === "bottom" && "bottom-4 left-1/2 -translate-x-1/2 flex-col-reverse"
                    } ${
                      m.position === "right" && "right-4 top-1/2 -translate-y-1/2 flex-row-reverse"
                    } ${
                      m.position === "right-top" && "right-4 top-16 flex-row-reverse"
                    } ${
                      m.position === "left-bottom" && "left-4 bottom-16 flex-row"
                    } ${
                      m.position === "top-inside" && "top-16 right-4 flex-col"
                    }`}
                  >
                    <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                      {m.label}
                    </label>
                    <input
                      type="number"
                      value={medidas[m.key]}
                      onChange={(e) => setMedida(m.key, e.target.value)}
                      className="w-16 px-2 py-1 text-sm text-center border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-400 text-center">
                Selecciona un tipo de producto
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}