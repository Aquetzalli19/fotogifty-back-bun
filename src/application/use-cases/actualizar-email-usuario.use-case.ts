import { UsuarioRepositoryPort } from '@domain/ports/usuario.repository.port';
import { PasswordService } from '@infrastructure/services/password.service';
import { Usuario } from '@domain/entities/usuario.entity';

/**
 * Caso de uso: Actualizar email de usuario
 * Actualiza el email del usuario después de validar su contraseña actual
 */
export class ActualizarEmailUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepositoryPort) {}

  async execute(
    usuarioId: number,
    nuevoEmail: string,
    currentPassword: string
  ): Promise<{ success: boolean; data?: Usuario; message?: string; error?: string }> {
    try {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nuevoEmail)) {
        return {
          success: false,
          message: 'Formato de email inválido',
          error: 'INVALID_EMAIL_FORMAT'
        };
      }

      // Verificar que el usuario existe
      const usuario = await this.usuarioRepository.findById(usuarioId);
      if (!usuario) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        };
      }

      // Verificar la contraseña actual
      const isPasswordValid = await PasswordService.verifyPassword(currentPassword, usuario.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Contraseña incorrecta',
          error: 'INVALID_PASSWORD'
        };
      }

      // Verificar que el nuevo email no esté en uso por otro usuario
      const usuarioExistente = await this.usuarioRepository.findByEmail(nuevoEmail);
      if (usuarioExistente && usuarioExistente.id !== usuarioId) {
        return {
          success: false,
          message: 'El email ya está en uso por otro usuario',
          error: 'EMAIL_IN_USE'
        };
      }

      // Si el email es el mismo que el actual, no hay nada que hacer
      if (usuario.email === nuevoEmail) {
        return {
          success: true,
          data: usuario,
          message: 'El email es el mismo que el actual'
        };
      }

      // Actualizar el email
      const usuarioActualizado = {
        ...usuario,
        email: nuevoEmail
      };

      const result = await this.usuarioRepository.save(usuarioActualizado);

      return {
        success: true,
        data: result,
        message: 'Email actualizado exitosamente'
      };
    } catch (error: any) {
      console.error('Error actualizando email:', error);
      return {
        success: false,
        message: 'Error al actualizar el email',
        error: error.message
      };
    }
  }
}
