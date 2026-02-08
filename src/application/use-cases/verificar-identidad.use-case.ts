import { UsuarioRepositoryPort } from '@domain/ports/usuario.repository.port';

interface VerificarIdentidadResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class VerificarIdentidadUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepositoryPort) {}

  async execute(email: string, telefono: string): Promise<VerificarIdentidadResult> {
    try {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Email inválido'
        };
      }

      // Validar formato de teléfono (opcionalmente con +, mínimo 10 dígitos)
      const telefonoRegex = /^\+?[0-9]{10,}$/;
      if (!telefonoRegex.test(telefono)) {
        return {
          success: false,
          message: 'Teléfono inválido'
        };
      }

      // Buscar usuario por email
      const usuario = await this.usuarioRepository.findByEmail(email);

      // Verificar que el usuario existe y que el teléfono coincide
      // IMPORTANTE: Usar el mismo mensaje genérico para evitar enumeración de usuarios
      if (!usuario || usuario.telefono !== telefono) {
        return {
          success: false,
          message: 'Los datos no coinciden con nuestros registros'
        };
      }

      // Identidad verificada exitosamente
      return {
        success: true,
        message: 'Identidad verificada correctamente'
      };
    } catch (error: any) {
      console.error('Error en VerificarIdentidadUseCase:', error);
      return {
        success: false,
        message: 'Error al verificar la identidad',
        error: error.message
      };
    }
  }
}
