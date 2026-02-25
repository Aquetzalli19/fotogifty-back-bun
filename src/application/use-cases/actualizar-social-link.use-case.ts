import { SocialLinkRepositoryPort } from '@domain/ports/social-link.repository.port';
import { SocialLink, PlataformaSocial } from '@domain/entities/social-link.entity';

interface ActualizarSocialLinkResult {
  success: boolean;
  data?: SocialLink;
  message?: string;
  error?: string;
}

export class ActualizarSocialLinkUseCase {
  constructor(
    private readonly socialLinkRepository: SocialLinkRepositoryPort
  ) {}

  async execute(
    id: number,
    data: {
      plataforma?: PlataformaSocial;
      url?: string;
      orden?: number;
      activo?: boolean;
    }
  ): Promise<ActualizarSocialLinkResult> {
    try {
      // 1. Validar que el ID es válido
      if (!id || typeof id !== 'number' || id <= 0) {
        return {
          success: false,
          message: 'El ID del enlace es inválido',
          error: 'ID inválido'
        };
      }

      // 2. Verificar que el link existe
      const existingLink = await this.socialLinkRepository.findById(id);
      if (!existingLink) {
        return {
          success: false,
          message: 'Enlace no encontrado',
          error: 'Enlace no encontrado'
        };
      }

      // 3. Validar plataforma si se proporciona
      if (data.plataforma !== undefined) {
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

        // Verificar que no exista otro link con la misma plataforma
        if (data.plataforma !== existingLink.plataforma) {
          const allLinks = await this.socialLinkRepository.findByFooterConfigId(
            existingLink.footer_config_id
          );
          const duplicatePlatform = allLinks.find(
            link => link.plataforma === data.plataforma && link.id !== id
          );

          if (duplicatePlatform) {
            return {
              success: false,
              message: `Ya existe un enlace para la plataforma ${data.plataforma}`,
              error: 'Plataforma duplicada'
            };
          }
        }
      }

      // 4. Validar URL si se proporciona
      if (data.url !== undefined) {
        try {
          new URL(data.url);
        } catch {
          return {
            success: false,
            message: 'La URL proporcionada no es válida',
            error: 'URL inválida'
          };
        }
      }

      // 5. Actualizar el link
      const updatedLink = await this.socialLinkRepository.update(id, data);

      if (!updatedLink) {
        return {
          success: false,
          message: 'Error al actualizar el enlace',
          error: 'Error al actualizar'
        };
      }

      return {
        success: true,
        data: updatedLink,
        message: 'Enlace social actualizado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar el enlace social',
        error: error.message
      };
    }
  }
}
