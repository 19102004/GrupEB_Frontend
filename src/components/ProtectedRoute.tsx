

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log("🛡️ ProtectedRoute - loading:", loading, "user:", user);

  // Mientras carga, mostrar spinner
  if (loading) {
    console.log("⏳ Mostrando spinner de carga...");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado (user es null), redirigir al login
  if (!user) {
    console.log("❌ Usuario no autenticado, redirigiendo a /");
    return <Navigate to="/" replace />;
  }

  // Si está autenticado, mostrar el contenido
  console.log("✅ Usuario autenticado, mostrando contenido protegido");
  return <>{children}</>;
}
