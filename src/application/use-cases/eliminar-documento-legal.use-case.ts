import { DocumentoLegalRepositoryPort } from '@domain/ports/documento-legal.repository.port';

interface EliminarDocumentoLegalResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarDocumentoLegalUseCase {
  constructor(private readonly documentoLegalRepository: DocumentoLegalRepositoryPort) {}

  async execute(id: number): Promise<EliminarDocumentoLegalResult> {
    try {
      // Verificar que el documento existe
      const documentoExistente = await this.documentoLegalRepository.findById(id);
      if (!documentoExistente) {
        return {
          success: false,
          message: 'Documento legal no encontrado'
        };
      }

      const resultado = await this.documentoLegalRepository.delete(id);

      if (!resultado) {
        return {
          success: false,
          message: 'Error al eliminar el documento legal'
        };
      }

      return {
        success: true,
        message: 'Documento legal eliminado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar el documento legal',
        error: error.message
      };
    }
  }
}
