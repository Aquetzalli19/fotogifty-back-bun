import { DocumentoLegal, TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';
import { DocumentoLegalRepositoryPort } from '@domain/ports/documento-legal.repository.port';

interface ObtenerDocumentoLegalActivoResult {
  success: boolean;
  data?: DocumentoLegal;
  message?: string;
  error?: string;
}

export class ObtenerDocumentoLegalActivoUseCase {
  constructor(private readonly documentoLegalRepository: DocumentoLegalRepositoryPort) {}

  async execute(tipo: TipoDocumentoLegal): Promise<ObtenerDocumentoLegalActivoResult> {
    try {
      const documento = await this.documentoLegalRepository.findActivoByTipo(tipo);

      if (!documento) {
        return {
          success: false,
          message: `No se encontró un documento activo de tipo ${tipo}`
        };
      }

      return {
        success: true,
        data: documento
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener el documento legal activo',
        error: error.message
      };
    }
  }
}
