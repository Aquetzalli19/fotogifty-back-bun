export const TIPOS_SECCION_VALIDOS = [
  'galeria',
  'info_producto',
  'especificaciones',
  'selector_cantidad',
  'botones_accion',
  'tabs',
  'caracteristicas',
  'descripcion_larga',
  'productos_relacionados',
  'resenas',
  'preguntas_frecuentes',
  'envio_info',
  'garantia',
] as const;

export type TipoSeccion = typeof TIPOS_SECCION_VALIDOS[number];

export interface SeccionPaginaProducto {
  id?: number;
  config_id: number;
  tipo: string;
  titulo?: string | null;
  activo: boolean;
  orden: number;
  estilo?: Record<string, any> | null;
  configuracion?: Record<string, any> | null;
  created_at?: Date;
  updated_at?: Date;
  pestanas?: any[];
  caracteristicas?: any[];
}

export class SeccionPaginaProductoEntity implements SeccionPaginaProducto {
  public id?: number;
  public config_id: number;
  public tipo: string;
  public titulo?: string | null;
  public activo: boolean;
  public orden: number;
  public estilo?: Record<string, any> | null;
  public configuracion?: Record<string, any> | null;
  public created_at?: Date;
  public updated_at?: Date;
  public pestanas?: any[];
  public caracteristicas?: any[];

  constructor(
    config_id: number,
    tipo: string,
    orden: number = 0,
    activo: boolean = true,
    titulo?: string | null,
    estilo?: Record<string, any> | null,
    configuracion?: Record<string, any> | null,
    id?: number,
    created_at?: Date,
    updated_at?: Date,
    pestanas?: any[],
    caracteristicas?: any[]
  ) {
    this.config_id = config_id;
    this.tipo = tipo;
    this.orden = orden;
    this.activo = activo;
    this.titulo = titulo;
    this.estilo = estilo;
    this.configuracion = configuracion;
    this.id = id;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.pestanas = pestanas;
    this.caracteristicas = caracteristicas;
  }

  static create(
    config_id: number,
    tipo: string,
    orden: number = 0,
    activo: boolean = true,
    titulo?: string | null,
    estilo?: Record<string, any> | null,
    configuracion?: Record<string, any> | null
  ): SeccionPaginaProductoEntity {
    return new SeccionPaginaProductoEntity(
      config_id,
      tipo,
      orden,
      activo,
      titulo,
      estilo,
      configuracion
    );
  }
}
