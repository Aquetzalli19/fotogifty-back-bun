import { Request, Response } from 'express';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { TipoUsuario } from '../../domain/entities/tipo-usuario.entity';
import bcrypt from 'bcrypt';

export class UsuarioController {
  constructor(
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly usuarioRepository: UsuarioRepositoryPort
  ) {}

  async crearUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nombre, apellido, telefono } = req.body;

      // Validaciones básicas
      if (!email || !password || !nombre || !apellido) {
        res.status(400).json({
          success: false,
          message: 'Email, password, nombre y apellido son requeridos'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
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

      // Hashear la contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Crear usuario con tipo cliente por defecto
      const nuevoUsuario = UsuarioEntity.create(
        email,
        password_hash,
        nombre,
        apellido,
        telefono
      );
      nuevoUsuario.tipo = TipoUsuario.CLIENTE;

      const result = await this.crearUsuarioUseCase.execute(nuevoUsuario);

      if (result.success) {
        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.data!;
        res.status(201).json({
          success: true,
          data: usuarioSinPassword
        });
      } else {
        res.status(result.error?.includes('UNIQUE') ? 409 : 500).json({
          success: false,
          message: result.message || 'Error al crear el usuario'
        });
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getAllUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await this.usuarioRepository.findAll();

      // No devolver contraseñas hasheadas en la respuesta
      const usuariosSinPassword = usuarios.map(({ password_hash: _, ...usuario }) => usuario);

      res.status(200).json({
        success: true,
        data: usuariosSinPassword
      });
    } catch (error: any) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}