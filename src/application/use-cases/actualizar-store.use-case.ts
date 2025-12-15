import { StoreEntity } from '@domain/entities/store.entity';
import { StoreRepositoryPort } from '@domain/ports/store.repository.port';
import bcrypt from 'bcrypt';

interface ActualizarStoreResult {
  success: boolean;
  data?: StoreEntity;
  message?: string;
  error?: string;
}

export class ActualizarStoreUseCase {
  constructor(private readonly storeRepository: StoreRepositoryPort) {}

  async execute(
    id: number,
    email?: string,
    password?: string,
    nombre?: string,
    apellido?: string,
    codigo_empleado?: string,
    telefono?: string,
    activo?: boolean
  ): Promise<ActualizarStoreResult> {
    try {
      // Validar que el ID exista
      if (!id) {
        return {
          success: false,
          message: 'ID del store es requerido',
          error: 'ID faltante'
        };
      }

      // Obtener el store existente
      const storeExistente = await this.storeRepository.findById(id);
      if (!storeExistente) {
        return {
          success: false,
          message: 'El store especificado no existe',
          error: 'Store no encontrado'
        };
      }

      // Validar formato de email si se proporciona
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return {
            success: false,
            message: 'Formato de email inválido',
            error: 'Email inválido'
          };
        }

        // Validar si ya existe otro usuario con este email
        const usuarioExistente = await this.storeRepository.findByEmail(email);
        if (usuarioExistente && usuarioExistente.id !== storeExistente.id) {
          return {
            success: false,
            message: 'Ya existe un usuario con este email',
            error: 'Email duplicado'
          };
        }
      }

      // Validar si ya existe otro vendedor con este código de empleado
      if (codigo_empleado) {
        const codigoExistente = await this.storeRepository.findByCodigoEmpleado(codigo_empleado);
        if (codigoExistente && codigoExistente.id !== storeExistente.id) {
          return {
            success: false,
            message: 'Ya existe un vendedor con este código de empleado',
            error: 'Código de empleado duplicado'
          };
        }
      }

      // Hashear la contraseña si se proporciona
      let password_hash = storeExistente.password_hash; // Mantener la contraseña actual por defecto
      if (password) {
        // Validar longitud de contraseña
        if (password.length < 6) {
          return {
            success: false,
            message: 'La contraseña debe tener al menos 6 caracteres',
            error: 'Contraseña demasiado corta'
          };
        }
        // Hashear la nueva contraseña
        const saltRounds = 10;
        password_hash = await bcrypt.hash(password, saltRounds);
      }

      // Actualizar los campos proporcionados
      const storeActualizado = StoreEntity.update(
        storeExistente.id,
        email || storeExistente.email,
        password_hash,  // Usar el hash actualizado o el existente
        nombre || storeExistente.nombre,
        apellido || storeExistente.apellido,
        codigo_empleado || storeExistente.codigo_empleado,
        telefono || storeExistente.telefono,
        activo !== undefined ? activo : storeExistente.activo
      );

      // Guardar en la base de datos
      const storeGuardado = await this.storeRepository.update(storeActualizado);

      return {
        success: true,
        data: storeGuardado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar el store',
        error: error.message
      };
    }
  }
}