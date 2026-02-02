export interface LandingSection {
  id?: number;
  section_key: string;
  titulo?: string;
  subtitulo?: string;
  descripcion?: string;
  texto_primario?: string;
  texto_secundario?: string;
  color_primario?: string;
  color_secundario?: string;
  color_gradiente_inicio?: string;
  color_gradiente_medio?: string;
  color_gradiente_fin?: string;
  imagen_principal_url?: string;
  imagen_fondo_url?: string;
  boton_texto?: string;
  boton_color?: string;
  boton_enlace?: string;
  configuracion_extra?: Record<string, any>;
  orden: number;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class LandingSectionEntity implements LandingSection {
  public id?: number;
  public section_key: string;
  public titulo?: string;
  public subtitulo?: string;
  public descripcion?: string;
  public texto_primario?: string;
  public texto_secundario?: string;
  public color_primario?: string;
  public color_secundario?: string;
  public color_gradiente_inicio?: string;
  public color_gradiente_medio?: string;
  public color_gradiente_fin?: string;
  public imagen_principal_url?: string;
  public imagen_fondo_url?: string;
  public boton_texto?: string;
  public boton_color?: string;
  public boton_enlace?: string;
  public configuracion_extra?: Record<string, any>;
  public orden: number;
  public activo: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(
    section_key: string,
    orden: number = 0,
    activo: boolean = true,
    titulo?: string,
    subtitulo?: string,
    descripcion?: string,
    texto_primario?: string,
    texto_secundario?: string,
    color_primario?: string,
    color_secundario?: string,
    color_gradiente_inicio?: string,
    color_gradiente_medio?: string,
    color_gradiente_fin?: string,
    imagen_principal_url?: string,
    imagen_fondo_url?: string,
    boton_texto?: string,
    boton_color?: string,
    boton_enlace?: string,
    configuracion_extra?: Record<string, any>,
    id?: number,
    created_at?: Date,
    updated_at?: Date
  ) {
    this.id = id;
    this.section_key = section_key;
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.descripcion = descripcion;
    this.texto_primario = texto_primario;
    this.texto_secundario = texto_secundario;
    this.color_primario = color_primario;
    this.color_secundario = color_secundario;
    this.color_gradiente_inicio = color_gradiente_inicio;
    this.color_gradiente_medio = color_gradiente_medio;
    this.color_gradiente_fin = color_gradiente_fin;
    this.imagen_principal_url = imagen_principal_url;
    this.imagen_fondo_url = imagen_fondo_url;
    this.boton_texto = boton_texto;
    this.boton_color = boton_color;
    this.boton_enlace = boton_enlace;
    this.configuracion_extra = configuracion_extra;
    this.orden = orden;
    this.activo = activo;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  static create(
    section_key: string,
    orden: number = 0,
    activo: boolean = true,
    titulo?: string,
    subtitulo?: string,
    descripcion?: string,
    texto_primario?: string,
    texto_secundario?: string,
    color_primario?: string,
    color_secundario?: string,
    color_gradiente_inicio?: string,
    color_gradiente_medio?: string,
    color_gradiente_fin?: string,
    imagen_principal_url?: string,
    imagen_fondo_url?: string,
    boton_texto?: string,
    boton_color?: string,
    boton_enlace?: string,
    configuracion_extra?: Record<string, any>
  ): LandingSectionEntity {
    return new LandingSectionEntity(
      section_key,
      orden,
      activo,
      titulo,
      subtitulo,
      descripcion,
      texto_primario,
      texto_secundario,
      color_primario,
      color_secundario,
      color_gradiente_inicio,
      color_gradiente_medio,
      color_gradiente_fin,
      imagen_principal_url,
      imagen_fondo_url,
      boton_texto,
      boton_color,
      boton_enlace,
      configuracion_extra,
      undefined
    );
  }
}
