import { StripeService, CreateCheckoutSessionParams, CheckoutSessionResult } from '../../infrastructure/services/stripe.service';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { PaqueteRepositoryPort } from '../../domain/ports/paquete.repository.port';
import { DireccionRepositoryPort } from '../../domain/ports/direccion.repository.port';
import { MetodoEntrega } from '../../domain/entities/pedido.entity';

interface ItemCheckout {
  id_paquete: number;
  nombre_paquete: string;
  categoria_paquete?: string;
  precio_unitario: number;
  cantidad: number;
  num_fotos_requeridas: number;
}

interface CrearSesionCheckoutInput {
  id_usuario: number;
  id_direccion?: number; // Opcional: solo requerido para envío a domicilio
  metodo_entrega: MetodoEntrega; // Nuevo campo
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente?: string;
  items: ItemCheckout[];
  subtotal: number;
  iva: number;
  total: number;
  success_url: string;
  cancel_url: string;
}

interface CrearSesionCheckoutResult {
  success: boolean;
  data?: CheckoutSessionResult;
  message?: string;
  error?: string;
}

export class CrearSesionCheckoutUseCase {
  constructor(
    private readonly stripeService: StripeService,
    private readonly usuarioRepository: UsuarioRepositoryPort,
    private readonly paqueteRepository: PaqueteRepositoryPort,
    private readonly direccionRepository: DireccionRepositoryPort
  ) {}

  async execute(input: CrearSesionCheckoutInput): Promise<CrearSesionCheckoutResult> {
    try {
      const {
        id_usuario,
        id_direccion,
        metodo_entrega,
        nombre_cliente,
        email_cliente,
        telefono_cliente,
        items,
        subtotal,
        iva,
        total,
        success_url,
        cancel_url
      } = input;

      // Validar campos requeridos
      if (!nombre_cliente || !email_cliente || !items || items.length === 0) {
        return {
          success: false,
          message: 'Nombre, email e items son requeridos',
          error: 'Campos requeridos faltantes'
        };
      }

      // Validar metodo_entrega
      if (!metodo_entrega || (metodo_entrega !== 'envio_domicilio' && metodo_entrega !== 'recogida_tienda')) {
        return {
          success: false,
          message: 'Método de entrega inválido. Debe ser "envio_domicilio" o "recogida_tienda"',
          error: 'Método de entrega inválido'
        };
      }

      // Validar dirección solo si es envío a domicilio
      if (metodo_entrega === 'envio_domicilio' && !id_direccion) {
        return {
          success: false,
          message: 'La dirección de envío es requerida para envío a domicilio',
          error: 'Dirección requerida'
        };
      }

      // Verificar que el usuario exista
      const usuario = await this.usuarioRepository.findById(id_usuario);
      if (!usuario) {
        return {
          success: false,
          message: 'El usuario especificado no existe',
          error: 'Usuario no encontrado'
        };
      }

      // Verificar que la dirección exista y pertenezca al usuario (solo para envío a domicilio)
      if (metodo_entrega === 'envio_domicilio' && id_direccion) {
        const direccion = await this.direccionRepository.findById(id_direccion);
        if (!direccion) {
          return {
            success: false,
            message: 'La dirección especificada no existe',
            error: 'Dirección no encontrada'
          };
        }

        if (direccion.usuario_id !== id_usuario) {
          return {
            success: false,
            message: 'La dirección no pertenece al usuario',
            error: 'Dirección no autorizada'
          };
        }
      }

      // Verificar que los paquetes existan y validar precios
      for (const item of items) {
        const paquete = await this.paqueteRepository.findById(item.id_paquete);
        if (!paquete) {
          return {
            success: false,
            message: `El paquete con ID ${item.id_paquete} no existe`,
            error: 'Paquete no encontrado'
          };
        }

        // Verificar que el precio coincida (con tolerancia de centavos)
        if (Math.abs(paquete.precio - item.precio_unitario) > 0.01) {
          return {
            success: false,
            message: `El precio del paquete ${item.nombre_paquete} no coincide`,
            error: 'Precio inconsistente'
          };
        }

        // Verificar cantidad de fotos requeridas
        const fotosEsperadas = paquete.cantidad_fotos * item.cantidad;
        if (item.num_fotos_requeridas !== fotosEsperadas) {
          return {
            success: false,
            message: `La cantidad de fotos requeridas para ${item.nombre_paquete} no es correcta`,
            error: 'Cantidad de fotos incorrecta'
          };
        }
      }

      // Calcular y verificar totales
      const subtotalCalculado = items.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
      if (Math.abs(subtotalCalculado - subtotal) > 0.01) {
        return {
          success: false,
          message: 'El subtotal no coincide con la suma de los items',
          error: 'Subtotal inconsistente'
        };
      }

      // Verificar IVA (16%)
      const ivaCalculado = subtotalCalculado * 0.16;
      if (Math.abs(ivaCalculado - iva) > 0.01) {
        return {
          success: false,
          message: 'El IVA calculado no coincide',
          error: 'IVA inconsistente'
        };
      }

      // Verificar total
      const totalCalculado = subtotalCalculado + ivaCalculado;
      if (Math.abs(totalCalculado - total) > 0.01) {
        return {
          success: false,
          message: 'El total no coincide con subtotal + IVA',
          error: 'Total inconsistente'
        };
      }

      // Crear sesión de checkout en Stripe
      const sessionResult = await this.stripeService.createCheckoutSession({
        id_usuario,
        id_direccion: metodo_entrega === 'envio_domicilio' ? id_direccion : undefined,
        metodo_entrega,
        nombre_cliente,
        email_cliente,
        telefono_cliente,
        items,
        subtotal,
        iva,
        total,
        success_url,
        cancel_url
      });

      return {
        success: true,
        data: sessionResult
      };
    } catch (error: any) {
      console.error('Error en CrearSesionCheckoutUseCase:', error);
      return {
        success: false,
        message: error.message || 'Error al crear la sesión de checkout',
        error: error.message
      };
    }
  }
}
