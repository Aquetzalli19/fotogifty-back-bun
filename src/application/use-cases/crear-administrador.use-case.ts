import { AdministradorRepository } from '../../domain/ports/administrador.repository';
import { Administrador } from '../../domain/entities/administrador.entity';
import { UsuarioRepository } from '../../domain/ports/usuario.repository'; // Necesitamos verificar si el usuario existe

export class CrearAdministradorUseCase {
  constructor(
    private readonly administradorRepository: AdministradorRepository,
    private readonly usuarioRepository: UsuarioRepository
  ) {}

  async execute(usuarioId: number, nivelAcceso: number = 1): Promise<Administrador> {
    // Verificar que el usuario exista
    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(usuarioId);
    if (!usuario) {
      throw new Error('El usuario no existe');
    }

    // Verificar que el usuario no sea ya un administrador
    const adminExistente = await this.administradorRepository.obtenerAdministradorPorUsuarioId(usuarioId);
    if (adminExistente) {
      throw new Error('El usuario ya es un administrador');
    }

    // Crear el registro de administrador
    const nuevoAdministrador = await this.administradorRepository.crearAdministrador({
      usuario_id: usuarioId,
      nivel_acceso: nivelAcceso,
      activo: true
    });

    return nuevoAdministrador;
  }
}