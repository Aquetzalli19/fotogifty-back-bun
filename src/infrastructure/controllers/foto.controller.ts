import { Request, Response } from 'express';
import { SubirFotoUseCase } from '../../application/use-cases/subir-foto.use-case';
import { ValidarLimiteCopiasUseCase } from '../../application/use-cases/validar-limite-copias.use-case';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { FotoRepositoryPort } from '../../domain/ports/foto.repository.port';
import { ItemsPedidoRepositoryPort } from '../../domain/ports/items-pedido.repository.port';
import { S3Service } from '../services/s3.service';

export class FotoController {
  constructor(
    private readonly subirFotoUseCase: SubirFotoUseCase,
    private readonly validarLimiteCopiasUseCase: ValidarLimiteCopiasUseCase,
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

      const { usuarioId, pedidoId, itemPedidoId, cantidad_copias } = req.body;

      if (!usuarioId || !itemPedidoId) {
        res.status(400).json({
          success: false,
          error: 'usuarioId e itemPedidoId son requeridos'
        });
        return;
      }

      // Parsear y validar cantidad_copias
      const cantidadCopias = cantidad_copias ? parseInt(cantidad_copias) : 1;
      if (cantidadCopias < 1) {
        res.status(400).json({
          success: false,
          error: 'cantidad_copias debe ser al menos 1'
        });
        return;
      }

      // Validar que no exceda el límite del paquete
      const validacion = await this.validarLimiteCopiasUseCase.execute(
        parseInt(itemPedidoId),
        cantidadCopias
      );

      if (!validacion.success) {
        res.status(400).json({
          success: false,
          error: validacion.message,
          data: {
            copias_usadas_total: validacion.copias_usadas_total,
            copias_disponibles: validacion.copias_disponibles,
            limite_paquete: validacion.limite_paquete
          }
        });
        return;
      }

      const foto = await this.subirFotoUseCase.execute({
        file: req.file,
        usuarioId: parseInt(usuarioId),
        pedidoId: pedidoId ? parseInt(pedidoId) : undefined, // Convertir a número o dejar como undefined
        itemPedidoId: parseInt(itemPedidoId),
        cantidadCopias: cantidadCopias
      });

      res.status(200).json({
        success: true,
        data: {
          id: foto.id,
          url: foto.ruta_almacenamiento,
          filename: foto.nombre_archivo,
          size: foto.tamaño_archivo,
          cantidad_copias: foto.cantidad_copias,
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
   * Proxy para descargar imágenes de S3 sin problemas de CORS
   * El frontend envía la URL de S3, el backend la descarga y la reenvía
   */
  async downloadByUrl(req: Request, res: Response): Promise<void> {
    try {
      const { imageUrl } = req.body;

      // 1. Validar que la URL sea válida
      if (!imageUrl || typeof imageUrl !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Se requiere imageUrl'
        });
        return;
      }

      // 2. Verificar que sea de tu bucket S3 (seguridad)
      const bucketName = process.env.S3_BUCKET_NAME;
      if (!bucketName || !imageUrl.includes(bucketName)) {
        res.status(400).json({
          success: false,
          error: 'URL de S3 inválida'
        });
        return;
      }

      // 3. Descargar imagen desde S3
      console.log(`📥 Descargando imagen desde S3: ${imageUrl}`);
      const response = await fetch(imageUrl);

      if (!response.ok) {
        console.error(`❌ Error al obtener imagen de S3: ${response.status}`);
        res.status(404).json({
          success: false,
          error: 'Imagen no encontrada en S3'
        });
        return;
      }

      // 4. Obtener el buffer de la imagen
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 5. Obtener el tipo de contenido
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // 6. Enviar la imagen al frontend
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 año
      res.send(buffer);

      console.log(`✅ Imagen enviada al frontend (${buffer.length} bytes)`);
    } catch (error: any) {
      console.error('❌ Error en proxy de descarga:', error);
      res.status(500).json({
        success: false,
        error: 'Error al descargar imagen desde S3'
      });
    }
  }

  async actualizarCantidadCopias(req: Request, res: Response): Promise<void> {
    try {
      const fotoId = parseInt(req.params.id);
      const { cantidad_copias } = req.body;

      if (isNaN(fotoId)) {
        res.status(400).json({
          success: false,
          error: 'ID de foto inválido'
        });
        return;
      }

      if (!cantidad_copias || cantidad_copias < 1) {
        res.status(400).json({
          success: false,
          error: 'cantidad_copias debe ser al menos 1'
        });
        return;
      }

      // Verificar que la foto existe
      const fotoExistente = await this.fotoRepository.findById(fotoId);
      if (!fotoExistente) {
        res.status(404).json({
          success: false,
          error: 'Foto no encontrada'
        });
        return;
      }

      // Validar que no exceda el límite del paquete
      const validacion = await this.validarLimiteCopiasUseCase.execute(
        fotoExistente.item_pedido_id,
        cantidad_copias,
        fotoId  // Pasamos el fotoId para excluir sus copias actuales
      );

      if (!validacion.success) {
        res.status(400).json({
          success: false,
          error: validacion.message,
          data: {
            copias_usadas_total: validacion.copias_usadas_total,
            copias_disponibles: validacion.copias_disponibles,
            limite_paquete: validacion.limite_paquete
          }
        });
        return;
      }

      // Actualizar cantidad de copias
      const fotoActualizada = await this.fotoRepository.updateCantidadCopias(fotoId, cantidad_copias);

      res.status(200).json({
        success: true,
        data: {
          id: fotoActualizada?.id,
          cantidad_copias: fotoActualizada?.cantidad_copias,
          item_pedido_id: fotoActualizada?.item_pedido_id
        },
        message: 'Cantidad de copias actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error updating cantidad_copias:', error);
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
