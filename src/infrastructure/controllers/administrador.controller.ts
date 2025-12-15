import { Request, Response } from 'express';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { TipoUsuario } from '../../domain/entities/tipo-usuario.entity';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import bcrypt from 'bcrypt';

export class AdministradorController {
  constructor(private crearUsuarioUseCase: CrearUsuarioUseCase) {}

  async crearAdministrador(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nombre, apellido, telefono, tipo } = req.body;

      // Validar campos requeridos
      if (!email || !password || !nombre || !apellido) {
        res.status(400).json({
          success: false,
          message: 'Email, contraseña, nombre y apellido son requeridos'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
        return;
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      // Validar tipo de usuario
      const tipoValido = [TipoUsuario.ADMIN, TipoUsuario.SUPER_ADMIN].includes(tipo as TipoUsuario);
      if (!tipoValido) {
        res.status(400).json({
          success: false,
          message: `Tipo de usuario debe ser '${TipoUsuario.ADMIN}' o '${TipoUsuario.SUPER_ADMIN}'`
        });
        return;
      }

      // Hashear la contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Crear el usuario con el tipo correspondiente
      const nuevoUsuario = UsuarioEntity.create(
        email,
        password_hash,
        nombre,
        apellido,
        tipo as TipoUsuario,
        telefono
      );

      const result = await this.crearUsuarioUseCase.execute(nuevoUsuario);

      if (result.success) {
        // Excluir la contraseña del resultado
        const { password_hash: _, ...usuarioSinPassword } = result.data!;
        res.status(201).json({
          success: true,
          data: usuarioSinPassword
        });
      } else {
        res.status(result.error?.includes('UNIQUE') ? 409 : 500).json({
          success: false,
          message: result.message || 'Error al crear el administrador'
        });
      }
    } catch (error) {
      console.error('Error en crearAdministrador:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}