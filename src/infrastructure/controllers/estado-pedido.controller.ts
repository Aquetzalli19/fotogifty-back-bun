import { Request, Response } from 'express';
import { CrearEstadoPedidoUseCase } from '../../application/use-cases/crear-estado-pedido.use-case';
import { ActualizarEstadoPedidoDinamicoUseCase } from '../../application/use-cases/actualizar-estado-pedido-dinamico.use-case';
import { EstadoPedidoRepositoryPort } from '../../domain/ports/estado-pedido.repository.port';

export class EstadoPedidoController {
  constructor(
    private crearEstadoPedidoUseCase: CrearEstadoPedidoUseCase,
    private actualizarEstadoPedidoDinamicoUseCase: ActualizarEstadoPedidoDinamicoUseCase,
    private estadoPedidoRepository: EstadoPedidoRepositoryPort
  ) {}

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, descripcion, color, orden } = req.body;

      if (!nombre) {
        res.status(400).json({
          success: false,
          message: 'El nombre del estado es requerido'
        });
        return;
      }

      const result = await this.crearEstadoPedidoUseCase.execute(nombre, orden, descripcion, color);

      if (result.success) {
        res.status(201).json({ success: true, data: result.data });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error('Error en crear estado pedido:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const todos = req.query.todos === 'true';
      const estados = await this.estadoPedidoRepository.findAll(!todos);

      res.status(200).json({ success: true, data: estados });
    } catch (error) {
      console.error('Error en getAll estados pedido:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const estado = await this.estadoPedidoRepository.findById(id);
      if (!estado) {
        res.status(404).json({ success: false, message: 'Estado de pedido no encontrado' });
        return;
      }

      res.status(200).json({ success: true, data: estado });
    } catch (error) {
      console.error('Error en getById estado pedido:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const { nombre, descripcion, color, orden, activo } = req.body;
      const result = await this.actualizarEstadoPedidoDinamicoUseCase.execute(id, {
        nombre,
        descripcion,
        color,
        orden,
        activo
      });

      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const status = result.error === 'No encontrado' ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error('Error en update estado pedido:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const estado = await this.estadoPedidoRepository.findById(id);
      if (!estado) {
        res.status(404).json({ success: false, message: 'Estado de pedido no encontrado' });
        return;
      }

      const pedidosCount = await this.estadoPedidoRepository.countPedidosByEstadoId(id);
      if (pedidosCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar: hay ${pedidosCount} pedido(s) con este estado`
        });
        return;
      }

      const deleted = await this.estadoPedidoRepository.delete(id);
      if (deleted) {
        res.status(200).json({ success: true, message: 'Estado de pedido eliminado' });
      } else {
        res.status(500).json({ success: false, message: 'Error al eliminar el estado' });
      }
    } catch (error) {
      console.error('Error en delete estado pedido:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
}
