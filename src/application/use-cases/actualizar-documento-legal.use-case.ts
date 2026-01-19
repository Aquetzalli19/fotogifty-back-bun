import { DocumentoLegal } from '@domain/entities/documento-legal.entity';
import { DocumentoLegalRepositoryPort } from '@domain/ports/documento-legal.repository.port';

interface ActualizarDocumentoLegalResult {
  success: boolean;
  data?: DocumentoLegal;
  message?: string;
  error?: string;
}

export class ActualizarDocumentoLegalUseCase {
  constructor(private readonly documentoLegalRepository: DocumentoLegalRepositoryPort) {}

  async execute(id: number, documento: Partial<DocumentoLegal>): Promise<ActualizarDocumentoLegalResult> {
    try {
      // Verificar que el documento existe
      const documentoExistente = await this.documentoLegalRepository.findById(id);
      if (!documentoExistente) {
        return {
          success: false,
          message: 'Documento legal no encontrado'
        };
      }

      const documentoActualizado = await this.documentoLegalRepository.update(id, documento);

      return {
        success: true,
        data: documentoActualizado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar el documento legal',
        error: error.message
      };
    }
  }
}
