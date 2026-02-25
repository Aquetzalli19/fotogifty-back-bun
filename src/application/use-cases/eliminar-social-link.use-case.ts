import { SocialLinkRepositoryPort } from '@domain/ports/social-link.repository.port';

interface EliminarSocialLinkResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarSocialLinkUseCase {
  constructor(
    private readonly socialLinkRepository: SocialLinkRepositoryPort
  ) {}

  async execute(id: number): Promise<EliminarSocialLinkResult> {
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

      // 3. Eliminar el link
      const deleted = await this.socialLinkRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'Error al eliminar el enlace',
          error: 'Error al eliminar'
        };
      }

      return {
        success: true,
        message: 'Enlace eliminado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar el enlace social',
        error: error.message
      };
    }
  }
}
