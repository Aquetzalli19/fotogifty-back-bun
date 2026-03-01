import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '@infrastructure/database/prisma.client';
import { CustomizacionTemporal, CustomizacionTemporalEntity, CustomizacionData, EditorType } from '@domain/entities/customizacion-temporal.entity';
import { CustomizacionTemporalRepositoryPort } from '@domain/ports/customizacion-temporal.repository.port';

export class PrismaCustomizacionTemporalRepository implements CustomizacionTemporalRepositoryPort {
  async findByUsuarioId(usuarioId: number): Promise<CustomizacionTemporal[]> {
    const customizaciones = await prisma.customizaciones_temporales.findMany({
      where: { usuario_id: usuarioId },
      orderBy: [
        { cart_item_id: 'asc' },
        { instance_index: 'asc' }
      ]
    });

    return customizaciones.map(c => this.toDomain(c));
  }

  async findByCartItemId(usuarioId: number, cartItemId: string, instanceIndex: number): Promise<CustomizacionTemporal | null> {
    const customizacion = await prisma.customizaciones_temporales.findUnique({
      where: {
        usuario_id_cart_item_id_instance_index: {
          usuario_id: usuarioId,
          cart_item_id: cartItemId,
          instance_index: instanceIndex
        }
      }
    });

    return customizacion ? this.toDomain(customizacion) : null;
  }

  async save(customizacion: CustomizacionTemporal): Promise<CustomizacionTemporal> {
    const created = await prisma.customizaciones_temporales.upsert({
      where: {
        usuario_id_cart_item_id_instance_index: {
          usuario_id: customizacion.usuario_id,
          cart_item_id: customizacion.cart_item_id,
          instance_index: customizacion.instance_index
        }
      },
      update: this.toPrisma(customizacion),
      create: {
        usuario_id: customizacion.usuario_id,
        cart_item_id: customizacion.cart_item_id,
        instance_index: customizacion.instance_index,
        ...this.toPrisma(customizacion)
      }
    });

    return this.toDomain(created);
  }

  async update(
    usuarioId: number,
    cartItemId: string,
    instanceIndex: number,
    datos: CustomizacionData,
    editorType?: EditorType,
    completed?: boolean
  ): Promise<CustomizacionTemporal | null> {
    try {
      const updateData: any = {
        datos: datos as any,
        updated_at: new Date()
      };

      if (editorType !== undefined) {
        updateData.editor_type = editorType;
      }

      if (completed !== undefined) {
        updateData.completed = completed;
      }

      const updated = await prisma.customizaciones_temporales.update({
        where: {
          usuario_id_cart_item_id_instance_index: {
            usuario_id: usuarioId,
            cart_item_id: cartItemId,
            instance_index: instanceIndex
          }
        },
        data: updateData
      });

      return this.toDomain(updated);
    } catch (error) {
      console.error('Error updating customizacion temporal:', error);
      return null;
    }
  }

  async delete(usuarioId: number, cartItemId: string, instanceIndex: number): Promise<boolean> {
    try {
      await prisma.customizaciones_temporales.delete({
        where: {
          usuario_id_cart_item_id_instance_index: {
            usuario_id: usuarioId,
            cart_item_id: cartItemId,
            instance_index: instanceIndex
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Error deleting customizacion temporal:', error);
      return false;
    }
  }

  async deleteAllByUsuarioId(usuarioId: number): Promise<number> {
    const result = await prisma.customizaciones_temporales.deleteMany({
      where: { usuario_id: usuarioId }
    });

    return result.count;
  }

  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.customizaciones_temporales.deleteMany({
      where: {
        updated_at: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }

  async findMaxInstanceIndex(usuarioId: number, cartItemId: string): Promise<number> {
    const result = await prisma.customizaciones_temporales.aggregate({
      _max: { instance_index: true },
      where: { usuario_id: usuarioId, cart_item_id: cartItemId }
    });
    return Math.max(result._max.instance_index ?? 0, 0);
  }

  async createClone(
    usuarioId: number,
    cartItemId: string,
    targetInstanceIndex: number,
    datos: CustomizacionData,
    editorType: EditorType,
    completed: boolean
  ): Promise<CustomizacionTemporal> {
    try {
      const created = await prisma.customizaciones_temporales.create({
        data: {
          usuario_id: usuarioId,
          cart_item_id: cartItemId,
          instance_index: targetInstanceIndex,
          editor_type: editorType,
          datos: datos as any,
          completed
        }
      });
      return this.toDomain(created);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('DUPLICATE_INSTANCE_INDEX');
      }
      throw error;
    }
  }

  private toDomain(prismaCustomizacion: any): CustomizacionTemporal {
    return new CustomizacionTemporalEntity(
      prismaCustomizacion.usuario_id,
      prismaCustomizacion.cart_item_id,
      prismaCustomizacion.instance_index,
      prismaCustomizacion.editor_type as EditorType,
      prismaCustomizacion.datos,
      prismaCustomizacion.completed,
      prismaCustomizacion.id,
      prismaCustomizacion.created_at,
      prismaCustomizacion.updated_at
    );
  }

  private toPrisma(customizacion: CustomizacionTemporal): any {
    return {
      editor_type: customizacion.editor_type,
      datos: customizacion.datos as any,
      completed: customizacion.completed
    };
  }
}
