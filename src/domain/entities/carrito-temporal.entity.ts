export interface CartItemData {
  id: string;
  packageId: number;
  packageName: string;
  categoryName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  dimensions?: {
    width: number;
    height: number;
    resolution: number;
  };
}

export interface CarritoTemporalData {
  items: CartItemData[];
  lastModified?: number;
}

export interface CarritoTemporal {
  id?: number;
  usuario_id: number;
  datos: CarritoTemporalData;
  created_at?: Date;
  updated_at?: Date;
}

export class CarritoTemporalEntity implements CarritoTemporal {
  public id?: number;
  public usuario_id: number;
  public datos: CarritoTemporalData;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(
    usuario_id: number,
    datos: CarritoTemporalData,
    id?: number,
    created_at?: Date,
    updated_at?: Date
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.datos = datos;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  static create(
    usuario_id: number,
    datos: CarritoTemporalData
  ): CarritoTemporalEntity {
    return new CarritoTemporalEntity(
      usuario_id,
      {
        ...datos,
        lastModified: Date.now()
      },
      undefined
    );
  }
}
