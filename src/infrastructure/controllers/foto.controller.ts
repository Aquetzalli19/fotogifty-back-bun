import { Request, Response } from 'express';
import { SubirFotoUseCase } from '../../application/use-cases/subir-foto.use-case';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { FotoRepositoryPort } from '../../domain/ports/foto.repository.port';
import { S3Service } from '../services/s3.service';

export class FotoController {
  constructor(
    private readonly subirFotoUseCase: SubirFotoUseCase,
    private readonly fotoRepository: FotoRepositoryPort,
    private readonly s3Service: S3Service
  ) {}

  async subirFoto(req: Request, res: Response): Promise<void> {
    try {
      // Logs de depuración para entender qué está llegando en la solicitud
      console.log('Debug - Headers recibidos:', req.headers);
      console.log('Debug - Body recibido:', req.body);
      console.log('Debug - File recibido:', req.file ? 'Sí' : 'No');
      if (req.file) {
        console.log('Debug - File details:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
      }

      if (!req.file) {
        // Proporcionar información más detallada sobre el campo esperado
        res.status(400).json({
          success: false,
          error: 'No se proporcionó ningún archivo. Asegúrate de enviar el archivo con el nombre "foto" en una solicitud multipart/form-data. Campos recibidos:',
          receivedFields: Object.keys(req.body)
        });
        return;
      }

      const { usuarioId, pedidoId, itemPedidoId } = req.body;

      if (!usuarioId || !itemPedidoId) {
        res.status(400).json({
          success: false,
          error: 'usuarioId e itemPedidoId son requeridos'
        });
        return;
      }

      // Validar que itemPedidoId exista
      if (!pedidoId) {
        // Si no se proporciona pedidoId, solo verificar que itemPedidoId exista
        // Aquí podrías verificar que itemPedidoId existe en la base de datos si es necesario
      }

      const foto = await this.subirFotoUseCase.execute({
        file: req.file,
        usuarioId: parseInt(usuarioId),
        pedidoId: pedidoId ? parseInt(pedidoId) : undefined, // Convertir a número o dejar como undefined
        itemPedidoId: parseInt(itemPedidoId)
      });

      res.status(200).json({
        success: true,
        data: {
          id: foto.id,
          url: foto.ruta_almacenamiento,
          filename: foto.nombre_archivo,
          size: foto.tamaño_archivo,
          fecha_subida: foto.fecha_subida
        }
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  async descargarFoto(req: Request, res: Response): Promise<void> {
    try {
      const fotoId = parseInt(req.params.id);
      const user = (req as any).user; // Usuario autenticado del middleware

      if (isNaN(fotoId)) {
        res.status(400).json({
          success: false,
          error: 'ID de foto inválido'
        });
        return;
      }

      // Buscar la foto en la base de datos
      const foto = await this.fotoRepository.findById(fotoId);

      if (!foto) {
        res.status(404).json({
          success: false,
          error: 'Foto no encontrada'
        });
        return;
      }

      // Verificar permisos: el usuario debe ser el dueño, admin, super_admin, o store
      const isOwner = foto.usuario_id === user.userId;
      const isAuthorized = ['admin', 'super_admin', 'store'].includes(user.role);

      if (!isOwner && !isAuthorized) {
        res.status(403).json({
          success: false,
          error: 'No tienes permiso para descargar esta foto'
        });
        return;
      }

      // Extraer la key de S3 de la URL almacenada
      // Formato: https://bucket.s3.region.amazonaws.com/fotos/userId/timestamp-filename.ext
      const s3Key = this.extractS3KeyFromUrl(foto.ruta_almacenamiento);

      if (!s3Key) {
        res.status(500).json({
          success: false,
          error: 'Error al procesar la ruta de almacenamiento'
        });
        return;
      }

      // Generar URL firmada para descarga (válida por 1 hora)
      const downloadUrl = await this.s3Service.getDownloadUrl(s3Key, 3600);

      res.status(200).json({
        success: true,
        data: {
          downloadUrl,
          filename: foto.nombre_archivo,
          expiresIn: 3600, // segundos
          metadata: {
            anchoFisico: foto.ancho_foto,
            altoFisico: foto.alto_foto,
            resolucionDPI: foto.resolucion_foto,
            tamanioArchivo: foto.tamaño_archivo
          }
        },
        message: 'URL de descarga generada. La URL expirará en 1 hora.'
      });
    } catch (error: any) {
      console.error('Error generating download URL:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Extrae la key de S3 de una URL completa
   */
  private extractS3KeyFromUrl(url: string): string | null {
    try {
      // Formato esperado: https://bucket.s3.region.amazonaws.com/fotos/userId/filename.ext
      const urlObj = new URL(url);
      // Remover el "/" inicial del pathname
      return urlObj.pathname.substring(1);
    } catch (error) {
      console.error('Error parsing S3 URL:', error);
      return null;
    }
  }
}
