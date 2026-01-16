import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/grupeblanco.png";
import bolsas from "../assets/bolsas.png";

export default function Login() {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (codigo.length < 4 || codigo.length > 5) {
      setError("El código debe tener entre 4 y 5 dígitos");
      return;
    }

    setError("");
    navigate("/home"); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* IZQUIERDA */}
        <div className="hidden md:flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            BIENVENIDO
          </h1>
          <img src={bolsas} alt="Bolsas" className="max-w-sm w-full" />
        </div>

        {/* DERECHA */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-slate-900/80 backdrop-blur rounded-2xl shadow-2xl p-8 border border-slate-700">

            <img src={logo} alt="Grupo EB" className="w-28 mx-auto mb-4" />

            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Inicio de sesión
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* CÓDIGO */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Código
                </label>
                <input
                  type="password"
                  value={codigo}
                  maxLength={5}
                  inputMode="numeric"
                  placeholder="4 o 5 dígitos"
                  onChange={(e) =>
                    setCodigo(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
              >
                Entrar
              </button>
            </form>

            <p className="text-xs text-slate-500 text-center mt-6">
              Acceso restringido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
