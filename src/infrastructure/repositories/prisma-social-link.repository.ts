import prisma from '@infrastructure/database/prisma.client';
import { SocialLink, SocialLinkEntity } from '@domain/entities/social-link.entity';
import { SocialLinkRepositoryPort } from '@domain/ports/social-link.repository.port';

export class PrismaSocialLinkRepository implements SocialLinkRepositoryPort {
  async findById(id: number): Promise<SocialLink | null> {
    const link = await prisma.social_links.findUnique({
      where: { id }
    });

    return link ? this.toDomain(link) : null;
  }

  async findByFooterConfigId(footerConfigId: number): Promise<SocialLink[]> {
    const links = await prisma.social_links.findMany({
      where: { footer_config_id: footerConfigId },
      orderBy: { orden: 'asc' }
    });

    return links.map(link => this.toDomain(link));
  }

  async findActiveByFooterConfigId(footerConfigId: number): Promise<SocialLink[]> {
    const links = await prisma.social_links.findMany({
      where: {
        footer_config_id: footerConfigId,
        activo: true
      },
      orderBy: { orden: 'asc' }
    });

    return links.map(link => this.toDomain(link));
  }

  async save(link: SocialLink): Promise<SocialLink> {
    if (link.id) {
      // Actualizar existente
      const updated = await prisma.social_links.update({
        where: { id: link.id },
        data: this.toPrisma(link)
      });
      return this.toDomain(updated);
    } else {
      // Crear nuevo
      const created = await prisma.social_links.create({
        data: this.toPrisma(link)
      });
      return this.toDomain(created);
    }
  }

  async update(id: number, data: Partial<SocialLink>): Promise<SocialLink | null> {
    try {
      const updateData: any = {};

      if (data.plataforma !== undefined) updateData.plataforma = data.plataforma;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const updated = await prisma.social_links.update({
        where: { id },
        data: updateData
      });

      return this.toDomain(updated);
    } catch (error) {
      console.error('Error updating social link:', error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.social_links.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting social link:', error);
      return false;
    }
  }

  async updateOrden(updates: { id: number; orden: number }[]): Promise<void> {
    // Ejecutar todas las actualizaciones en una transacción
    await prisma.$transaction(
      updates.map(update =>
        prisma.social_links.update({
          where: { id: update.id },
          data: { orden: update.orden }
        })
      )
    );
  }

  private toDomain(prismaLink: any): SocialLink {
    return new SocialLinkEntity(
      prismaLink.footer_config_id,
      prismaLink.plataforma,
      prismaLink.url,
      prismaLink.orden,
      prismaLink.activo,
      prismaLink.id,
      prismaLink.created_at,
      prismaLink.updated_at
    );
  }

  private toPrisma(link: SocialLink): any {
    return {
      footer_config_id: link.footer_config_id,
      plataforma: link.plataforma,
      url: link.url,
      orden: link.orden,
      activo: link.activo
    };
  }
}
