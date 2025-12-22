import { Request, Response } from 'express';
import { StoreRepositoryPort } from '@domain/ports/store.repository.port';
import { ActualizarStoreUseCase } from '@application/use-cases/actualizar-store.use-case';
import { PasswordService } from '../services/password.service';
import { StoreEntity } from '@domain/entities/store.entity';

export class StoreAuthController {
  constructor(
    private storeRepository: StoreRepositoryPort,
    private actualizarStoreUseCase: ActualizarStoreUseCase
  ) {}

  /**
   * Obtener perfil del store autenticado
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Buscar el store por el ID del usuario
      const store = await this.storeRepository.findById(userId);

      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Perfil de store no encontrado'
        });
        return;
      }

      // No devolver la contraseña hasheada
      const { password_hash: _, ...storeSinPassword } = store;

      res.status(200).json({
        success: true,
        data: storeSinPassword
      });
    } catch (error: any) {
      console.error('Error en getProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar perfil del store autenticado
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Buscar el store actual
      const storeActual = await this.storeRepository.findById(userId);

      if (!storeActual) {
        res.status(404).json({
          success: false,
          message: 'Perfil de store no encontrado'
        });
        return;
      }

      const { nombre, apellido, telefono, email, password } = req.body;

      // Validar que al menos un campo esté presente
      if (!nombre && !apellido && !telefono && !email && !password) {
        res.status(400).json({
          success: false,
          message: 'Debes proporcionar al menos un campo para actualizar'
        });
        return;
      }

      // Validar email si se proporciona
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            message: 'Formato de email inválido'
          });
          return;
        }

        // Verificar que el email no esté en uso por otro store
        const storeConEmail = await this.storeRepository.findByEmail(email);
        if (storeConEmail && storeConEmail.id !== userId) {
          res.status(400).json({
            success: false,
            message: 'El email ya está en uso por otro usuario'
          });
          return;
        }
      }

      // Validar contraseña si se proporciona
      let password_hash = storeActual.password_hash;
      if (password) {
        if (password.length < 6) {
          res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 6 caracteres'
          });
          return;
        }
        password_hash = await PasswordService.hashPassword(password);
      }

      // Crear entidad actualizada
      const storeActualizado = StoreEntity.update(
        storeActual.id!,
        email || storeActual.email,
        password ? password_hash : undefined,
        nombre || storeActual.nombre,
        apellido || storeActual.apellido,
        storeActual.codigo_empleado, // El código de empleado no se puede cambiar
        telefono !== undefined ? telefono : storeActual.telefono,
        storeActual.activo
      );

      // Si password_hash es undefined, usar el actual
      if (!password) {
        storeActualizado.password_hash = storeActual.password_hash;
      }

      // Actualizar en la base de datos
      const result = await this.actualizarStoreUseCase.execute(storeActualizado);

      if (result.success) {
        // No devolver la contraseña hasheada
        const { password_hash: _, ...storeSinPassword } = result.data!;

        res.status(200).json({
          success: true,
          message: 'Perfil actualizado exitosamente',
          data: storeSinPassword
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al actualizar el perfil'
        });
      }
    } catch (error: any) {
      console.error('Error en updateProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cambiar contraseña del store autenticado
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Validar que se proporcionen ambas contraseñas
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
        return;
      }

      // Validar longitud de la nueva contraseña
      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      // Buscar el store
      const store = await this.storeRepository.findById(userId);

      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Perfil de store no encontrado'
        });
        return;
      }

      // Verificar que la contraseña actual sea correcta
      const isPasswordValid = await PasswordService.verifyPassword(
        currentPassword,
        store.password_hash
      );

      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
        return;
      }

      // Hashear la nueva contraseña
      const newPasswordHash = await PasswordService.hashPassword(newPassword);

      // Actualizar el store
      const storeActualizado = StoreEntity.update(
        store.id!,
        store.email,
        newPasswordHash,
        store.nombre,
        store.apellido,
        store.codigo_empleado,
        store.telefono,
        store.activo
      );

      const result = await this.actualizarStoreUseCase.execute(storeActualizado);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Contraseña cambiada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al cambiar la contraseña'
        });
      }
    } catch (error: any) {
      console.error('Error en changePassword:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
