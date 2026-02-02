import { AceptacionTerminos } from '@domain/entities/aceptacion-terminos.entity';
import { TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';

export interface AceptacionTerminosRepositoryPort {
  /**
   * Guarda una nueva aceptación de términos
   */
  save(aceptacion: AceptacionTerminos): Promise<AceptacionTerminos>;

  /**
   * Busca todas las aceptaciones de un usuario
   */
  findByUsuarioId(usuarioId: number): Promise<AceptacionTerminos[]>;

  /**
   * Busca la aceptación de un usuario para un documento específico
   */
  findByUsuarioAndDocumento(
    usuarioId: number,
    documentoLegalId: number
  ): Promise<AceptacionTerminos | null>;

  /**
   * Busca la aceptación de un usuario para un tipo de documento específico
   */
  findByUsuarioAndTipo(
    usuarioId: number,
    tipo: TipoDocumentoLegal
  ): Promise<AceptacionTerminos | null>;

  /**
   * Verifica si un usuario ha aceptado la versión actual de un tipo de documento
   */
  hasAcceptedCurrentVersion(
    usuarioId: number,
    tipo: TipoDocumentoLegal,
    versionActual: string
  ): Promise<boolean>;
}
