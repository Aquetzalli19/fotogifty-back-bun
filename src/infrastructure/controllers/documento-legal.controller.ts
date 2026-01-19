import { Request, Response } from 'express';
import { CrearDocumentoLegalUseCase } from '@application/use-cases/crear-documento-legal.use-case';
import { ObtenerDocumentoLegalActivoUseCase } from '@application/use-cases/obtener-documento-legal-activo.use-case';
import { ObtenerTodosDocumentosLegalesUseCase } from '@application/use-cases/obtener-todos-documentos-legales.use-case';
import { ActualizarDocumentoLegalUseCase } from '@application/use-cases/actualizar-documento-legal.use-case';
import { EliminarDocumentoLegalUseCase } from '@application/use-cases/eliminar-documento-legal.use-case';
import { ActivarDocumentoLegalUseCase } from '@application/use-cases/activar-documento-legal.use-case';
import { DocumentoLegalEntity, TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';

export class DocumentoLegalController {
  constructor(
    private readonly crearDocumentoLegalUseCase: CrearDocumentoLegalUseCase,
    private readonly obtenerDocumentoLegalActivoUseCase: ObtenerDocumentoLegalActivoUseCase,
    private readonly obtenerTodosDocumentosLegalesUseCase: ObtenerTodosDocumentosLegalesUseCase,
    private readonly actualizarDocumentoLegalUseCase: ActualizarDocumentoLegalUseCase,
    private readonly eliminarDocumentoLegalUseCase: EliminarDocumentoLegalUseCase,
    private readonly activarDocumentoLegalUseCase: ActivarDocumentoLegalUseCase
  ) {}

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { tipo, titulo, contenido, version } = req.body;

      // Validaciones básicas
      if (!tipo || !titulo || !contenido || !version) {
        res.status(400).json({
          success: false,
          message: 'Tipo, título, contenido y versión son requeridos'
        });
        return;
      }

      // Validar que el tipo sea válido
      if (tipo !== 'terms' && tipo !== 'privacy') {
        res.status(400).json({
          success: false,
          message: 'El tipo debe ser "terms" o "privacy"'
        });
        return;
      }

      // Convertir el tipo del request al enum del dominio
      const tipoDocumento = tipo === 'terms' ? TipoDocumentoLegal.TERMS : TipoDocumentoLegal.PRIVACY;

      const nuevoDocumento = DocumentoLegalEntity.create(
        tipoDocumento,
        titulo,
        contenido,
        version,
        false // Por defecto no está activo
      );

      const result = await this.crearDocumentoLegalUseCase.execute(nuevoDocumento);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message || 'Error al crear el documento legal'
        });
      }
    } catch (error: any) {
      console.error('Error creando documento legal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async obtenerActivo(req: Request, res: Response): Promise<void> {
    try {
      const { tipo } = req.params;

      // Validar que el tipo sea válido
      if (tipo !== 'terms' && tipo !== 'privacy') {
        res.status(400).json({
          success: false,
          message: 'El tipo debe ser "terms" o "privacy"'
        });
        return;
      }

      // Convertir el tipo del request al enum del dominio
      const tipoDocumento = tipo === 'terms' ? TipoDocumentoLegal.TERMS : TipoDocumentoLegal.PRIVACY;

      const result = await this.obtenerDocumentoLegalActivoUseCase.execute(tipoDocumento);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message || 'Documento legal no encontrado'
        });
      }
    } catch (error: any) {
      console.error('Error obteniendo documento legal activo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.obtenerTodosDocumentosLegalesUseCase.execute();

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message || 'Error al obtener los documentos legales'
        });
      }
    } catch (error: any) {
      console.error('Error obteniendo documentos legales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const documentoId = parseInt(id);
      const { tipo, titulo, contenido, version } = req.body;

      if (isNaN(documentoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de documento inválido'
        });
        return;
      }

      // Construir el objeto de actualización
      const updateData: any = {};

      if (tipo !== undefined) {
        // Validar que el tipo sea válido
        if (tipo !== 'terms' && tipo !== 'privacy') {
          res.status(400).json({
            success: false,
            message: 'El tipo debe ser "terms" o "privacy"'
          });
          return;
        }
        updateData.tipo = tipo === 'terms' ? TipoDocumentoLegal.TERMS : TipoDocumentoLegal.PRIVACY;
      }

      if (titulo !== undefined) updateData.titulo = titulo;
      if (contenido !== undefined) updateData.contenido = contenido;
      if (version !== undefined) updateData.version = version;

      const result = await this.actualizarDocumentoLegalUseCase.execute(documentoId, updateData);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Documento legal actualizado exitosamente'
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message || 'Error al actualizar el documento legal'
        });
      }
    } catch (error: any) {
      console.error('Error actualizando documento legal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const documentoId = parseInt(id);

      if (isNaN(documentoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de documento inválido'
        });
        return;
      }

      const result = await this.eliminarDocumentoLegalUseCase.execute(documentoId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message || 'Error al eliminar el documento legal'
        });
      }
    } catch (error: any) {
      console.error('Error eliminando documento legal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async activar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const documentoId = parseInt(id);

      if (isNaN(documentoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de documento inválido'
        });
        return;
      }

      const result = await this.activarDocumentoLegalUseCase.execute(documentoId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message || 'Error al activar el documento legal'
        });
      }
    } catch (error: any) {
      console.error('Error activando documento legal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
