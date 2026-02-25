import { FooterConfigRepositoryPort } from '@domain/ports/footer-config.repository.port';
import { FooterConfig } from '@domain/entities/footer-config.entity';

interface ObtenerFooterConfigResult {
  success: boolean;
  data?: FooterConfig;
  message?: string;
  error?: string;
}

export class ObtenerFooterConfigUseCase {
  constructor(
    private readonly footerConfigRepository: FooterConfigRepositoryPort
  ) {}

  async execute(): Promise<ObtenerFooterConfigResult> {
    try {
      const config = await this.footerConfigRepository.findFirst();

      // Si no existe configuración, devolver objeto con valores null
      if (!config) {
        return {
          success: true,
          data: {
            id: undefined,
            descripcion: undefined,
            email: undefined,
            telefono: undefined,
            socialLinks: [],
            created_at: undefined,
            updated_at: undefined
          },
          message: 'No existe configuración de footer'
        };
      }

      return {
        success: true,
        data: config,
        message: 'Configuración de footer obtenida exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener la configuración del footer',
        error: error.message
      };
    }
  }
}
