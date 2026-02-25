import Stripe from 'stripe';
import { StripeService } from '../../infrastructure/services/stripe.service';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { PedidoEntity, EstadoPago } from '../../domain/entities/pedido.entity';
import { CustomizacionTemporalRepositoryPort } from '@domain/ports/customizacion-temporal.repository.port';
import { FotoRepositoryPort } from '@domain/ports/foto.repository.port';
import { ProcesarPolaroidCustomizationUseCase } from './procesar-polaroid-customization.use-case';
import { ProcesarCalendarCustomizationUseCase } from './procesar-calendar-customization.use-case';
import prisma from '@infrastructure/database/prisma.client';

interface ProcesarWebhookResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ProcesarWebhookStripeUseCase {
  constructor(
    private readonly stripeService: StripeService,
    private readonly pedidoRepository: PedidoRepositoryPort,
    private readonly customizacionRepository: CustomizacionTemporalRepositoryPort,
    private readonly fotoRepository: FotoRepositoryPort
  ) {}

  async execute(payload: string | Buffer, signature: string): Promise<ProcesarWebhookResult> {
    try {
      // Verificar y construir el evento (versión asíncrona para Bun)
      const event = await this.stripeService.constructWebhookEventAsync(payload, signature);

      // Manejar diferentes tipos de eventos
      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);

        case 'checkout.session.expired':
          return await this.handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);

        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);

        default:
          console.log(`Evento de Stripe no manejado: ${event.type}`);
          return {
            success: true,
            message: `Evento ${event.type} recibido pero no procesado`
          };
      }
    } catch (error: any) {
      console.error('Error en ProcesarWebhookStripeUseCase:', error);
      return {
        success: false,
        message: error.message || 'Error al procesar el webhook',
        error: error.message
      };
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<ProcesarWebhookResult> {
    try {
      const metadata = session.metadata;
      if (!metadata) {
        return {
          success: false,
          message: 'No se encontró metadata en la sesión',
          error: 'Metadata faltante'
        };
      }

      // Extraer datos del metadata
      const id_usuario = parseInt(metadata.id_usuario);
      const id_direccion = metadata.id_direccion ? parseInt(metadata.id_direccion) : undefined;
      const metodo_entrega = (metadata.metodo_entrega || 'envio_domicilio') as 'envio_domicilio' | 'recogida_tienda';
      const nombre_cliente = metadata.nombre_cliente || session.customer_details?.name || '';
      const email_cliente = metadata.email_cliente || session.customer_details?.email || '';
      const telefono_cliente = metadata.telefono_cliente || session.customer_details?.phone || undefined;
      const items = JSON.parse(metadata.items_json || '[]');
      const subtotal = parseFloat(metadata.subtotal || '0');
      const iva = parseFloat(metadata.iva || '0');
      const total = session.amount_total ? session.amount_total / 100 : parseFloat(metadata.total || '0');

      // Verificar si ya existe un pedido con este session_id (evitar duplicados)
      const pedidosExistentes = await this.pedidoRepository.findAll();
      const pedidoExistente = pedidosExistentes.find(p => p.id_sesion_stripe === session.id);

      if (pedidoExistente) {
        console.log(`Pedido ya existe para session_id: ${session.id}`);
        return {
          success: true,
          message: 'El pedido ya fue creado anteriormente'
        };
      }

      // Crear el pedido
      const nuevoPedido = new PedidoEntity(
        id_usuario,
        id_direccion,
        nombre_cliente,
        email_cliente,
        items.map((item: any) => ({
          id_paquete: item.id_paquete,
          nombre_paquete: item.nombre_paquete,
          categoria_paquete: item.categoria_paquete,
          precio_unitario: item.precio_unitario,
          cantidad: item.cantidad,
          num_fotos_requeridas: item.num_fotos_requeridas
        })),
        subtotal,
        iva,
        total,
        metodo_entrega,
        session.payment_intent as string || undefined,
        session.id,
        telefono_cliente,
        'Pendiente',
        EstadoPago.PAGADO
      );

      const pedidoCreado = await this.pedidoRepository.create(nuevoPedido);

      console.log(`Pedido creado exitosamente: ${pedidoCreado.id} para session_id: ${session.id}`);

      // ✅ NUEVO: Procesar customizaciones de polaroids y calendarios
      await this.procesarCustomizaciones(pedidoCreado, id_usuario);

      return {
        success: true,
        message: `Pedido ${pedidoCreado.id} creado exitosamente`
      };
    } catch (error: any) {
      console.error('Error al procesar checkout.session.completed:', error);
      return {
        success: false,
        message: 'Error al crear el pedido',
        error: error.message
      };
    }
  }

  private async handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<ProcesarWebhookResult> {
    console.log(`Sesión de checkout expirada: ${session.id}`);
    // Aquí podrías limpiar datos temporales si los hubiera
    return {
      success: true,
      message: 'Sesión expirada procesada'
    };
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<ProcesarWebhookResult> {
    console.log(`Pago fallido: ${paymentIntent.id}`);
    // Aquí podrías notificar al usuario o actualizar algún registro
    return {
      success: true,
      message: 'Pago fallido procesado'
    };
  }

  /**
   * Procesa customizaciones de polaroids y calendarios después de crear el pedido
   */
  private async procesarCustomizaciones(pedidoCreado: PedidoEntity, usuarioId: number): Promise<void> {
    try {
      console.log(`🎨 Iniciando procesamiento de customizaciones para usuario ${usuarioId}...`);

      // 1. Obtener customizaciones temporales del usuario
      const customizaciones = await this.customizacionRepository.findByUserId(usuarioId);

      if (!customizaciones || customizaciones.length === 0) {
        console.log('No hay customizaciones para procesar');
        return;
      }

      console.log(`Encontradas ${customizaciones.length} customizaciones para procesar`);

      // 2. Inicializar use cases de procesamiento
      const procesarPolaroidUseCase = new ProcesarPolaroidCustomizationUseCase();
      const procesarCalendarUseCase = new ProcesarCalendarCustomizationUseCase();

      // 3. Procesar cada customización según su tipo
      for (const customizacion of customizaciones) {
        try {
          // Encontrar el item_pedido correspondiente
          const itemPedido = pedidoCreado.items?.find(item =>
            item.cart_item_id === customizacion.cart_item_id &&
            item.instance_index === customizacion.instance_index
          );

          if (!itemPedido || !itemPedido.id) {
            console.warn(`⚠️ No se encontró item_pedido para customizacion ${customizacion.id}`);
            continue;
          }

          // ✅ PROCESAR POLAROIDS
          if (customizacion.editor_type === 'polaroid') {
            console.log(`📸 Procesando polaroid para item ${itemPedido.id}...`);

            const result = await procesarPolaroidUseCase.execute(
              customizacion.datos,
              pedidoCreado.id!,
              itemPedido.id
            );

            if (result.success && result.data) {
              // Crear registro de foto por cada polaroid procesado
              for (const imagen of result.data.processedImages) {
                await this.fotoRepository.create({
                  usuario_id: usuarioId,
                  pedido_id: pedidoCreado.id!,
                  item_pedido_id: itemPedido.id,
                  nombre_archivo: `polaroid_${Date.now()}.png`,
                  ruta_almacenamiento: imagen.s3Key,  // Guardar KEY, no URL
                  tamaño_archivo: 0,
                  ancho_foto: customizacion.datos.widthInches || 4,
                  alto_foto: customizacion.datos.heightInches || 6,
                  resolucion_foto: 300,
                  cantidad_copias: imagen.copies,
                  procesada: true
                });

                console.log(`✅ Polaroid procesado: ${imagen.copies} copias`);
              }
            } else {
              console.error(`❌ Error procesando polaroid: ${result.message}`);
            }
          }

          // ✅ PROCESAR CALENDARIOS
          else if (customizacion.editor_type === 'calendar') {
            console.log(`📅 Procesando calendario para item ${itemPedido.id}...`);

            const result = await procesarCalendarUseCase.execute(
              customizacion.datos,
              pedidoCreado.id!,
              itemPedido.id
            );

            if (result.success && result.data) {
              // Crear registro de foto por cada mes procesado
              for (const month of result.data.processedMonths) {
                const foto = await this.fotoRepository.create({
                  usuario_id: usuarioId,
                  pedido_id: pedidoCreado.id!,
                  item_pedido_id: itemPedido.id,
                  nombre_archivo: `calendar_month_${month.month}.png`,
                  ruta_almacenamiento: month.s3Key,  // Guardar KEY, no URL
                  tamaño_archivo: 0,
                  ancho_foto: customizacion.datos.widthInches || 8.5,
                  alto_foto: customizacion.datos.heightInches || 11,
                  resolucion_foto: 300,
                  cantidad_copias: 1,
                  procesada: true
                });

                // Crear relación mes-foto en tabla calendario_fotos
                await prisma.calendario_fotos.create({
                  data: {
                    pedido_id: pedidoCreado.id!,
                    item_pedido_id: itemPedido.id,
                    mes: month.month,
                    foto_id: foto.id!
                  }
                });

                console.log(`✅ Mes ${month.month} de calendario procesado: foto ${foto.id}`);
              }
            } else {
              console.error(`❌ Error procesando calendario: ${result.message}`);
            }
          }

        } catch (error: any) {
          // No lanzar error para no bloquear el webhook
          console.error(`Error procesando customización ${customizacion.id}:`, error.message);
        }
      }

      // 4. Limpiar customizaciones temporales después de procesar
      try {
        await this.customizacionRepository.deleteByUserId(usuarioId);
        console.log(`✅ Customizaciones temporales limpiadas para usuario ${usuarioId}`);
      } catch (error: any) {
        console.warn('⚠️ Error limpiando customizaciones temporales:', error.message);
      }

      console.log(`✅ Procesamiento de customizaciones completado para pedido ${pedidoCreado.id}`);

    } catch (error: any) {
      // No lanzar error para no bloquear la creación del pedido
      console.error('❌ Error general procesando customizaciones:', error.message);
    }
  }
}
