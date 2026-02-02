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
      // Si el documento debe estar activo, desactivar todos los documentos del mismo tipo
      if (documento.activo === true) {
        console.log('🔄 Desactivando otros documentos del tipo:', documento.tipo);

        // Obtener todos los documentos del mismo tipo
        const documentosMismoTipo = await this.documentoLegalRepository.findByTipo(documento.tipo);

        // Desactivar cada uno
        for (const doc of documentosMismoTipo) {
          if (doc.id && doc.activo) {
            await this.documentoLegalRepository.update(doc.id, { activo: false });
          }
        }

        console.log('✅ Documentos del mismo tipo desactivados');
      }

      // Crear el nuevo documento con el estado activo especificado
      const documentoGuardado = await this.documentoLegalRepository.save(documento);

      console.log('✅ Documento legal creado con activo:', documentoGuardado.activo);

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
