import { Request, Response } from 'express';
import { StoreEntity } from '@domain/entities/store.entity';
import { CrearStoreUseCase } from '@application/use-cases/crear-store.use-case';
import { ActualizarStoreUseCase } from '@application/use-cases/actualizar-store.use-case';
import { StoreRepositoryPort } from '@domain/ports/store.repository.port';

export class StoreController {
  constructor(
    private crearStoreUseCase: CrearStoreUseCase,
    private actualizarStoreUseCase: ActualizarStoreUseCase,
    private storeRepository: StoreRepositoryPort
  ) {}

  async crearStore(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nombre, apellido, codigo_empleado, telefono } = req.body;

      // Validar que los campos requeridos estén presentes
      if (!email || !password || !nombre || !apellido || !codigo_empleado) {
        res.status(400).json({
          success: false,
          message: 'Email, password, nombre, apellido y codigo_empleado son requeridos'
        });
        return;
      }

      // Ejecutar el caso de uso
      const result = await this.crearStoreUseCase.execute(
        email,
        password,
        nombre,
        apellido,
        codigo_empleado,
        telefono
      );

      if (result.success) {
        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...storeSinPassword } = result.data!;
        res.status(201).json({
          success: true,
          data: storeSinPassword
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al crear el store'
        });
      }
    } catch (error) {
      console.error('Error en crearStore:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getAllStores(req: Request, res: Response): Promise<void> {
    try {
      // Obtener todos los stores
      const stores = await this.storeRepository.findAll();

      // No devolver las contraseñas hasheadas en la respuesta
      const storesSinPassword = stores.map(({ password_hash: _, ...store }) => store);

      res.status(200).json({
        success: true,
        data: storesSinPassword
      });
    } catch (error) {
      console.error('Error en getAllStores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getStoreById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de store inválido'
        });
        return;
      }

      const store = await this.storeRepository.findById(idNum);

      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Store no encontrado'
        });
        return;
      }

      // No devolver la contraseña hasheada en la respuesta
      const { password_hash: _, ...storeSinPassword } = store;

      res.status(200).json({
        success: true,
        data: storeSinPassword
      });
    } catch (error) {
      console.error('Error en getStoreById:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateStore(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { email, password, nombre, apellido, codigo_empleado, telefono, activo } = req.body;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de store inválido'
        });
        return;
      }

      // Ejecutar el caso de uso de actualización
      const result = await this.actualizarStoreUseCase.execute(
        idNum,
        email,
        password,
        nombre,
        apellido,
        codigo_empleado,
        telefono,
        activo
      );

      if (result.success) {
        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...storeSinPassword } = result.data!;
        res.status(200).json({
          success: true,
          data: storeSinPassword
        });
      } else {
        const statusCode = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al actualizar el store'
        });
      }
    } catch (error) {
      console.error('Error en updateStore:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async deleteStore(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de store inválido'
        });
        return;
      }

      // Verificar que el store exista
      const store = await this.storeRepository.findById(idNum);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Store no encontrado'
        });
        return;
      }

      // Eliminar (desactivar) el store
      const eliminado = await this.storeRepository.delete(idNum);

      if (eliminado) {
        res.status(200).json({
          success: true,
          message: 'Store eliminado exitosamente'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar el store'
        });
      }
    } catch (error) {
      console.error('Error en deleteStore:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}