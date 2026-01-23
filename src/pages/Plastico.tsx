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

const MERMA_PRODUCCION: Record<number, number> = {
  30: 20,
  50: 10,
  75: 8,
  100: 7,
  200: 5,
  300: 4,
  500: 3,
  1000: 1,
};


const COSTOS_PRODUCCION: Record<number, number> = {
  30: 250,
  50: 200,
  75: 180,
  100: 150,
  200: 120,
  300: 95,
  500: 90,
  1000: 90,
};


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

  // Calcular bolsas por kilo automáticamente
  useEffect(() => {
    if (!producto || !calibre || !material) {
      setBolsasPorKilo("");
      return;
    }

    // Solo calcular para productos con configuración
    if (!CONFIG_PRODUCTOS[producto]) {
      setBolsasPorKilo("");
      return;
    }

    const altura = parseFloat(medidas.altura) || 0;
    const ancho = parseFloat(medidas.ancho) || 0;
    const fuelleFondo = parseFloat(medidas.fuelleFondo) || 0;
    const refuerzo = parseFloat(medidas.refuerzo) || 0;
    const fuelleLateral1 = parseFloat(medidas.fuelleLateral1) || 0;
    const fuelleLateral2 = parseFloat(medidas.fuelleLateral2) || 0;
    const calibreNum = parseFloat(calibre) || 0;

    // Verificar que tengamos al menos altura y ancho
    if (altura === 0 || ancho === 0 || calibreNum === 0) {
      setBolsasPorKilo("");
      return;
    }

    // Factor cambia según el material
    const factor = material === "Baja densidad" ? 0.50 : 0.47;

    // Suma vertical: Altura + Fuelle Fondo + Refuerzo
    const sumaVertical = altura + fuelleFondo + refuerzo;

    // Suma horizontal: Ancho + Fuelle Lateral 1 + Fuelle Lateral 2
    const sumaHorizontal = ancho + fuelleLateral1 + fuelleLateral2;

    // Fórmula: 1000 / ((((suma vertical) / 100) * ((suma horizontal) / 100) * Calibre) * Factor)
    const resultado = 1000 / ((((sumaVertical) / 100) * ((sumaHorizontal) / 100) * calibreNum) * factor);

    setBolsasPorKilo(resultado.toFixed(3));
  }, [medidas, calibre, producto, material]);

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

  // Función para redondear a centenas superiores
  const redondearACentenas = (valor: number) => {
    return Math.ceil(valor / 100) * 100;
  };

  // Calcular tabla de amortización
  const kilosReferencia = [30, 50, 75, 100, 200, 300, 500, 1000];
  const calcularBolsasPorKilos = (kilos: number) => {
    if (!bolsasPorKilo) return "--";
    const bolsas = parseFloat(bolsasPorKilo) * kilos;
    return redondearACentenas(bolsas).toLocaleString();
  };

  const calcularBolsasConMerma = (kilos: number) => {
  if (!bolsasPorKilo) return "--";

  const bpk = parseFloat(bolsasPorKilo);
  const bolsasBase = redondearACentenas(bpk * kilos);

  const porcentajeMerma = MERMA_PRODUCCION[kilos] || 0;
  const bolsasMerma = Math.ceil(bolsasBase * (porcentajeMerma / 100));

  const total = bolsasBase + bolsasMerma;

  return {
    porcentajeMerma,
    bolsasMerma,
    total,
  };
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
                        if (p === "Otro"){
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

     {/* TABLA DE AMORTIZACIÓN */}
<div className="mt-8 bg-white p-6 rounded-xl shadow">
  <h2 className="text-lg font-bold mb-4">Tabla de producción por kilogramos</h2>

  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-blue-600 text-white">
          {kilosReferencia.map((kilos) => (
            <th
              key={kilos}
              className="px-4 py-3 text-center border border-blue-700"
            >
              {kilos}k
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {/* FILA: BOLSAS TOTALES */}
        <tr className="bg-gray-50">
          {kilosReferencia.map((kilos) => (
            <td
              key={kilos}
              className="px-4 py-3 text-center border border-gray-300 font-medium"
            >
              {calcularBolsasPorKilos(kilos)}
            </td>
          ))}
        </tr>

       {/* FILA: PRECIO POR UNIDAD (C/U) */}
<tr className="bg-white">
  {kilosReferencia.map((kilos) => {
    const costo = COSTOS_PRODUCCION[kilos];
    const bpk = parseFloat(bolsasPorKilo);

    if (!costo || !bpk) {
      return (
        <td
          key={kilos}
          className="px-4 py-3 text-center border border-gray-300 text-gray-400"
        >
          --
        </td>
      );
    }

    const precioUnitario = costo / bpk;

    return (
      <td
        key={kilos}
        className="px-4 py-3 text-center border border-gray-300 text-green-600 font-semibold"
      >
        ${precioUnitario.toFixed(2)}
      </td>
    );
  })}
</tr>

      </tbody>
    </table>

    {/* MERMA */}
<div className="mt-4 border-t pt-4">
  <h3 className="text-sm font-semibold mb-2 text-gray-700">
    Merma y total de bolsas
  </h3>

  <div className="grid grid-cols-8 gap-2 text-center text-sm">
    {kilosReferencia.map((kilos) => {
      const data = calcularBolsasConMerma(kilos);

      if (data === "--") {
        return (
          <div key={kilos} className="text-gray-400">
            --
          </div>
        );
      }

      return (
        <div
          key={kilos}
          className="bg-gray-50 rounded-lg p-2 border"
        >
          <p className="text-xs text-gray-500">
            Merma {data.porcentajeMerma}%
          </p>
          <p className="text-xs text-orange-600 font-medium">
            +{data.bolsasMerma.toLocaleString()}
          </p>
          <p className="text-sm font-semibold text-green-700">
            {data.total.toLocaleString()}
          </p>
        </div>
      );
    })}
  </div>
</div>

  </div>
</div>

    </Dashboard>
  );
}