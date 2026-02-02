export enum EditorType {
  STANDARD = 'standard',
  CALENDAR = 'calendar',
  POLAROID = 'polaroid'
}

export interface ImageTransformation {
  scale: number;
  rotation: number;
  mirrorX: boolean;
  mirrorY: boolean;
  posX: number;
  posY: number;
}

export interface ImageEffects {
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
}

export interface CanvasStyle {
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface CustomizacionImage {
  id: number;
  s3Key: string;
  transformations: ImageTransformation;
  effects: ImageEffects;
  selectedFilter: string;
  canvasStyle: CanvasStyle;
  copies: number;
}

export interface CustomizacionData {
  images: CustomizacionImage[];
  canvasWidth: number;
  canvasHeight: number;
  canvasOrientation?: string;
  [key: string]: any;  // Para permitir datos específicos del editor
}

export interface CustomizacionTemporal {
  id?: number;
  usuario_id: number;
  cart_item_id: string;
  instance_index: number;
  editor_type: EditorType;
  datos: CustomizacionData;
  completed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class CustomizacionTemporalEntity implements CustomizacionTemporal {
  public id?: number;
  public usuario_id: number;
  public cart_item_id: string;
  public instance_index: number;
  public editor_type: EditorType;
  public datos: CustomizacionData;
  public completed: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(
    usuario_id: number,
    cart_item_id: string,
    instance_index: number,
    editor_type: EditorType,
    datos: CustomizacionData,
    completed: boolean = false,
    id?: number,
    created_at?: Date,
    updated_at?: Date
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.cart_item_id = cart_item_id;
    this.instance_index = instance_index;
    this.editor_type = editor_type;
    this.datos = datos;
    this.completed = completed;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  static create(
    usuario_id: number,
    cart_item_id: string,
    instance_index: number,
    editor_type: EditorType,
    datos: CustomizacionData,
    completed: boolean = false
  ): CustomizacionTemporalEntity {
    return new CustomizacionTemporalEntity(
      usuario_id,
      cart_item_id,
      instance_index,
      editor_type,
      datos,
      completed,
      undefined
    );
  }
}
