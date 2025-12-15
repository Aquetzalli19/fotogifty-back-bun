import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UsuarioConTipo } from '../../domain/entities/tipo-usuario.entity';
import { LoginUseCase } from '../../application/use-cases/login.use-case';

export class AuthController {
  constructor(private loginUseCase: LoginUseCase) {}

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
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Login exitoso',
          data: result.usuario
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
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Login exitoso',
          data: result.usuario
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
}