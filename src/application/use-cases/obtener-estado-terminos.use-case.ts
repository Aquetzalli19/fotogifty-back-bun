import { AceptacionTerminosRepositoryPort } from '@domain/ports/aceptacion-terminos.repository.port';
import { DocumentoLegalRepositoryPort } from '@domain/ports/documento-legal.repository.port';
import { TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';

export interface EstadoTerminos {
  tipo: TipoDocumentoLegal;
  aceptado: boolean;
  version_actual: string;
  version_aceptada?: string;
  fecha_aceptacion?: Date;
  requiere_aceptacion: boolean;
}

export interface ObtenerEstadoTerminosResult {
  success: boolean;
  message?: string;
  estados?: EstadoTerminos[];
}

export class ObtenerEstadoTerminosUseCase {
  constructor(
    private aceptacionTerminosRepository: AceptacionTerminosRepositoryPort,
    private documentoLegalRepository: DocumentoLegalRepositoryPort
  ) {}

  async execute(usuarioId: number): Promise<ObtenerEstadoTerminosResult> {
    try {
      // Obtener documentos activos de términos y privacidad
      const termsActivo = await this.documentoLegalRepository.findActivoByTipo(TipoDocumentoLegal.TERMS);
      const privacyActivo = await this.documentoLegalRepository.findActivoByTipo(TipoDocumentoLegal.PRIVACY);

      const estados: EstadoTerminos[] = [];

      // Verificar estado de términos
      if (termsActivo) {
        const aceptacionTerms = await this.aceptacionTerminosRepository.findByUsuarioAndTipo(
          usuarioId,
          TipoDocumentoLegal.TERMS
        );

        const aceptado = aceptacionTerms !== null && aceptacionTerms.version === termsActivo.version;

        estados.push({
          tipo: TipoDocumentoLegal.TERMS,
          aceptado,
          version_actual: termsActivo.version,
          version_aceptada: aceptacionTerms?.version,
          fecha_aceptacion: aceptacionTerms?.fecha_aceptacion,
          requiere_aceptacion: !aceptado
        });
      }

      // Verificar estado de privacidad
      if (privacyActivo) {
        const aceptacionPrivacy = await this.aceptacionTerminosRepository.findByUsuarioAndTipo(
          usuarioId,
          TipoDocumentoLegal.PRIVACY
        );

        const aceptado = aceptacionPrivacy !== null && aceptacionPrivacy.version === privacyActivo.version;

        estados.push({
          tipo: TipoDocumentoLegal.PRIVACY,
          aceptado,
          version_actual: privacyActivo.version,
          version_aceptada: aceptacionPrivacy?.version,
          fecha_aceptacion: aceptacionPrivacy?.fecha_aceptacion,
          requiere_aceptacion: !aceptado
        });
      }

      return {
        success: true,
        estados
      };
    } catch (error) {
      console.error('Error en ObtenerEstadoTerminosUseCase:', error);
      return {
        success: false,
        message: 'Error al obtener estado de términos'
      };
    }
  }
}
