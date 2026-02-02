import archiver from 'archiver';
import { Response } from 'express';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { S3Service } from '../../infrastructure/services/s3.service';
import { ImageValidationService } from '../../infrastructure/services/image-validation.service';

export interface DescargarPedidoZipRequest {
  pedidoId: number;
  usuarioId: number;
  tipoUsuario: string;
  response: Response;
}

export class DescargarPedidoZipUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepositoryPort,
    private readonly s3Service: S3Service
  ) {}

  async execute(request: DescargarPedidoZipRequest): Promise<void> {
    const { pedidoId, usuarioId, tipoUsuario, response } = request;

    // 1. Validar permisos (solo admin, super_admin y vendedor_ventanilla)
    const rolesPermitidos = ['ADMIN', 'SUPER_ADMIN', 'VENDEDOR_VENTANILLA'];
    if (!rolesPermitidos.includes(tipoUsuario)) {
      response.status(403).json({
        success: false,
        error: 'No tienes permisos para descargar fotos de pedidos'
      });
      return;
    }

    // 2. Obtener pedido con fotos
    const pedido = await this.pedidoRepository.findById(pedidoId);

    if (!pedido) {
      response.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
      return;
    }

    if (!pedido.fotos || pedido.fotos.length === 0) {
      response.status(404).json({
        success: false,
        error: 'No se encontraron fotos para este pedido',
        code: 'NO_PHOTOS_FOUND'
      });
      return;
    }

    // 3. Configurar headers del ZIP
    const fechaFormateada = new Date(pedido.fecha_pedido)
      .toISOString()
      .split('T')[0];
    const zipFilename = `pedido-${pedidoId}-${fechaFormateada}.zip`;

    response.setHeader('Content-Type', 'application/zip');
    response.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    // 4. Crear archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Máxima compresión
    });

    archive.on('error', (err) => {
      console.error('❌ Error creando ZIP:', err);
      if (!response.headersSent) {
        response.status(500).json({
          success: false,
          error: 'Error al crear archivo ZIP'
        });
      }
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('⚠️  Advertencia en ZIP:', err);
      } else {
        throw err;
      }
    });

    // 5. Pipe archive al response
    archive.pipe(response);

    console.log(`📦 Generando ZIP para pedido #${pedidoId} con ${pedido.fotos.length} fotos...`);

    // 6. Procesar cada foto
    let fotosProcesamientos = 0;
    const fotosPorCategoria = new Map<string, number>();

    for (let i = 0; i < pedido.fotos.length; i++) {
      const foto = pedido.fotos[i];

      try {
        // Extraer key de S3 desde la URL
        const s3Key = this.s3Service.extractKeyFromUrl(foto.url);

        console.log(`📥 Descargando foto ${i + 1}/${pedido.fotos.length}: ${s3Key}`);

        // Descargar desde S3
        const fotoBuffer = await this.s3Service.downloadFile(s3Key);

        // Determinar categoría para el nombre del archivo
        const categoria = this.extractCategoriaFromKey(s3Key) || 'foto';
        const copias = foto.cantidad_copias || 1;

        // Contar fotos por categoría para numeración
        const count = (fotosPorCategoria.get(categoria) || 0) + 1;
        fotosPorCategoria.set(categoria, count);

        // Procesar imagen con metadatos EXIF completos
        const imageWithMetadata = await ImageValidationService.processImageWithFullMetadata(
          fotoBuffer,
          foto.resolucion_foto || 300,
          {
            copyright: `Pedido #${pedidoId} - FotoGifty`,
            artist: pedido.nombre_cliente,
            description: `Foto ${i + 1} - ${categoria} - ${copias} ${copias === 1 ? 'copia' : 'copias'}`
          }
        );

        // Nombre descriptivo del archivo
        const extension = imageWithMetadata.format;
        const filename = `foto-${String(i + 1).padStart(3, '0')}-${categoria}-${copias}${copias === 1 ? 'copia' : 'copias'}.${extension}`;

        console.log(`✅ Agregando al ZIP: ${filename}`);

        // Agregar al ZIP
        archive.append(imageWithMetadata.buffer, { name: filename });

        fotosProcesamientos++;
      } catch (error: any) {
        console.error(`❌ Error procesando foto ${i + 1}:`, error.message);
        // Continuar con la siguiente foto en lugar de fallar completamente
      }
    }

    // 7. Generar metadata.txt
    console.log('📄 Generando archivo metadata.txt...');
    const metadataContent = this.generateMetadataFile(pedido);
    archive.append(metadataContent, { name: 'metadata.txt' });

    // 8. Finalizar ZIP
    console.log(`📦 Finalizando ZIP (${fotosProcesamientos} fotos procesadas)...`);
    await archive.finalize();

    console.log(`✅ ZIP generado exitosamente para pedido #${pedidoId}`);
  }

  /**
   * Extrae la categoría del nombre de archivo de la key de S3
   */
  private extractCategoriaFromKey(key: string): string {
    // Intentar extraer del nombre del archivo
    const filename = key.split('/').pop() || '';
    const nameParts = filename.split('-');

    // Si tiene un formato esperado, extraer categoría
    if (nameParts.length > 1) {
      // Remover timestamp y extensión
      return nameParts
        .slice(1)
        .join('-')
        .replace(/\.(jpg|jpeg|png)$/i, '');
    }

    return 'foto';
  }

  /**
   * Genera el contenido del archivo metadata.txt
   */
  private generateMetadataFile(pedido: any): string {
    const totalCopias = pedido.fotos.reduce(
      (sum: number, f: any) => sum + (f.cantidad_copias || 1),
      0
    );
    const fotosUnicas = pedido.fotos.length;

    let content = `╔══════════════════════════════════════════════════════════════╗\n`;
    content += `║                    PEDIDO #${String(pedido.id).padStart(5, '0')}                       ║\n`;
    content += `╚══════════════════════════════════════════════════════════════╝\n\n`;

    content += `INFORMACIÓN DEL PEDIDO\n`;
    content += `═══════════════════════════════════════════════════════════════\n`;
    content += `Fecha: ${new Date(pedido.fecha_pedido).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}\n`;
    content += `Cliente: ${pedido.nombre_cliente}\n`;
    content += `Email: ${pedido.email_cliente}\n`;
    if (pedido.telefono_cliente) {
      content += `Teléfono: ${pedido.telefono_cliente}\n`;
    }
    content += `Estado: ${pedido.estado}\n`;
    content += `Total: $${Number(pedido.total).toFixed(2)} MXN\n\n`;

    content += `FOTOS INCLUIDAS\n`;
    content += `═══════════════════════════════════════════════════════════════\n\n`;

    pedido.fotos.forEach((foto: any, index: number) => {
      const categoria = this.extractCategoriaFromKey(
        this.s3Service.extractKeyFromUrl(foto.url)
      );
      const copias = foto.cantidad_copias || 1;
      const filename = `foto-${String(index + 1).padStart(3, '0')}-${categoria}-${copias}${copias === 1 ? 'copia' : 'copias'}.jpg`;

      content += `${index + 1}. ${filename}\n`;
      content += `   ├─ Nombre original: ${foto.nombre_archivo}\n`;
      content += `   ├─ Cantidad de copias: ${copias}\n`;

      if (foto.ancho_foto && foto.alto_foto) {
        content += `   ├─ Dimensiones físicas: ${foto.ancho_foto} × ${foto.alto_foto} cm\n`;
      }

      if (foto.resolucion_foto) {
        content += `   ├─ Resolución: ${foto.resolucion_foto} DPI\n`;
      }

      if (foto.tamanio_archivo) {
        const tamanoMB = (foto.tamanio_archivo / 1024 / 1024).toFixed(2);
        content += `   └─ Tamaño: ${tamanoMB} MB\n`;
      }

      content += `\n`;
    });

    content += `\nRESUMEN DE IMPRESIÓN\n`;
    content += `═══════════════════════════════════════════════════════════════\n`;
    content += `Total de copias a imprimir: ${totalCopias}\n`;
    content += `Fotos únicas: ${fotosUnicas}\n`;
    content += `Promedio de copias por foto: ${(totalCopias / fotosUnicas).toFixed(1)}\n\n`;

    content += `ESPECIFICACIONES TÉCNICAS\n`;
    content += `═══════════════════════════════════════════════════════════════\n`;
    content += `Todas las fotos incluyen:\n`;
    content += `  • Perfil de color: sRGB IEC61966-2.1\n`;
    content += `  • Resolución: 300 DPI (o especificada por paquete)\n`;
    content += `  • Metadatos EXIF embebidos\n`;
    content += `  • Copyright: Pedido #${pedido.id} - FotoGifty\n\n`;

    content += `═══════════════════════════════════════════════════════════════\n`;
    content += `Generado: ${new Date().toLocaleString('es-MX')}\n`;
    content += `Sistema: FotoGifty Platform\n`;

    return content;
  }
}
