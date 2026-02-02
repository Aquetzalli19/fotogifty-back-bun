import prisma from '../database/prisma.client';
import { ConfiguracionTienda, ConfiguracionTiendaEntity } from '@domain/entities/configuracion-tienda.entity';
import { ConfiguracionTiendaRepositoryPort } from '@domain/ports/configuracion-tienda.repository.port';
import { Decimal } from '@prisma/client/runtime/library';

export class PrismaConfiguracionTiendaRepository implements ConfiguracionTiendaRepositoryPort {
  async obtener(): Promise<ConfiguracionTienda | null> {
    const config = await prisma.configuracion_tienda.findFirst({
      where: { id: 1 }
    });

    return config ? this.toDomain(config) : null;
  }

  async actualizar(configuracion: Partial<ConfiguracionTienda>, actualizadoPor?: number): Promise<ConfiguracionTienda> {
    // Construir el objeto de actualización
    const data: any = {};

    if (configuracion.nombre !== undefined) data.nombre = configuracion.nombre;
    if (configuracion.direccion !== undefined) data.direccion = configuracion.direccion;
    if (configuracion.ciudad !== undefined) data.ciudad = configuracion.ciudad;
    if (configuracion.estado !== undefined) data.estado = configuracion.estado;
    if (configuracion.codigo_postal !== undefined) data.codigo_postal = configuracion.codigo_postal;
    if (configuracion.pais !== undefined) data.pais = configuracion.pais;
    if (configuracion.telefono !== undefined) data.telefono = configuracion.telefono;
    if (configuracion.email !== undefined) data.email = configuracion.email;
    if (configuracion.latitud !== undefined) data.latitud = configuracion.latitud;
    if (configuracion.longitud !== undefined) data.longitud = configuracion.longitud;
    if (configuracion.horario_lunes_viernes !== undefined) data.horario_lunes_viernes = configuracion.horario_lunes_viernes;
    if (configuracion.horario_sabado !== undefined) data.horario_sabado = configuracion.horario_sabado;
    if (configuracion.horario_domingo !== undefined) data.horario_domingo = configuracion.horario_domingo;
    if (configuracion.descripcion !== undefined) data.descripcion = configuracion.descripcion;
    if (configuracion.instrucciones_llegada !== undefined) data.instrucciones_llegada = configuracion.instrucciones_llegada;
    if (actualizadoPor !== undefined) data.actualizado_por = actualizadoPor;

    const updated = await prisma.configuracion_tienda.update({
      where: { id: 1 },
      data
    });

    return this.toDomain(updated);
  }

  private toDomain(prismaConfig: any): ConfiguracionTienda {
    return new ConfiguracionTiendaEntity(
      prismaConfig.nombre,
      prismaConfig.direccion,
      prismaConfig.ciudad,
      prismaConfig.estado,
      prismaConfig.codigo_postal,
      prismaConfig.pais,
      prismaConfig.telefono,
      this.decimalToNumber(prismaConfig.latitud),
      this.decimalToNumber(prismaConfig.longitud),
      prismaConfig.email,
      prismaConfig.horario_lunes_viernes,
      prismaConfig.horario_sabado,
      prismaConfig.horario_domingo,
      prismaConfig.descripcion,
      prismaConfig.instrucciones_llegada,
      prismaConfig.id,
      prismaConfig.fecha_actualizacion,
      prismaConfig.actualizado_por
    );
  }

  private decimalToNumber(decimal: Decimal | number): number {
    if (typeof decimal === 'number') {
      return decimal;
    }
    return decimal.toNumber();
  }
}
