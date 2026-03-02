export type AlcanceConfigPagina = 'global' | 'categoria' | 'producto';

export const VALID_ALCANCES: AlcanceConfigPagina[] = ['global', 'categoria', 'producto'];

export interface ConfiguracionPaginaProducto {
  id?: number;
  nombre: string;
  alcance: AlcanceConfigPagina;
  categoria_id?: number | null;
  producto_id?: number | null;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
  secciones?: any[];
}

export class ConfiguracionPaginaProductoEntity implements ConfiguracionPaginaProducto {
  public id?: number;
  public nombre: string;
  public alcance: AlcanceConfigPagina;
  public categoria_id?: number | null;
  public producto_id?: number | null;
  public activo: boolean;
  public created_at?: Date;
  public updated_at?: Date;
  public secciones?: any[];

  constructor(
    nombre: string,
    alcance: AlcanceConfigPagina = 'global',
    activo: boolean = true,
    categoria_id?: number | null,
    producto_id?: number | null,
    id?: number,
    created_at?: Date,
    updated_at?: Date,
    secciones?: any[]
  ) {
    this.nombre = nombre;
    this.alcance = alcance;
    this.activo = activo;
    this.categoria_id = categoria_id;
    this.producto_id = producto_id;
    this.id = id;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.secciones = secciones;
  }

  static create(
    nombre: string,
    alcance: AlcanceConfigPagina = 'global',
    activo: boolean = true,
    categoria_id?: number | null,
    producto_id?: number | null
  ): ConfiguracionPaginaProductoEntity {
    return new ConfiguracionPaginaProductoEntity(
      nombre,
      alcance,
      activo,
      categoria_id,
      producto_id
    );
  }
}
