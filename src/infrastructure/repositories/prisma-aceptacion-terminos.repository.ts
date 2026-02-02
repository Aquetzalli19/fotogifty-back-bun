import prisma from '../database/prisma.client';
import { AceptacionTerminos, AceptacionTerminosEntity } from '@domain/entities/aceptacion-terminos.entity';
import { TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';
import { AceptacionTerminosRepositoryPort } from '@domain/ports/aceptacion-terminos.repository.port';
import { TipoDocumentoLegal as PrismaTipoDocumentoLegal } from '@prisma/client';

export class PrismaAceptacionTerminosRepository implements AceptacionTerminosRepositoryPort {
  async save(aceptacion: AceptacionTerminos): Promise<AceptacionTerminos> {
    const created = await prisma.aceptaciones_terminos.create({
      data: this.toPrisma(aceptacion)
    });
    return this.toDomain(created);
  }

  async findByUsuarioId(usuarioId: number): Promise<AceptacionTerminos[]> {
    const aceptaciones = await prisma.aceptaciones_terminos.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { fecha_aceptacion: 'desc' }
    });

    return aceptaciones.map(aceptacion => this.toDomain(aceptacion));
  }

  async findByUsuarioAndDocumento(
    usuarioId: number,
    documentoLegalId: number
  ): Promise<AceptacionTerminos | null> {
    const aceptacion = await prisma.aceptaciones_terminos.findFirst({
      where: {
        usuario_id: usuarioId,
        documento_legal_id: documentoLegalId
      },
      orderBy: { fecha_aceptacion: 'desc' }
    });

    return aceptacion ? this.toDomain(aceptacion) : null;
  }

  async findByUsuarioAndTipo(
    usuarioId: number,
    tipo: TipoDocumentoLegal
  ): Promise<AceptacionTerminos | null> {
    const aceptacion = await prisma.aceptaciones_terminos.findFirst({
      where: {
        usuario_id: usuarioId,
        documento_legal: {
          tipo: this.tipoDomainToPrisma(tipo),
          activo: true
        }
      },
      orderBy: { fecha_aceptacion: 'desc' }
    });

    return aceptacion ? this.toDomain(aceptacion) : null;
  }

  async hasAcceptedCurrentVersion(
    usuarioId: number,
    tipo: TipoDocumentoLegal,
    versionActual: string
  ): Promise<boolean> {
    const aceptacion = await prisma.aceptaciones_terminos.findFirst({
      where: {
        usuario_id: usuarioId,
        documento_legal: {
          tipo: this.tipoDomainToPrisma(tipo),
          activo: true
        },
        version: versionActual
      }
    });

    return !!aceptacion;
  }

  private toDomain(prismaAceptacion: any): AceptacionTerminos {
    return new AceptacionTerminosEntity(
      prismaAceptacion.usuario_id,
      prismaAceptacion.documento_legal_id,
      prismaAceptacion.version,
      prismaAceptacion.fecha_aceptacion,
      prismaAceptacion.ip_address,
      prismaAceptacion.user_agent,
      prismaAceptacion.id
    );
  }

  private toPrisma(aceptacion: AceptacionTerminos): any {
    return {
      usuario_id: aceptacion.usuario_id,
      documento_legal_id: aceptacion.documento_legal_id,
      version: aceptacion.version,
      fecha_aceptacion: aceptacion.fecha_aceptacion,
      ip_address: aceptacion.ip_address,
      user_agent: aceptacion.user_agent
    };
  }

  private tipoDomainToPrisma(tipo: TipoDocumentoLegal): PrismaTipoDocumentoLegal {
    return tipo === TipoDocumentoLegal.TERMS
      ? PrismaTipoDocumentoLegal.terms
      : PrismaTipoDocumentoLegal.privacy;
  }
}
