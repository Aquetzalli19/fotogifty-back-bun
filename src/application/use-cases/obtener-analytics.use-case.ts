import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';

export interface KPIs {
  ventasTotales: number;
  numeroPedidos: number;
  ticketPromedio: number;
  tasaCrecimiento: number;
}

export interface VentaPorDia {
  fecha: string;
  ventas: number;
  pedidos: number;
}

export interface ProductoTopVenta {
  id_paquete: number;
  nombre_paquete: string;
  categoria_paquete: string;
  cantidad: number;
  ingresos: number;
}

export interface VentaPorCategoria {
  categoria: string;
  ventas: number;
  pedidos: number;
  porcentaje: number;
}

export interface EstadoPedido {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface AnalyticsData {
  kpis: KPIs;
  ventasPorDia: VentaPorDia[];
  productosTopVentas: ProductoTopVenta[];
  ventasPorCategoria: VentaPorCategoria[];
  estadosPedidos: EstadoPedido[];
}

export class ObtenerAnalyticsUseCase {
  constructor(private readonly pedidoRepository: PedidoRepositoryPort) {}

  async execute(
    fechaInicio: Date,
    fechaFin: Date,
    categoria?: string
  ): Promise<AnalyticsData> {
    // 1. Obtener todos los pedidos en el rango de fechas
    const pedidos = await this.pedidoRepository.findByDateRange(
      fechaInicio,
      fechaFin
    );

    // Filtrar solo pedidos pagados
    const pedidosPagados = pedidos.filter(
      (p) => p.estado_pago === 'paid' || p.estado_pago === 'pagado'
    );

    // 2. Calcular KPIs
    const kpis = this.calcularKPIs(pedidosPagados);

    // 3. Calcular ventas por día
    const ventasPorDia = this.calcularVentasPorDia(pedidosPagados);

    // 4. Calcular productos más vendidos
    const productosTopVentas = this.calcularProductosTopVentas(
      pedidosPagados,
      categoria
    );

    // 5. Calcular ventas por categoría
    const ventasPorCategoria = this.calcularVentasPorCategoria(pedidosPagados);

    // 6. Calcular distribución de estados
    const estadosPedidos = this.calcularEstadosPedidos(pedidos); // Usar todos los pedidos

    return {
      kpis,
      ventasPorDia,
      productosTopVentas,
      ventasPorCategoria,
      estadosPedidos,
    };
  }

  private calcularKPIs(pedidos: any[]): KPIs {
    const ventasTotales = pedidos.reduce(
      (sum, p) => sum + Number(p.total || 0),
      0
    );
    const numeroPedidos = pedidos.length;
    const ticketPromedio =
      numeroPedidos > 0 ? ventasTotales / numeroPedidos : 0;

    // TODO: Calcular tasa de crecimiento vs período anterior
    const tasaCrecimiento = 0;

    return {
      ventasTotales: Number(ventasTotales.toFixed(2)),
      numeroPedidos,
      ticketPromedio: Number(ticketPromedio.toFixed(2)),
      tasaCrecimiento,
    };
  }

  private calcularVentasPorDia(pedidos: any[]): VentaPorDia[] {
    const ventasPorDiaMap = new Map<
      string,
      { ventas: number; pedidos: number }
    >();

    pedidos.forEach((pedido) => {
      const fecha = new Date(pedido.creado_en || pedido.fecha_pedido)
        .toISOString()
        .split('T')[0];
      const current = ventasPorDiaMap.get(fecha) || { ventas: 0, pedidos: 0 };

      ventasPorDiaMap.set(fecha, {
        ventas: current.ventas + Number(pedido.total || 0),
        pedidos: current.pedidos + 1,
      });
    });

    return Array.from(ventasPorDiaMap.entries())
      .map(([fecha, data]) => ({
        fecha,
        ventas: Number(data.ventas.toFixed(2)),
        pedidos: data.pedidos,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  private calcularProductosTopVentas(
    pedidos: any[],
    categoriaFiltro?: string
  ): ProductoTopVenta[] {
    const productosMap = new Map<number, ProductoTopVenta>();

    pedidos.forEach((pedido) => {
      if (!pedido.items_pedido || !Array.isArray(pedido.items_pedido)) {
        return;
      }

      pedido.items_pedido.forEach((item: any) => {
        const idPaquete = item.id_paquete || item.paquete_id;
        const nombrePaquete = item.nombre_paquete;
        const categoriaPaquete = item.categoria_paquete;

        // Filtrar por categoría si se especifica
        if (categoriaFiltro && categoriaPaquete !== categoriaFiltro) {
          return;
        }

        const current = productosMap.get(idPaquete) || {
          id_paquete: idPaquete,
          nombre_paquete: nombrePaquete,
          categoria_paquete: categoriaPaquete || 'Sin categoría',
          cantidad: 0,
          ingresos: 0,
        };

        const cantidad = item.cantidad || 1;
        const precioUnitario = Number(item.precio_unitario || 0);

        productosMap.set(idPaquete, {
          ...current,
          cantidad: current.cantidad + cantidad,
          ingresos: current.ingresos + precioUnitario * cantidad,
        });
      });
    });

    return Array.from(productosMap.values())
      .map((producto) => ({
        ...producto,
        ingresos: Number(producto.ingresos.toFixed(2)),
      }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 10);
  }

  private calcularVentasPorCategoria(pedidos: any[]): VentaPorCategoria[] {
    const categoriasMap = new Map<
      string,
      { ventas: number; pedidos: Set<number> }
    >();

    pedidos.forEach((pedido) => {
      if (!pedido.items_pedido || !Array.isArray(pedido.items_pedido)) {
        return;
      }

      pedido.items_pedido.forEach((item: any) => {
        const categoria = item.categoria_paquete || 'Sin categoría';
        const cantidad = item.cantidad || 1;
        const precioUnitario = Number(item.precio_unitario || 0);
        const ingresos = precioUnitario * cantidad;

        const current = categoriasMap.get(categoria) || {
          ventas: 0,
          pedidos: new Set<number>(),
        };

        current.ventas += ingresos;
        current.pedidos.add(pedido.id);

        categoriasMap.set(categoria, current);
      });
    });

    const totalVentas = Array.from(categoriasMap.values()).reduce(
      (sum, cat) => sum + cat.ventas,
      0
    );

    return Array.from(categoriasMap.entries())
      .map(([categoria, data]) => ({
        categoria,
        ventas: Number(data.ventas.toFixed(2)),
        pedidos: data.pedidos.size,
        porcentaje:
          totalVentas > 0
            ? Number(((data.ventas / totalVentas) * 100).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.ventas - a.ventas);
  }

  private calcularEstadosPedidos(pedidos: any[]): EstadoPedido[] {
    const estadosMap = new Map<string, number>();

    pedidos.forEach((pedido) => {
      const estado = pedido.estado || 'Pendiente';
      estadosMap.set(estado, (estadosMap.get(estado) || 0) + 1);
    });

    const totalPedidos = pedidos.length;

    return Array.from(estadosMap.entries())
      .map(([estado, cantidad]) => ({
        estado,
        cantidad,
        porcentaje:
          totalPedidos > 0
            ? Number(((cantidad / totalPedidos) * 100).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }
}
