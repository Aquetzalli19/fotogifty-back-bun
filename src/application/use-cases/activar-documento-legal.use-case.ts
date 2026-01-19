import { DocumentoLegal, TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';
import { DocumentoLegalRepositoryPort } from '@domain/ports/documento-legal.repository.port';

interface ActivarDocumentoLegalResult {
  success: boolean;
  data?: DocumentoLegal;
  message?: string;
  error?: string;
}

export class ActivarDocumentoLegalUseCase {
  constructor(private readonly documentoLegalRepository: DocumentoLegalRepositoryPort) {}

  async execute(id: number): Promise<ActivarDocumentoLegalResult> {
    try {
      // Verificar que el documento existe
      const documentoExistente = await this.documentoLegalRepository.findById(id);
      if (!documentoExistente) {
        return {
          success: false,
          message: 'Documento legal no encontrado'
        };
      }

      // Activar el documento (esto desactiva automáticamente los demás del mismo tipo)
      const documentoActivado = await this.documentoLegalRepository.activar(
        id,
        documentoExistente.tipo
      );

      return {
        success: true,
        data: documentoActivado,
        message: 'Documento legal activado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al activar el documento legal',
        error: error.message
      };
    }
  }
}
