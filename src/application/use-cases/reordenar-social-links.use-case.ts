import { SocialLinkRepositoryPort } from '@domain/ports/social-link.repository.port';

interface ReordenarSocialLinksResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ReordenarSocialLinksUseCase {
  constructor(
    private readonly socialLinkRepository: SocialLinkRepositoryPort
  ) {}

  async execute(ids: number[]): Promise<ReordenarSocialLinksResult> {
    try {
      // 1. Validar que se proporcionó un array de IDs
      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          success: false,
          message: 'Se debe proporcionar un array de IDs',
          error: 'IDs inválidos'
        };
      }

      // 2. Validar que todos los elementos son números válidos
      for (const id of ids) {
        if (typeof id !== 'number' || id <= 0) {
          return {
            success: false,
            message: 'Todos los IDs deben ser números válidos',
            error: 'ID inválido'
          };
        }
      }

      // 3. Verificar que todos los IDs existen
      for (const id of ids) {
        const link = await this.socialLinkRepository.findById(id);
        if (!link) {
          return {
            success: false,
            message: `El enlace con ID ${id} no fue encontrado`,
            error: 'Enlace no encontrado'
          };
        }
      }

      // 4. Crear array de actualizaciones
      const updates = ids.map((id, index) => ({
        id,
        orden: index
      }));

      // 5. Actualizar orden de todos los links
      await this.socialLinkRepository.updateOrden(updates);

      return {
        success: true,
        message: 'Orden actualizado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al reordenar los enlaces sociales',
        error: error.message
      };
    }
  }
}
