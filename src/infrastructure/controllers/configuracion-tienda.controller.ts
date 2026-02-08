import { Request, Response } from 'express';
import { ObtenerConfiguracionTiendaUseCase } from '@application/use-cases/obtener-configuracion-tienda.use-case';
import { ActualizarConfiguracionTiendaUseCase } from '@application/use-cases/actualizar-configuracion-tienda.use-case';

export class ConfiguracionTiendaController {
  constructor(
    private readonly obtenerConfiguracionTiendaUseCase: ObtenerConfiguracionTiendaUseCase,
    private readonly actualizarConfiguracionTiendaUseCase: ActualizarConfiguracionTiendaUseCase
  ) {}

  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.obtenerConfiguracionTiendaUseCase.execute();

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message || 'Configuración de tienda no encontrada'
        });
      }
    } catch (error: any) {
      console.error('Error obteniendo configuración de tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const {
        nombre,
        direccion,
        ciudad,
        estado,
        codigo_postal,
        pais,
        telefono,
        email,
        latitud,
        longitud,
        horario_lunes_viernes,
        horario_sabado,
        horario_domingo,
        descripcion,
        instrucciones_llegada,
        direccion_maps
      } = req.body;

      // Validaciones básicas
      const camposRequeridos = ['nombre', 'direccion', 'ciudad', 'estado', 'codigo_postal', 'pais', 'telefono', 'latitud', 'longitud'];
      const camposFaltantes = camposRequeridos.filter(campo => req.body[campo] === undefined);

      if (camposFaltantes.length > 0) {
        res.status(400).json({
          success: false,
          message: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
        });
        return;
      }

      // Obtener el ID del usuario autenticado (del middleware de autenticación)
      const usuarioId = (req as any).user?.id;

      const result = await this.actualizarConfiguracionTiendaUseCase.execute(
        {
          nombre,
          direccion,
          ciudad,
          estado,
          codigo_postal,
          pais,
          telefono,
          email,
          latitud: parseFloat(latitud),
          longitud: parseFloat(longitud),
          horario_lunes_viernes,
          horario_sabado,
          horario_domingo,
          descripcion,
          instrucciones_llegada,
          direccion_maps
        },
        usuarioId
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al actualizar la configuración de tienda'
        });
      }
    } catch (error: any) {
      console.error('Error actualizando configuración de tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
