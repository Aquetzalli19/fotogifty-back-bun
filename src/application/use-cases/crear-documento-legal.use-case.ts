import { DocumentoLegal } from '@domain/entities/documento-legal.entity';
import { DocumentoLegalRepositoryPort } from '@domain/ports/documento-legal.repository.port';

interface CrearDocumentoLegalResult {
  success: boolean;
  data?: DocumentoLegal;
  message?: string;
  error?: string;
}

export class CrearDocumentoLegalUseCase {
  constructor(private readonly documentoLegalRepository: DocumentoLegalRepositoryPort) {}

  async execute(documento: DocumentoLegal): Promise<CrearDocumentoLegalResult> {
    try {
      const documentoGuardado = await this.documentoLegalRepository.save(documento);

      return {
        success: true,
        data: documentoGuardado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el documento legal',
        error: error.message
      };
    }
  }
}
