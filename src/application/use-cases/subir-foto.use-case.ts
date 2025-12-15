import { S3Service } from '../../infrastructure/services/s3.service';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { FotoRepositoryPort } from '../../domain/ports/foto.repository.port';
import { PaqueteRepositoryPort } from '../../domain/ports/paquete.repository.port';
import { Foto } from '../../domain/entities/foto.entity';
import { ItemsPedidoRepositoryPort } from '../../domain/ports/items-pedido.repository.port';

export interface SubirFotoRequest {
  file: Express.Multer.File;
  usuarioId: number;
  pedidoId?: number;  // Cambiado a opcional
  itemPedidoId: number;
}

export class SubirFotoUseCase {
  constructor(
    private readonly s3Service: S3Service,
    private readonly usuarioRepository: UsuarioRepositoryPort,
    private readonly pedidoRepository: PedidoRepositoryPort, // Agregamos el repositorio de pedidos
    private readonly itemsPedidoRepository: ItemsPedidoRepositoryPort, // Agregamos el repositorio de items de pedido
    private readonly paqueteRepository: PaqueteRepositoryPort, // Agregamos el repositorio de paquetes
    private readonly fotoRepository: FotoRepositoryPort
  ) {}

  async execute(request: SubirFotoRequest): Promise<Foto> {
    const { file, usuarioId, pedidoId, itemPedidoId } = request;

    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Si se proporciona un pedidoId, verificar que exista
    if (pedidoId !== undefined) {
      const pedido = await this.pedidoRepository.findById(pedidoId);
      if (!pedido) {
        throw new Error(`Pedido con ID ${pedidoId} no encontrado`);
      }
    }

    // Obtener el item de pedido para obtener el paquete_id
    const itemPedido = await this.itemsPedidoRepository.findById(itemPedidoId);
    if (!itemPedido) {
      throw new Error(`Item de pedido con ID ${itemPedidoId} no encontrado`);
    }

    // Obtener el paquete para obtener sus dimensiones y resolución
    let ancho_foto: number | undefined;
    let alto_foto: number | undefined;
    let resolucion_foto: number | undefined;

    if (itemPedido.paquete_id) {
      const paquete = await this.paqueteRepository.findById(itemPedido.paquete_id);
      if (paquete) {
        ancho_foto = paquete.ancho_foto;
        alto_foto = paquete.alto_foto;
        resolucion_foto = paquete.resolucion_foto;
      }
    }

    // Generar key único para S3
    const timestamp = Date.now();
    const key = `fotos/${usuarioId}/${timestamp}-${file.originalname}`;

    // Subir archivo a S3
    const url = await this.s3Service.uploadFile(file, key);

    // Crear registro en base de datos con las dimensiones del paquete
    const foto: Foto = {
      usuario_id: usuarioId,
      pedido_id: pedidoId,  // Esto ahora puede ser opcional
      item_pedido_id: itemPedidoId,
      nombre_archivo: file.originalname,
      ruta_almacenamiento: url,
      tamaño_archivo: file.size,
      ancho_foto,
      alto_foto,
      resolucion_foto
    };

    return await this.fotoRepository.save(foto);
  }
}