import { Request, Response } from 'express';
import { CategoriaEntity } from '../../domain/entities/categoria.entity';
import { CrearCategoriaUseCase } from '../../application/use-cases/crear-categoria.use-case';
import { ActualizarCategoriaUseCase } from '../../application/use-cases/actualizar-categoria.use-case';
import { CategoriaRepositoryPort } from '../../domain/ports/categoria.repository.port';

export class CategoriaController {
  constructor(
    private crearCategoriaUseCase: CrearCategoriaUseCase,
    private actualizarCategoriaUseCase: ActualizarCategoriaUseCase,
    private categoriaRepository: CategoriaRepositoryPort
  ) {}

  async crearCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, descripcion, activo } = req.body;

      // Validar que el nombre esté presente
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la categoría es requerido y debe ser un string no vacío'
        });
        return;
      }

      // Validar tipo de dato de activo (debe ser booleano)
      if (activo !== undefined && typeof activo !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'El campo "activo" debe ser un valor booleano'
        });
        return;
      }

      // Ejecutar el caso de uso
      const result = await this.crearCategoriaUseCase.execute(
        nombre.trim(),
        descripcion,
        activo !== undefined ? activo : true // Por defecto true si no se especifica
      );

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al crear la categoría'
        });
      }
    } catch (error) {
      console.error('Error en crearCategoria:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getAllCategorias(req: Request, res: Response): Promise<void> {
    try {
      // Obtener todas las categorías
      const categorias = await this.categoriaRepository.findAll();

      res.status(200).json({
        success: true,
        data: categorias
      });
    } catch (error) {
      console.error('Error en getAllCategorias:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getCategoriaById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }

      const categoria = await this.categoriaRepository.findById(idNum);

      if (!categoria) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: categoria
      });
    } catch (error) {
      console.error('Error en getCategoriaById:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }

      // Ejecutar el caso de uso de actualización
      const result = await this.actualizarCategoriaUseCase.execute(
        idNum,
        nombre,
        descripcion,
        activo
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al actualizar la categoría'
        });
      }
    } catch (error) {
      console.error('Error en updateCategoria:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async deleteCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }

      // Verificar que la categoría exista
      const categoria = await this.categoriaRepository.findById(idNum);
      if (!categoria) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      // Eliminar (desactivar) la categoría
      const eliminado = await this.categoriaRepository.delete(idNum);

      if (eliminado) {
        res.status(200).json({
          success: true,
          message: 'Categoría eliminada exitosamente'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar la categoría'
        });
      }
    } catch (error) {
      console.error('Error en deleteCategoria:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}