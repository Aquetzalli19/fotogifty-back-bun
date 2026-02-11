import prisma from '../../infrastructure/database/prisma.client';
import { Pedido } from '../../domain/entities/pedido.entity';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';

export class PrismaPedidoRepository implements PedidoRepositoryPort {
  async findById(id: number): Promise<Pedido | null> {
    const pedidoPrisma = await prisma.pedidos.findUnique({
      where: { id },
      include: {
        usuario: true,
        direccion: true,
        estado: true,
        items: {
          include: {
            paquete: true
          }
        },
        fotos: true
      }
    });

    return pedidoPrisma ? this.toDomain(pedidoPrisma) : null;
  }

  async findByUsuarioId(usuarioId: number): Promise<Pedido[]> {
    const pedidosPrisma = await prisma.pedidos.findMany({
      where: { usuario_id: usuarioId },
      include: {
        usuario: true,
        direccion: true,
        estado: true,
        items: {
          include: {
            paquete: true
          }
        },
        fotos: true
      }
    });

    return pedidosPrisma.map(pedido => this.toDomain(pedido));
  }

  async findByEstado(estado: string): Promise<Pedido[]> {
    const pedidosPrisma = await prisma.pedidos.findMany({
      where: { estado_personalizado: estado }, // Usando el nuevo nombre del campo
      include: {
        usuario: true,
        direccion: true,
        estado: true,
        items: {
          include: {
            paquete: true
          }
        },
        fotos: true
      }
    });

    return pedidosPrisma.map(pedido => this.toDomain(pedido));
  }

  async create(pedido: Pedido): Promise<Pedido> {
    // Buscar estado_id por nombre del estado
    const estadoDB = await prisma.estados_pedido.findUnique({
      where: { nombre: pedido.estado || 'Pendiente' }
    });
    const estadoId = estadoDB?.id ?? 1;

    const pedidoPrisma = await prisma.pedidos.create({
      data: {
        usuario_id: pedido.id_usuario,
        id_pago_stripe: pedido.id_pago_stripe,
        id_sesion_stripe: pedido.id_sesion_stripe,
        nombre_cliente: pedido.nombre_cliente,
        email_cliente: pedido.email_cliente,
        telefono_cliente: pedido.telefono_cliente,
        fecha_pedido: pedido.fecha_pedido,
        estado_personalizado: pedido.estado,
        estado_pago: pedido.estado_pago,
        metodo_entrega: pedido.metodo_entrega,
        subtotal: pedido.subtotal,
        iva: pedido.iva,
        total: pedido.total,
        direccion_id: pedido.id_direccion || null,
        estado_id: estadoId,
        items: {
          create: pedido.items_pedido.map(item => ({
            tipo_item: 'paquete',
            paquete_id: item.id_paquete,
            nombre_paquete: item.nombre_paquete,
            categoria_paquete: item.categoria_paquete,
            precio_unitario: item.precio_unitario,
            cantidad: item.cantidad,
            cantidad_fotos: item.num_fotos_requeridas,
            num_fotos_requeridas: item.num_fotos_requeridas,
            subtotal: item.precio_unitario * item.cantidad
          }))
        }
      },
      include: {
        usuario: true,
        direccion: true,
        estado: true,
        items: {
          include: {
            paquete: true
          }
        },
        fotos: true
      }
    });

    return this.toDomain(pedidoPrisma);
  }

  async update(pedido: Pedido): Promise<Pedido> {
    // Actualizamos el pedido y sus items
    const pedidoPrisma = await prisma.pedidos.update({
      where: { id: pedido.id! },
      data: {
        usuario_id: pedido.id_usuario,
        id_pago_stripe: pedido.id_pago_stripe,
        id_sesion_stripe: pedido.id_sesion_stripe,
        nombre_cliente: pedido.nombre_cliente,
        email_cliente: pedido.email_cliente,
        telefono_cliente: pedido.telefono_cliente,
        fecha_pedido: pedido.fecha_pedido,
        estado_personalizado: pedido.estado, // Usando el nuevo nombre del campo
        estado_pago: pedido.estado_pago,
        metodo_entrega: pedido.metodo_entrega,
        subtotal: pedido.subtotal,
        iva: pedido.iva,
        total: pedido.total,
        direccion_id: pedido.id_direccion || null
      },
      include: {
        usuario: true,
        direccion: true,
        estado: true,
        items: {
          include: {
            paquete: true
          }
        },
        fotos: true
      }
    });

    // Eliminamos los items existentes y creamos los nuevos
    await prisma.items_pedido.deleteMany({
      where: { pedido_id: pedido.id! }
    });

    for (const item of pedido.items_pedido) {
      await prisma.items_pedido.create({
        data: {
          pedido_id: pedido.id!,
          paquete_id: item.id_paquete,
          nombre_paquete: item.nombre_paquete,
          categoria_paquete: item.categoria_paquete,
          precio_unitario: item.precio_unitario,
          cantidad: item.cantidad,
          num_fotos_requeridas: item.num_fotos_requeridas
        }
      });
    }

    // Recuperamos el pedido actualizado con los nuevos items
    const pedidoActualizado = await this.findById(pedido.id!);
    return pedidoActualizado!;
  }

