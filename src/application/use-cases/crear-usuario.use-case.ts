import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { TipoUsuario } from '../../domain/entities/tipo-usuario.entity';
import bcrypt from 'bcrypt';

interface CrearResult {
  success: boolean;
  data?: UsuarioEntity;
  message?: string;
  error?: string;
}

export class CrearUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepositoryPort) {}

  async execute(usuario: UsuarioEntity): Promise<CrearResult> {
    try {
      // Verificar si el usuario ya existe
      const usuarioExistente = await this.usuarioRepository.findByEmail(usuario.email);
      if (usuarioExistente) {
        return {
          success: false,
          message: 'El usuario ya existe',
          error: 'UNIQUE constraint failed: usuarios.email'
        };
      }

      // Si no se especifica tipo, asumir que es un cliente por defecto
      if (!usuario.tipo) {
        usuario.tipo = TipoUsuario.CLIENTE;
      }

      // Guardar el usuario
      const usuarioGuardado = await this.usuarioRepository.save(usuario);
      
      return {
        success: true,
        data: usuarioGuardado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el usuario',
        error: error.message
      };
    }
  }
}