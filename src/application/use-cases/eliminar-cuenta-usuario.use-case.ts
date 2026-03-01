import { UsuarioRepositoryPort } from '@domain/ports/usuario.repository.port';
import { PasswordService } from '@infrastructure/services/password.service';

export class EliminarCuentaUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepositoryPort) {}

  async execute(
    usuarioId: number,
    password: string,
    phoneNumber: string,
    ip?: string,
    userAgent?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const usuario = await this.usuarioRepository.findById(usuarioId);
      if (!usuario) {
        return { success: false, message: 'Usuario no encontrado', error: 'USER_NOT_FOUND' };
      }

      const isPasswordValid = await PasswordService.verifyPassword(password, usuario.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Credenciales incorrectas. Verifica tu contraseña y número de teléfono.',
          error: 'INVALID_CREDENTIALS'
        };
      }

      const normalizedInput = phoneNumber.replace(/\D/g, '');
      const normalizedStored = (usuario.telefono ?? '').replace(/\D/g, '');
      const phoneMatch = normalizedInput === normalizedStored
        || normalizedStored.endsWith(normalizedInput)
        || normalizedInput.endsWith(normalizedStored);
      if (!phoneMatch) {
        return {
          success: false,
          message: 'Credenciales incorrectas. Verifica tu contraseña y número de teléfono.',
          error: 'INVALID_CREDENTIALS'
        };
      }

      const tieneActivos = await this.usuarioRepository.tienePedidosActivos(usuarioId);
      if (tieneActivos) {
        return {
          success: false,
          message: 'No puedes eliminar tu cuenta mientras tengas pedidos activos. Espera a que sean completados o cancélalos primero.',
          error: 'ACTIVE_ORDERS'
        };
      }

      await this.usuarioRepository.eliminarCuenta(usuarioId, ip, userAgent);

      return { success: true, message: 'Cuenta eliminada correctamente' };
    } catch (error: any) {
      console.error('Error eliminando cuenta:', error);
      return {
        success: false,
        message: 'Error al eliminar la cuenta',
        error: error.message
      };
    }
  }
}
