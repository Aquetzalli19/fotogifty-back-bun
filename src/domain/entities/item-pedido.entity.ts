export interface ItemPedido {
  id?: number;
  pedido_id: number;
  tipo_item: string;
  paquete_predefinido_id?: number;
  cantidad_fotos: number;
  precio_unitario: number;
  subtotal: number;
  cantidad?: number;
  categoria_paquete?: string;
  nombre_paquete?: string;
  num_fotos_requeridas?: number;
  paquete_id?: number;
}

export class ItemPedidoEntity implements ItemPedido {
  public id?: number;
  public pedido_id: number;
  public tipo_item: string;
  public paquete_predefinido_id?: number;
  public cantidad_fotos: number;
  public precio_unitario: number;
  public subtotal: number;
  public cantidad?: number = 1;
  public categoria_paquete?: string;
  public nombre_paquete?: string;
  public num_fotos_requeridas?: number;
  public paquete_id?: number;

  constructor(
    pedido_id: number,
    tipo_item: string,
    cantidad_fotos: number,
    precio_unitario: number,
    subtotal: number,
    paquete_predefinido_id?: number,
    cantidad?: number,
    categoria_paquete?: string,
    nombre_paquete?: string,
    num_fotos_requeridas?: number,
    paquete_id?: number,
    id?: number
  ) {
    this.id = id;
    this.pedido_id = pedido_id;
    this.tipo_item = tipo_item;
    this.paquete_predefinido_id = paquete_predefinido_id;
    this.cantidad_fotos = cantidad_fotos;
    this.precio_unitario = precio_unitario;
    this.subtotal = subtotal;
    this.cantidad = cantidad;
    this.categoria_paquete = categoria_paquete;
    this.nombre_paquete = nombre_paquete;
    this.num_fotos_requeridas = num_fotos_requeridas;
    this.paquete_id = paquete_id;
  }

  static create(
    pedido_id: number,
    tipo_item: string,
    cantidad_fotos: number,
    precio_unitario: number,
    subtotal: number,
    paquete_predefinido_id?: number,
    cantidad?: number,
    categoria_paquete?: string,
    nombre_paquete?: string,
    num_fotos_requeridas?: number,
    paquete_id?: number
  ): ItemPedidoEntity {
    return new ItemPedidoEntity(
      pedido_id,
      tipo_item,
      cantidad_fotos,
      precio_unitario,
      subtotal,
      paquete_predefinido_id,
      cantidad,
      categoria_paquete,
      nombre_paquete,
      num_fotos_requeridas,
      paquete_id
    );
  }
}