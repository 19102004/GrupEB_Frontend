export interface Rol {
  idroles: number;
  nombre: string;
  descripcion?: string;
  acceso_total: boolean;
}

export interface PrivilegiosPorRol {
  rol_id: number;
  rol_nombre: string;
  acceso_total: boolean;
  privilegios: number[];
}