export interface Foto {
  id?: number;
  usuario_id: number;
  pedido_id?: number;  // Cambiado a opcional
  item_pedido_id: number;
  nombre_archivo: string;
  ruta_almacenamiento: string;
  tamaño_archivo: number;
  fecha_subida?: Date;
  procesada?: boolean;
  ancho_foto?: number;  // Ancho heredado del paquete
  alto_foto?: number;   // Alto heredado del paquete
  resolucion_foto?: number; // Resolución heredada del paquete
}

export class FotoEntity implements Foto {
  public id?: number;
  public usuario_id: number;
  public pedido_id?: number;  // Cambiado a opcional
  public item_pedido_id: number;
  public nombre_archivo: string;
  public ruta_almacenamiento: string;
  public tamaño_archivo: number;
  public fecha_subida: Date;
  public procesada: boolean;
  public ancho_foto?: number;  // Ancho heredado del paquete
  public alto_foto?: number;   // Alto heredado del paquete
  public resolucion_foto?: number; // Resolución heredada del paquete

  constructor(
    usuario_id: number,
    item_pedido_id: number,
    nombre_archivo: string,
    ruta_almacenamiento: string,
    tamaño_archivo: number,
    pedido_id?: number,  // Parámetro opcional
    ancho_foto?: number,
    alto_foto?: number,
    resolucion_foto?: number,
    id?: number
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.pedido_id = pedido_id;
    this.item_pedido_id = item_pedido_id;
    this.nombre_archivo = nombre_archivo;
    this.ruta_almacenamiento = ruta_almacenamiento;
    this.tamaño_archivo = tamaño_archivo;
    this.fecha_subida = new Date();
    this.procesada = false;
    this.ancho_foto = ancho_foto;
    this.alto_foto = alto_foto;
    this.resolucion_foto = resolucion_foto;
  }
}
