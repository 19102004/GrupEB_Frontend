// Tipos para el usuario
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

// Tipo para la respuesta del login
export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

// Tipo para la petición de login
export interface LoginRequest {
  codigo: string;
}

// Tipo para la petición de registro
export interface RegisterRequest {
  nombre: string;
  apellido: string;
  correo: string;
  codigo: string;
}

// Tipo para el contexto de autenticación
export interface AuthContextType {
  usuario: Usuario | null;
  token: null;
  isAuthenticated: boolean;
  login: (codigo: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}