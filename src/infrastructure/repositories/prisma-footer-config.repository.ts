import prisma from '@infrastructure/database/prisma.client';
import { FooterConfig, FooterConfigEntity } from '@domain/entities/footer-config.entity';
import { FooterConfigRepositoryPort } from '@domain/ports/footer-config.repository.port';
import { SocialLinkEntity } from '@domain/entities/social-link.entity';

export class PrismaFooterConfigRepository implements FooterConfigRepositoryPort {
  async findFirst(): Promise<FooterConfig | null> {
    const config = await prisma.footer_config.findFirst({
      include: {
        social_links: {
          where: { activo: true },
          orderBy: { orden: 'asc' }
        }
      }
    });

    return config ? this.toDomain(config) : null;
  }

  async update(data: Partial<FooterConfig>): Promise<FooterConfig | null> {
    try {
      // Obtener o crear el registro singleton
      let config = await prisma.footer_config.findFirst();

      if (!config) {
        // Crear registro inicial si no existe
        config = await prisma.footer_config.create({
          data: {
            descripcion: data.descripcion,
            email: data.email,
            telefono: data.telefono
          }
        });
      } else {
        // Actualizar registro existente
        const updateData: any = {};

        if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.telefono !== undefined) updateData.telefono = data.telefono;

        config = await prisma.footer_config.update({
          where: { id: config.id },
          data: updateData
        });
      }

      // Obtener config completa con social_links
      const fullConfig = await prisma.footer_config.findUnique({
        where: { id: config.id },
        include: {
          social_links: {
            where: { activo: true },
            orderBy: { orden: 'asc' }
          }
        }
      });

      return fullConfig ? this.toDomain(fullConfig) : null;
    } catch (error) {
      console.error('Error updating footer config:', error);
      return null;
    }
  }

  async save(config: FooterConfig): Promise<FooterConfig> {
    if (config.id) {
      // Actualizar existente
      const updated = await prisma.footer_config.update({
        where: { id: config.id },
        data: this.toPrisma(config),
        include: {
          social_links: {
            where: { activo: true },
            orderBy: { orden: 'asc' }
          }
        }
      });
      return this.toDomain(updated);
    } else {
      // Crear nuevo
      const created = await prisma.footer_config.create({
        data: this.toPrisma(config),
        include: {
          social_links: {
            where: { activo: true },
            orderBy: { orden: 'asc' }
          }
        }
      });
      return this.toDomain(created);
    }
  }

  private toDomain(prismaConfig: any): FooterConfig {
    return new FooterConfigEntity(
      prismaConfig.descripcion,
      prismaConfig.email,
      prismaConfig.telefono,
      prismaConfig.id,
      prismaConfig.created_at,
      prismaConfig.updated_at,
      prismaConfig.social_links?.map((link: any) => new SocialLinkEntity(
        link.footer_config_id,
        link.plataforma,
        link.url,
        link.orden,
        link.activo,
        link.id,
        link.created_at,
        link.updated_at
      ))
    );
  }

  private toPrisma(config: FooterConfig): any {
    return {
      descripcion: config.descripcion,
      email: config.email,
      telefono: config.telefono
    };
  }
}
