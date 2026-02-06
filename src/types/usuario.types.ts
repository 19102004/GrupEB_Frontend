export interface Usuario {
  idusuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string; 
  codigo?: string;
  roles_idroles?: number;
  rol?: string;
  acceso_total?: boolean;
  created_at?: string;
  privilegios?: number[];
}

export interface CreateUsuarioRequest {
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string; 
  codigo: string;
  roles_idroles: number;
  privilegios?: number[];
}

export interface UpdateUsuarioRequest {
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string; 
  codigo?: string;
  roles_idroles: number;
  privilegios?: number[];
}