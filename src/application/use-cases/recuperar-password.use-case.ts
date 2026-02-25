import { UsuarioRepositoryPort } from '@domain/ports/usuario.repository.port';
import { PasswordService } from '@infrastructure/services/password.service';

interface RecuperarPasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class RecuperarPasswordUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepositoryPort) {}

  async execute(email: string, telefono: string, nueva_password: string): Promise<RecuperarPasswordResult> {
    try {
      // PASO 1: RE-VERIFICAR IDENTIDAD (CRÍTICO - No confiar solo en el frontend)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Email inválido'
        };
      }

      const telefonoRegex = /^\+?[0-9]{10,}$/;
      if (!telefonoRegex.test(telefono)) {
        return {
          success: false,
          message: 'Teléfono inválido'
        };
      }

      // Buscar usuario
      const usuario = await this.usuarioRepository.findByEmail(email);

      // Verificar identidad — normalizar ambos teléfonos a últimos 10 dígitos
      const normalizarTelefono = (t: string) => t.replace(/\D/g, '').slice(-10);
      const telefonoNormalizado = normalizarTelefono(telefono);
      const telefonoDbNormalizado = usuario?.telefono ? normalizarTelefono(usuario.telefono) : '';
      if (!usuario || telefonoNormalizado !== telefonoDbNormalizado) {
        return {
          success: false,
          message: 'Los datos no coinciden con nuestros registros'
        };
      }

      // PASO 2: Validar requisitos de la nueva contraseña
      if (!nueva_password || nueva_password.length < 6) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      // PASO 3: Hashear la nueva contraseña
      const passwordHasheada = await PasswordService.hashPassword(nueva_password);

      // PASO 4: Actualizar la contraseña usando el método del repositorio
      const usuarioActualizado = await this.usuarioRepository.updatePassword(
        usuario.id!,
        passwordHasheada
      );

      if (!usuarioActualizado) {
        return {
          success: false,
          message: 'Error al actualizar la contraseña'
        };
      }

      // PASO 5: Éxito
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente'
      };
    } catch (error: any) {
      console.error('Error en RecuperarPasswordUseCase:', error);
      return {
        success: false,
        message: 'Error al recuperar la contraseña',
        error: error.message
      };
    }
  }
}
