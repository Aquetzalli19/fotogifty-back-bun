import { DocumentoLegal, TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';

export interface DocumentoLegalRepositoryPort {
  save(documento: DocumentoLegal): Promise<DocumentoLegal>;
  findById(id: number): Promise<DocumentoLegal | null>;
  findAll(): Promise<DocumentoLegal[]>;
  findByTipo(tipo: TipoDocumentoLegal): Promise<DocumentoLegal[]>;
  findActivoByTipo(tipo: TipoDocumentoLegal): Promise<DocumentoLegal | null>;
  update(id: number, documento: Partial<DocumentoLegal>): Promise<DocumentoLegal>;
  delete(id: number): Promise<boolean>;
  activar(id: number, tipo: TipoDocumentoLegal): Promise<DocumentoLegal>;
}
