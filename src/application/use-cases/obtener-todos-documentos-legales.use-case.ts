import { DocumentoLegal } from '@domain/entities/documento-legal.entity';
import { DocumentoLegalRepositoryPort } from '@domain/ports/documento-legal.repository.port';

interface ObtenerTodosDocumentosLegalesResult {
  success: boolean;
  data?: DocumentoLegal[];
  message?: string;
  error?: string;
}

export class ObtenerTodosDocumentosLegalesUseCase {
  constructor(private readonly documentoLegalRepository: DocumentoLegalRepositoryPort) {}

  async execute(): Promise<ObtenerTodosDocumentosLegalesResult> {
    try {
      const documentos = await this.documentoLegalRepository.findAll();

      return {
        success: true,
        data: documentos
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener los documentos legales',
        error: error.message
      };
    }
  }
}
