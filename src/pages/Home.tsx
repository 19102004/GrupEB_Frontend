import Dashboard from "../layouts/Sidebar";

export default function Home() {
  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-4">Inicio</h1>

      <p className="text-slate-400">
        Bienvenido al sistema. Selecciona una opción del menú lateral.
      </p>
    </Dashboard>
  );
}
