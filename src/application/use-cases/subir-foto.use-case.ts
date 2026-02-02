import { S3Service } from '../../infrastructure/services/s3.service';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { FotoRepositoryPort } from '../../domain/ports/foto.repository.port';
import { PaqueteRepositoryPort } from '../../domain/ports/paquete.repository.port';
import { Foto } from '../../domain/entities/foto.entity';
import { ItemsPedidoRepositoryPort } from '../../domain/ports/items-pedido.repository.port';
import { ImageValidationService } from '../../infrastructure/services/image-validation.service';

export interface SubirFotoRequest {
  file: Express.Multer.File;
  usuarioId: number;
  pedidoId?: number;  // Cambiado a opcional
  itemPedidoId: number;
  cantidadCopias?: number;  // Cantidad de copias físicas a imprimir
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
    const { file, usuarioId, pedidoId, itemPedidoId, cantidadCopias } = request;

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

    // Obtener el paquete para obtener sus dimensiones y resolución esperadas
    let ancho_foto_esperado: number | undefined;
    let alto_foto_esperado: number | undefined;
    let resolucion_esperada: number = 300; // Default: 300 DPI para impresión

    if (itemPedido.paquete_id) {
      const paquete = await this.paqueteRepository.findById(itemPedido.paquete_id);
      if (paquete) {
        ancho_foto_esperado = paquete.ancho_foto;
        alto_foto_esperado = paquete.alto_foto;
        resolucion_esperada = paquete.resolucion_foto || 300;
      }
    }

    // Validar la imagen antes de subirla
    const validationResult = await ImageValidationService.validateImage(file.buffer, {
      minDPI: resolucion_esperada,
      expectedWidth: ancho_foto_esperado,
      expectedHeight: alto_foto_esperado,
      tolerance: 0.5, // Tolerancia de 0.5cm
      allowedFormats: ['jpg', 'jpeg', 'png'],
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });

    // Si hay errores críticos, rechazar la imagen
    if (!validationResult.isValid) {
      throw new Error(
        `Imagen no válida: ${validationResult.errors.join(', ')}`
      );
    }

    // Registrar advertencias en consola (para que el equipo de impresión lo vea)
    if (validationResult.warnings.length > 0) {
      console.warn('⚠️  Advertencias de calidad de imagen:');
      validationResult.warnings.forEach(warning => console.warn(`   - ${warning}`));
    }

    // Extraer metadatos de la imagen original
    const imageMetadata = validationResult.metadata;
    const dpi_original = imageMetadata.dpi || 72;

    // Procesar imagen para impresión: embeber DPI + perfil sRGB
    console.log(`📸 Procesando imagen: ${resolucion_esperada} DPI + perfil sRGB...`);
    const imageWithDPI = await ImageValidationService.processImageForPrint(
      file.buffer,
      resolucion_esperada
    );

    // Generar key único para S3
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Sin extensión
    const key = `fotos/${usuarioId}/${timestamp}-${originalName}.${imageWithDPI.format}`;

    // Determinar content type
    const contentType = imageWithDPI.format === 'png' ? 'image/png' : 'image/jpeg';

    // Subir archivo procesado (con DPI y perfil sRGB embebidos) a S3
    console.log(`☁️  Subiendo a S3 (${resolucion_esperada} DPI, perfil sRGB embebido)`);
    const url = await this.s3Service.uploadBuffer(
      imageWithDPI.buffer,
      key,
      contentType
    );

    // Calcular dimensiones físicas usando el DPI del paquete (no el original)
    // Esto asegura que las dimensiones reflejen el tamaño final de impresión
    const { widthCm, heightCm } = ImageValidationService.calculatePhysicalSize(
      imageMetadata.width,
      imageMetadata.height,
      resolucion_esperada  // Usar DPI del paquete
    );

    // Crear registro en base de datos
    const foto: Foto = {
      usuario_id: usuarioId,
      pedido_id: pedidoId,  // Esto ahora puede ser opcional
      item_pedido_id: itemPedidoId,
      nombre_archivo: file.originalname,
      ruta_almacenamiento: url,
      tamaño_archivo: file.size,
      cantidad_copias: cantidadCopias && cantidadCopias >= 1 ? cantidadCopias : 1,  // Default 1 copia
      ancho_foto: Number(widthCm.toFixed(2)),  // Ancho físico en cm (con DPI del paquete)
      alto_foto: Number(heightCm.toFixed(2)),   // Alto físico en cm (con DPI del paquete)
      resolucion_foto: resolucion_esperada      // DPI del paquete (300, 200, etc.)
    };

    return await this.fotoRepository.save(foto);
  }
}