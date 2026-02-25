import { FooterConfigRepositoryPort } from '@domain/ports/footer-config.repository.port';
import { FooterConfig } from '@domain/entities/footer-config.entity';

interface ActualizarFooterConfigResult {
  success: boolean;
  data?: FooterConfig;
  message?: string;
  error?: string;
}

export class ActualizarFooterConfigUseCase {
  constructor(
    private readonly footerConfigRepository: FooterConfigRepositoryPort
  ) {}

  async execute(data: {
    descripcion?: string;
    email?: string;
    telefono?: string;
  }): Promise<ActualizarFooterConfigResult> {
    try {
      // Validar email si se proporciona
      if (data.email !== undefined && data.email !== null && data.email !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          return {
            success: false,
            message: 'El email proporcionado no es válido',
            error: 'Email inválido'
          };
        }
      }

      // Actualizar la configuración (se crea automáticamente si no existe)
      const updatedConfig = await this.footerConfigRepository.update(data);

      if (!updatedConfig) {
        return {
          success: false,
          message: 'Error al actualizar la configuración del footer',
          error: 'Error al actualizar'
        };
      }

      return {
        success: true,
        data: updatedConfig,
        message: 'Configuración del footer actualizada exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la configuración del footer',
        error: error.message
      };
    }
  }
}
