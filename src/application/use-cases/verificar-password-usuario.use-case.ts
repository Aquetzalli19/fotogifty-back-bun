import { UsuarioRepositoryPort } from '@domain/ports/usuario.repository.port';
import { PasswordService } from '@infrastructure/services/password.service';

/**
 * Caso de uso: Verificar contraseña de usuario
 * Valida si la contraseña proporcionada coincide con la contraseña hasheada del usuario
 */
export class VerificarPasswordUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepositoryPort) {}

  async execute(
    usuarioId: number,
    password: string
  ): Promise<{ success: boolean; valid?: boolean; message?: string; error?: string }> {
    try {
      // Verificar que el usuario existe
      const usuario = await this.usuarioRepository.findById(usuarioId);
      if (!usuario) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        };
      }

      // Verificar la contraseña
      const isPasswordValid = await PasswordService.verifyPassword(password, usuario.password_hash);

      return {
        success: true,
        valid: isPasswordValid
      };
    } catch (error: any) {
      console.error('Error verificando contraseña:', error);
      return {
        success: false,
        message: 'Error al verificar la contraseña',
        error: error.message
      };
    }
  }
}
