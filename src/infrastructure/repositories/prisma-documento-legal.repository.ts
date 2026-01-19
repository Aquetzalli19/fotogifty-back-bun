import prisma from '../database/prisma.client';
import { DocumentoLegal, DocumentoLegalEntity, TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';
import { DocumentoLegalRepositoryPort } from '@domain/ports/documento-legal.repository.port';
import { TipoDocumentoLegal as PrismaTipoDocumentoLegal } from '@prisma/client';

export class PrismaDocumentoLegalRepository implements DocumentoLegalRepositoryPort {
  async save(documento: DocumentoLegal): Promise<DocumentoLegal> {
    if (documento.id) {
      // Actualizar
      const updated = await prisma.documentos_legales.update({
        where: { id: documento.id },
        data: this.toPrisma(documento)
      });
      return this.toDomain(updated);
    } else {
      // Crear
      const created = await prisma.documentos_legales.create({
        data: this.toPrisma(documento)
      });
      return this.toDomain(created);
    }
  }

  async findById(id: number): Promise<DocumentoLegal | null> {
    const documento = await prisma.documentos_legales.findUnique({
      where: { id }
    });

    return documento ? this.toDomain(documento) : null;
  }

  async findAll(): Promise<DocumentoLegal[]> {
    const documentos = await prisma.documentos_legales.findMany({
      orderBy: {
        fecha_creacion: 'desc'
      }
    });

    return documentos.map(documento => this.toDomain(documento));
  }

  async findByTipo(tipo: TipoDocumentoLegal): Promise<DocumentoLegal[]> {
    const documentos = await prisma.documentos_legales.findMany({
      where: { tipo: this.tipoDomainToPrisma(tipo) },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });

    return documentos.map(documento => this.toDomain(documento));
  }

  async findActivoByTipo(tipo: TipoDocumentoLegal): Promise<DocumentoLegal | null> {
    const documento = await prisma.documentos_legales.findFirst({
      where: {
        tipo: this.tipoDomainToPrisma(tipo),
        activo: true
      }
    });

    return documento ? this.toDomain(documento) : null;
  }

  async update(id: number, documento: Partial<DocumentoLegal>): Promise<DocumentoLegal> {
    const updated = await prisma.documentos_legales.update({
      where: { id },
      data: this.toPrismaPartial(documento)
    });

    return this.toDomain(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.documentos_legales.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error al eliminar documento legal:', error);
      return false;
    }
  }

  async activar(id: number, tipo: TipoDocumentoLegal): Promise<DocumentoLegal> {
    // Desactivar todos los documentos del mismo tipo
    await prisma.documentos_legales.updateMany({
      where: { tipo: this.tipoDomainToPrisma(tipo) },
      data: { activo: false }
    });

    // Activar el documento seleccionado
    const activated = await prisma.documentos_legales.update({
      where: { id },
      data: { activo: true }
    });

    return this.toDomain(activated);
  }

  private toDomain(prismaDocumento: any): DocumentoLegal {
    return new DocumentoLegalEntity(
      this.tipoPrismaToDomain(prismaDocumento.tipo),
      prismaDocumento.titulo,
      prismaDocumento.contenido,
      prismaDocumento.version,
      prismaDocumento.activo,
      prismaDocumento.id,
      prismaDocumento.fecha_creacion,
      prismaDocumento.fecha_actualizacion
    );
  }

  private toPrisma(documento: DocumentoLegal): any {
    return {
      tipo: this.tipoDomainToPrisma(documento.tipo),
      titulo: documento.titulo,
      contenido: documento.contenido,
      version: documento.version,
      activo: documento.activo
    };
  }

  private toPrismaPartial(documento: Partial<DocumentoLegal>): any {
    const data: any = {};

    if (documento.tipo !== undefined) {
      data.tipo = this.tipoDomainToPrisma(documento.tipo);
    }
    if (documento.titulo !== undefined) {
      data.titulo = documento.titulo;
    }
    if (documento.contenido !== undefined) {
      data.contenido = documento.contenido;
    }
    if (documento.version !== undefined) {
      data.version = documento.version;
    }
    if (documento.activo !== undefined) {
      data.activo = documento.activo;
    }

    return data;
  }

  private tipoDomainToPrisma(tipo: TipoDocumentoLegal): PrismaTipoDocumentoLegal {
    return tipo === TipoDocumentoLegal.TERMS
      ? PrismaTipoDocumentoLegal.terms
      : PrismaTipoDocumentoLegal.privacy;
  }

  private tipoPrismaToDomain(tipo: PrismaTipoDocumentoLegal): TipoDocumentoLegal {
    return tipo === PrismaTipoDocumentoLegal.terms
      ? TipoDocumentoLegal.TERMS
      : TipoDocumentoLegal.PRIVACY;
  }
}
