import { useState } from "react";
import Dashboard from "../layouts/Sidebar";

export default function Plastico() {
  const [alto, setAlto] = useState("");
  const [ancho, setAncho] = useState("");

  return (
    <Dashboard userName="Administrador">
        <h1 className="text-2xl font-bold mb-6">Dar de alta producto</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FORMULARIO */}
          <div className="bg-white p-6 rounded-xl shadow grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Producto */}
            <div>
              <label className="block text-sm font-semibold mb-1">Producto</label>
              <select className="w-full border rounded px-2 py-1">
                <option>Bolsa plana</option>
                <option>Bolsa troquelada</option>
                <option>Bolsa envíos</option>
                <option>Bolsa celofán</option>
                <option>Bolsa asa flexible</option>
                <option>Bobina</option>
                <option>Rollo perforado</option>
                <option>Faldón</option>
                <option>Lámina</option>
              </select>
            </div>

            {/* Material */}
            <div>
              <label className="block text-sm font-semibold mb-1">Material</label>
              <select className="w-full border rounded px-2 py-1">
                <option>Alta densidad</option>
                <option>Baja densidad</option>
                <option>BOPP</option>
                <option>Otro</option>
              </select>
            </div>

            {/* Calibre */}
            <div>
              <label className="block text-sm font-semibold mb-1">Calibre</label>
              <select className="w-full border rounded px-2 py-1">
                {Array.from({ length: 11 }, (_, i) => 150 + i * 25).map(
                  (v) => (
                    <option key={v}>{v}</option>
                  )
                )}
              </select>
            </div>

            {/* Bolsas por kilo */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Bolsas por kilo
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          {/* FIGURA DE LA BOLSA */}
          <div className="bg-white p-6 rounded-xl shadow flex justify-center items-center">
            <div className="relative">
              <input
                type="number"
                placeholder="Alto"
                value={alto}
                onChange={(e) => setAlto(e.target.value)}
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 text-center border rounded px-1 py-0.5 text-sm"
              />

              <input
                type="number"
                placeholder="Ancho"
                value={ancho}
                onChange={(e) => setAncho(e.target.value)}
                className="absolute top-1/2 -left-24 -translate-y-1/2 w-20 text-center border rounded px-1 py-0.5 text-sm"
              />

              <svg width="200" height="300">
                <rect
                  x="30"
                  y="20"
                  width="140"
                  height="260"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                />
                <line
                  x1="30"
                  y1="60"
                  x2="170"
                  y2="60"
                  stroke="black"
                  strokeDasharray="4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Dar de alta producto
          </button>

          <div className="text-lg font-semibold">
            Medida final:{" "}
            <span className="text-blue-600">
              {alto && ancho ? `${alto} x ${ancho}` : "--"}
            </span>
          </div>
        </div>
    </Dashboard>
  );
}
