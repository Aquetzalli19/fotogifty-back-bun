import { CustomizacionTemporal, CustomizacionData, EditorType } from '../entities/customizacion-temporal.entity';

export interface CustomizacionTemporalRepositoryPort {
  findByUsuarioId(usuarioId: number): Promise<CustomizacionTemporal[]>;
  findByCartItemId(usuarioId: number, cartItemId: string, instanceIndex: number): Promise<CustomizacionTemporal | null>;
  save(customizacion: CustomizacionTemporal): Promise<CustomizacionTemporal>;
  update(
    usuarioId: number,
    cartItemId: string,
    instanceIndex: number,
    datos: CustomizacionData,
    editorType?: EditorType,
    completed?: boolean
  ): Promise<CustomizacionTemporal | null>;
  delete(usuarioId: number, cartItemId: string, instanceIndex: number): Promise<boolean>;
  deleteAllByUsuarioId(usuarioId: number): Promise<number>;
  deleteOlderThan(days: number): Promise<number>;
  findMaxInstanceIndex(usuarioId: number, cartItemId: string): Promise<number>;
  createClone(
    usuarioId: number,
    cartItemId: string,
    targetInstanceIndex: number,
    datos: CustomizacionData,
    editorType: EditorType,
    completed: boolean
  ): Promise<CustomizacionTemporal>;
}
