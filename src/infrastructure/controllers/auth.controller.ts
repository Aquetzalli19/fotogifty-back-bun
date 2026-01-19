import { Request, Response } from 'express';
import { UsuarioConTipo } from '../../domain/entities/tipo-usuario.entity';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { VerificarIdentidadUseCase } from '@application/use-cases/verificar-identidad.use-case';
import { RecuperarPasswordUseCase } from '@application/use-cases/recuperar-password.use-case';
import { TokenService } from '../services/token.service';
import { PasswordService } from '../services/password.service';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';

export class AuthController {
  private tokenService: TokenService;
  private verificarIdentidadUseCase: VerificarIdentidadUseCase;
  private recuperarPasswordUseCase: RecuperarPasswordUseCase;

  constructor(
    private loginUseCase: LoginUseCase,
    private usuarioRepository: UsuarioRepositoryPort
  ) {
    this.tokenService = new TokenService();
    this.verificarIdentidadUseCase = new VerificarIdentidadUseCase(usuarioRepository);
    this.recuperarPasswordUseCase = new RecuperarPasswordUseCase(usuarioRepository);
  }

  async loginCliente(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validar que se proporcionen email y password
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
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

      const result = await this.loginUseCase.execute(email, password, 'cliente');

      if (result.success && result.usuario) {
        // Generar token JWT
        const tokenResponse = this.tokenService.generateToken(result.usuario);

        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.usuario;

        res.status(200).json({
          success: true,
          message: 'Login exitoso',
          data: {
            user: usuarioSinPassword,
            token: tokenResponse.token,
            expiresIn: tokenResponse.expiresIn
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message || 'Credenciales inválidas'
        });
      }
    } catch (error) {
      console.error('Error en loginCliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validar que se proporcionen email y password
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
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

      const result = await this.loginUseCase.execute(email, password, 'admin');

      if (result.success && result.usuario) {
        // Generar token JWT
        const tokenResponse = this.tokenService.generateToken(result.usuario);

        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.usuario;

        res.status(200).json({
          success: true,
          message: 'Login exitoso',
          data: {
            user: usuarioSinPassword,
            token: tokenResponse.token,
            expiresIn: tokenResponse.expiresIn
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message || 'Credenciales inválidas'
        });
      }
    } catch (error) {
      console.error('Error en loginAdmin:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async loginStore(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validar que se proporcionen email y password
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
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

      const result = await this.loginUseCase.execute(email, password, 'store');

      if (result.success && result.usuario) {
        // Generar token JWT
        const tokenResponse = this.tokenService.generateToken(result.usuario);

        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.usuario;

        res.status(200).json({
          success: true,
          message: 'Login exitoso',
          data: {
            user: usuarioSinPassword,
            token: tokenResponse.token,
            expiresIn: tokenResponse.expiresIn
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message || 'Credenciales inválidas'
        });
      }
    } catch (error) {
      console.error('Error en loginStore:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      // El usuario ya está en req.user gracias al middleware de autenticación
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Buscar el usuario completo en la base de datos para obtener todos los campos
      const usuarioCompleto = await this.usuarioRepository.findById(req.user.id);

      if (!usuarioCompleto) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // No devolver la contraseña hasheada en la respuesta
      const { password_hash: _, ...usuarioSinPassword } = usuarioCompleto;

      res.status(200).json({
        success: true,
        data: usuarioSinPassword
      });
    } catch (error) {
      console.error('Error en getMe:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async verificarIdentidad(req: Request, res: Response): Promise<void> {
    try {
      const { email, telefono } = req.body;

      // Validación de entrada
      if (!email || !telefono) {
        res.status(400).json({
          success: false,
          message: 'Email y teléfono son requeridos'
        });
        return;
      }

      const result = await this.verificarIdentidadUseCase.execute(email, telefono);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        // Usar 404 para "datos no coinciden" o 400 para validación
        const statusCode = result.message?.includes('no coinciden') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Error en verificarIdentidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async recuperarPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, telefono, nueva_password } = req.body;

      // Validación de entrada
      if (!email || !telefono || !nueva_password) {
        res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
        return;
      }

      const result = await this.recuperarPasswordUseCase.execute(email, telefono, nueva_password);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        // Usar 404 para "datos no coinciden" o 400 para validación
        const statusCode = result.message?.includes('no coinciden') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Error en recuperarPassword:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}