  async findAll(): Promise<Pedido[]> {
    const pedidosPrisma = await prisma.pedidos.findMany({
      include: {
        usuario: true,
        direccion: true,
        estado: true,
        items: {
          include: {
            paquete: true
          }
        },
        fotos: true
      }
    });

    return pedidosPrisma.map(pedido => this.toDomain(pedido));
  }

  async findByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Pedido[]> {
    const pedidosPrisma = await prisma.pedidos.findMany({
      where: {
        fecha_creacion: {
          gte: fechaInicio,
          lte: fechaFin
        }
      },
      include: {
        usuario: true,
        direccion: true,
        estado: true,
        items: {
          include: {
            paquete: true
          }
        },
        fotos: true
      },
      orderBy: {
        fecha_creacion: 'asc'
      }
    });

    return pedidosPrisma.map(pedido => this.toDomain(pedido));
  }

  async updateEstado(id: number, estado: string): Promise<Pedido | null> {
    // Buscar estado_id por nombre para sincronizar ambos campos
    const estadoDB = await prisma.estados_pedido.findUnique({
      where: { nombre: estado }
    });

    const pedidoPrisma = await prisma.pedidos.update({
      where: { id },
      data: {
        estado_personalizado: estado,
        ...(estadoDB && { estado_id: estadoDB.id }),
      },
      include: {
        usuario: true,
        direccion: true,
        estado: true,
        items: {
          include: {
            paquete: true
          }
        },
        fotos: true
      }
    });

    return pedidoPrisma ? this.toDomain(pedidoPrisma) : null;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.pedidos.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      return false;
    }
  }

  private toDomain(prismaPedido: any): Pedido {
    return {
      id: prismaPedido.id,
      orderId: prismaPedido.id, // Alias para compatibilidad con frontend
      id_usuario: prismaPedido.usuario_id,
      id_direccion: prismaPedido.direccion_id,
      id_pago_stripe: prismaPedido.id_pago_stripe,
      id_sesion_stripe: prismaPedido.id_sesion_stripe,
      nombre_cliente: prismaPedido.nombre_cliente,
      email_cliente: prismaPedido.email_cliente,
      telefono_cliente: prismaPedido.telefono_cliente,
      // Direccion de envio solo si existe (para compatibilidad con frontend)
      direccion_envio: prismaPedido.direccion ? {
        calle: prismaPedido.direccion.direccion,
        ciudad: prismaPedido.direccion.ciudad,
        estado: prismaPedido.direccion.estado,
        codigo_postal: prismaPedido.direccion.codigo_postal,
        pais: prismaPedido.direccion.pais
      } : undefined,
      fecha_pedido: prismaPedido.fecha_pedido,
      items_pedido: prismaPedido.items.map((item: any) => ({
        id: item.id,
        id_paquete: item.paquete_id,
        nombre_paquete: item.nombre_paquete,
        categoria_paquete: item.categoria_paquete,
        precio_unitario: Number(item.precio_unitario),
        cantidad: item.cantidad,
        num_fotos_requeridas: item.num_fotos_requeridas
      })),
      estado: prismaPedido.estado_personalizado as any, // Usando el nuevo nombre del campo
      estado_pago: prismaPedido.estado_pago as any,
      metodo_entrega: prismaPedido.metodo_entrega as any,
      subtotal: Number(prismaPedido.subtotal),
      iva: Number(prismaPedido.iva),
      total: Number(prismaPedido.total),
      // ✅ NUEVO: Array de objetos de fotos completos con IDs
      fotos: prismaPedido.fotos?.map((foto: any) => ({
        id: foto.id,
        url: foto.ruta_almacenamiento,
        nombre_archivo: foto.nombre_archivo,
        ancho_foto: foto.ancho_foto ? Number(foto.ancho_foto) : undefined,
        alto_foto: foto.alto_foto ? Number(foto.alto_foto) : undefined,
        resolucion_foto: foto.resolucion_foto,
        tamanio_archivo: foto.tamaño_archivo,
        id_item_pedido: foto.item_pedido_id,
        cantidad_copias: foto.cantidad_copias
      })) || [],
      // ⚠️ Deprecated (mantener por compatibilidad)
      imagenes: prismaPedido.fotos?.map((foto: any) => foto.ruta_almacenamiento) || [],
      creado_en: prismaPedido.fecha_creacion,
      actualizado_en: prismaPedido.fecha_actualizacion
    };
  }
}