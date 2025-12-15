import { Request, Response } from 'express';
import { SubirFotoUseCase } from '../../application/use-cases/subir-foto.use-case';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { FotoRepositoryPort } from '../../domain/ports/foto.repository.port';
import { S3Service } from '../services/s3.service';

export class FotoController {
  constructor(private readonly subirFotoUseCase: SubirFotoUseCase) {}

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
}
