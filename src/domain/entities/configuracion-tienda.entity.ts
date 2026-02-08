export interface ConfiguracionTienda {
  id?: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  pais: string;
  telefono: string;
  email?: string;
  latitud: number;
  longitud: number;
  horario_lunes_viernes?: string;
  horario_sabado?: string;
  horario_domingo?: string;
  descripcion?: string;
  instrucciones_llegada?: string;
  direccion_maps?: string;
  fecha_actualizacion?: Date;
  actualizado_por?: number;
}

export class ConfiguracionTiendaEntity implements ConfiguracionTienda {
  public id?: number;
  public nombre: string;
  public direccion: string;
  public ciudad: string;
  public estado: string;
  public codigo_postal: string;
  public pais: string;
  public telefono: string;
  public email?: string;
  public latitud: number;
  public longitud: number;
  public horario_lunes_viernes?: string;
  public horario_sabado?: string;
  public horario_domingo?: string;
  public descripcion?: string;
  public instrucciones_llegada?: string;
  public direccion_maps?: string;
  public fecha_actualizacion?: Date;
  public actualizado_por?: number;

  constructor(
    nombre: string,
    direccion: string,
    ciudad: string,
    estado: string,
    codigo_postal: string,
    pais: string,
    telefono: string,
    latitud: number,
    longitud: number,
    email?: string,
    horario_lunes_viernes?: string,
    horario_sabado?: string,
    horario_domingo?: string,
    descripcion?: string,
    instrucciones_llegada?: string,
    direccion_maps?: string,
    id?: number,
    fecha_actualizacion?: Date,
    actualizado_por?: number
  ) {
    this.id = id;
    this.nombre = nombre;
    this.direccion = direccion;
    this.ciudad = ciudad;
    this.estado = estado;
    this.codigo_postal = codigo_postal;
    this.pais = pais;
    this.telefono = telefono;
    this.email = email;
    this.latitud = latitud;
    this.longitud = longitud;
    this.horario_lunes_viernes = horario_lunes_viernes;
    this.horario_sabado = horario_sabado;
    this.horario_domingo = horario_domingo;
    this.descripcion = descripcion;
    this.instrucciones_llegada = instrucciones_llegada;
    this.direccion_maps = direccion_maps;
    this.fecha_actualizacion = fecha_actualizacion ?? new Date();
    this.actualizado_por = actualizado_por;
  }

  static create(
    nombre: string,
    direccion: string,
    ciudad: string,
    estado: string,
    codigo_postal: string,
    pais: string,
    telefono: string,
    latitud: number,
    longitud: number,
    email?: string,
    horario_lunes_viernes?: string,
    horario_sabado?: string,
    horario_domingo?: string,
    descripcion?: string,
    instrucciones_llegada?: string,
    direccion_maps?: string
  ): ConfiguracionTiendaEntity {
    return new ConfiguracionTiendaEntity(
      nombre,
      direccion,
      ciudad,
      estado,
      codigo_postal,
      pais,
      telefono,
      latitud,
      longitud,
      email,
      horario_lunes_viernes,
      horario_sabado,
      horario_domingo,
      descripcion,
      instrucciones_llegada,
      direccion_maps
    );
  }
}
