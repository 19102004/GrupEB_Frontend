export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol?: string;
  acceso_total?: boolean;
}

export interface LoginResponse {
  usuario: Usuario;
}

export interface LoginRequest {
  codigo: string;
}

export interface AuthContextType {
  user: Usuario | null;
  login: (codigo: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}