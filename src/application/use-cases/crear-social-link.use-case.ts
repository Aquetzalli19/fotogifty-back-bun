import { SocialLinkRepositoryPort } from '@domain/ports/social-link.repository.port';
import { FooterConfigRepositoryPort } from '@domain/ports/footer-config.repository.port';
import { SocialLinkEntity, PlataformaSocial } from '@domain/entities/social-link.entity';
import { SocialLink } from '@domain/entities/social-link.entity';

interface CrearSocialLinkResult {
  success: boolean;
  data?: SocialLink;
  message?: string;
  error?: string;
}

export class CrearSocialLinkUseCase {
  constructor(
    private readonly socialLinkRepository: SocialLinkRepositoryPort,
    private readonly footerConfigRepository: FooterConfigRepositoryPort
  ) {}

  async execute(data: {
    plataforma: PlataformaSocial;
    url: string;
    orden?: number;
    activo?: boolean;
  }): Promise<CrearSocialLinkResult> {
    try {
      // 1. Validar campos requeridos
      if (!data.plataforma || typeof data.plataforma !== 'string') {
        return {
          success: false,
          message: 'La plataforma es requerida',
          error: 'Plataforma inválida'
        };
      }

      // Validar que la plataforma es válida
      const plataformasValidas: PlataformaSocial[] = [
        'instagram',
        'facebook',
        'whatsapp',
        'tiktok',
        'twitter',
        'youtube'
      ];

      if (!plataformasValidas.includes(data.plataforma)) {
        return {
          success: false,
          message: `La plataforma debe ser una de: ${plataformasValidas.join(', ')}`,
          error: 'Plataforma inválida'
        };
      }

      if (!data.url || typeof data.url !== 'string') {
        return {
          success: false,
          message: 'La URL es requerida',
          error: 'URL inválida'
        };
      }

      // Validar formato de URL
      try {
        new URL(data.url);
      } catch {
        return {
          success: false,
          message: 'La URL proporcionada no es válida',
          error: 'URL inválida'
        };
      }

      // 2. Obtener o crear footer_config
      let config = await this.footerConfigRepository.findFirst();

      if (!config) {
        // Crear configuración inicial si no existe
        config = await this.footerConfigRepository.save({
          descripcion: undefined,
          email: undefined,
          telefono: undefined
        });
      }

      if (!config || !config.id) {
        return {
          success: false,
          message: 'Error al obtener o crear la configuración del footer',
          error: 'Config no disponible'
        };
      }

      // 3. Verificar que no exista ya un link con la misma plataforma
      const existingLinks = await this.socialLinkRepository.findByFooterConfigId(config.id);
      const duplicatePlatform = existingLinks.find(link => link.plataforma === data.plataforma);

      if (duplicatePlatform) {
        return {
          success: false,
          message: `Ya existe un enlace para la plataforma ${data.plataforma}`,
          error: 'Plataforma duplicada'
        };
      }

      // 4. Crear el social link
      const nuevoLink = SocialLinkEntity.create(
        config.id,
        data.plataforma,
        data.url,
        data.orden ?? 0,
        data.activo ?? true
      );

      const linkGuardado = await this.socialLinkRepository.save(nuevoLink);

      return {
        success: true,
        data: linkGuardado,
        message: 'Enlace social creado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el enlace social',
        error: error.message
      };
    }
  }
}
