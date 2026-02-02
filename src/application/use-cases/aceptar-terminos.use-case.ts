import { AceptacionTerminosRepositoryPort } from '@domain/ports/aceptacion-terminos.repository.port';
import { DocumentoLegalRepositoryPort } from '@domain/ports/documento-legal.repository.port';
import { AceptacionTerminosEntity } from '@domain/entities/aceptacion-terminos.entity';
import { TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';

export interface AceptarTerminosRequest {
  usuario_id: number;
  tipo_documento: TipoDocumentoLegal;
  ip_address?: string;
  user_agent?: string;
}

export interface AceptarTerminosResult {
  success: boolean;
  message?: string;
  aceptacion?: {
    id: number;
    version: string;
    fecha_aceptacion: Date;
  };
}

export class AceptarTerminosUseCase {
  constructor(
    private aceptacionTerminosRepository: AceptacionTerminosRepositoryPort,
    private documentoLegalRepository: DocumentoLegalRepositoryPort
  ) {}

  async execute(request: AceptarTerminosRequest): Promise<AceptarTerminosResult> {
    try {
      const { usuario_id, tipo_documento, ip_address, user_agent } = request;

      // Obtener el documento activo del tipo especificado
      const documentoActivo = await this.documentoLegalRepository.findActivoByTipo(tipo_documento);

      if (!documentoActivo) {
        return {
          success: false,
          message: `No existe un documento activo de tipo ${tipo_documento}`
        };
      }

      // Verificar si ya aceptó la versión actual
      const yaAcepto = await this.aceptacionTerminosRepository.hasAcceptedCurrentVersion(
        usuario_id,
        tipo_documento,
        documentoActivo.version
      );

      if (yaAcepto) {
        return {
          success: false,
          message: 'Ya has aceptado la versión actual de este documento'
        };
      }

      // Crear nueva aceptación
      const nuevaAceptacion = AceptacionTerminosEntity.create(
        usuario_id,
        documentoActivo.id!,
        documentoActivo.version,
        ip_address,
        user_agent
      );

      const aceptacionGuardada = await this.aceptacionTerminosRepository.save(nuevaAceptacion);

      return {
        success: true,
        message: 'Términos aceptados exitosamente',
        aceptacion: {
          id: aceptacionGuardada.id!,
          version: aceptacionGuardada.version,
          fecha_aceptacion: aceptacionGuardada.fecha_aceptacion!
        }
      };
    } catch (error) {
      console.error('Error en AceptarTerminosUseCase:', error);
      return {
        success: false,
        message: 'Error al aceptar términos'
      };
    }
  }
}
