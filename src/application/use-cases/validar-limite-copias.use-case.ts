import { FotoRepositoryPort } from '@domain/ports/foto.repository.port';
import { ItemsPedidoRepositoryPort } from '@domain/ports/items-pedido.repository.port';

interface ValidarLimiteCopiasResult {
  success: boolean;
  copias_usadas_total?: number;
  copias_disponibles?: number;
  limite_paquete?: number;
  message?: string;
}

export class ValidarLimiteCopiasUseCase {
  constructor(
    private readonly fotoRepository: FotoRepositoryPort,
    private readonly itemsPedidoRepository: ItemsPedidoRepositoryPort
  ) {}

  async execute(
    itemPedidoId: number,
    cantidadCopiasNueva: number,
    fotoIdActual?: number
  ): Promise<ValidarLimiteCopiasResult> {
    try {
      // 1. Obtener información del item de pedido (incluye cantidad de fotos del paquete)
      const itemPedido = await this.itemsPedidoRepository.findById(itemPedidoId);

      if (!itemPedido) {
        return {
          success: false,
          message: 'Item de pedido no encontrado'
        };
      }

      // 2. Obtener el límite del paquete
      const limitePaquete = itemPedido.cantidad_fotos || itemPedido.num_fotos_requeridas || 0;

      if (limitePaquete === 0) {
        return {
          success: false,
          message: 'No se pudo determinar el límite del paquete'
        };
      }

      // 3. Calcular total de copias ya usadas
      const totalCopiasUsadas = await this.fotoRepository.getTotalCopiasUsadas(itemPedidoId);

      // 4. Si es una actualización de foto existente, restar las copias actuales
      let copiasOtrasFotos = totalCopiasUsadas;
      if (fotoIdActual) {
        const fotoActual = await this.fotoRepository.findById(fotoIdActual);
        if (fotoActual) {
          copiasOtrasFotos = totalCopiasUsadas - (fotoActual.cantidad_copias || 1);
        }
      }

      // 5. Calcular nuevo total
      const nuevoTotal = copiasOtrasFotos + cantidadCopiasNueva;

      // 6. Validar límite
      if (nuevoTotal > limitePaquete) {
        return {
          success: false,
          message: `Excede el límite del paquete: ${nuevoTotal}/${limitePaquete} fotos`,
          copias_usadas_total: copiasOtrasFotos,
          copias_disponibles: limitePaquete - copiasOtrasFotos,
          limite_paquete: limitePaquete
        };
      }

      // 7. Validación exitosa
      return {
        success: true,
        copias_usadas_total: nuevoTotal,
        copias_disponibles: limitePaquete - nuevoTotal,
        limite_paquete: limitePaquete
      };
    } catch (error: any) {
      console.error('Error en ValidarLimiteCopiasUseCase:', error);
      return {
        success: false,
        message: 'Error al validar el límite de copias'
      };
    }
  }
}
