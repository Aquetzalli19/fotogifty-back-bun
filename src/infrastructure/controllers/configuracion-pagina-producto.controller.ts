import { Request, Response } from 'express';
import { ListarConfiguracionesPaginaProductoUseCase } from '@application/use-cases/listar-configuraciones-pagina-producto.use-case';
import { ObtenerConfiguracionPaginaProductoUseCase } from '@application/use-cases/obtener-configuracion-pagina-producto.use-case';
import { ResolverConfiguracionPaginaProductoUseCase } from '@application/use-cases/resolver-configuracion-pagina-producto.use-case';
import { CrearConfiguracionPaginaProductoUseCase } from '@application/use-cases/crear-configuracion-pagina-producto.use-case';
import { ActualizarConfiguracionPaginaProductoUseCase } from '@application/use-cases/actualizar-configuracion-pagina-producto.use-case';
import { EliminarConfiguracionPaginaProductoUseCase } from '@application/use-cases/eliminar-configuracion-pagina-producto.use-case';
import { CrearSeccionPaginaProductoUseCase } from '@application/use-cases/crear-seccion-pagina-producto.use-case';
import { ActualizarSeccionPaginaProductoUseCase } from '@application/use-cases/actualizar-seccion-pagina-producto.use-case';
import { EliminarSeccionPaginaProductoUseCase } from '@application/use-cases/eliminar-seccion-pagina-producto.use-case';
import { ReordenarSeccionesPaginaProductoUseCase } from '@application/use-cases/reordenar-secciones-pagina-producto.use-case';
import { ToggleSeccionPaginaProductoUseCase } from '@application/use-cases/toggle-seccion-pagina-producto.use-case';
import { CrearPestanaContenidoUseCase } from '@application/use-cases/crear-pestana-contenido.use-case';
import { ActualizarPestanaContenidoUseCase } from '@application/use-cases/actualizar-pestana-contenido.use-case';
import { EliminarPestanaContenidoUseCase } from '@application/use-cases/eliminar-pestana-contenido.use-case';
import { ReordenarPestanasContenidoUseCase } from '@application/use-cases/reordenar-pestanas-contenido.use-case';
import { CrearCaracteristicaUseCase } from '@application/use-cases/crear-caracteristica.use-case';
import { ActualizarCaracteristicaUseCase } from '@application/use-cases/actualizar-caracteristica.use-case';
import { EliminarCaracteristicaUseCase } from '@application/use-cases/eliminar-caracteristica.use-case';
import { ReordenarCaracteristicasUseCase } from '@application/use-cases/reordenar-caracteristicas.use-case';
import { S3Service } from '@infrastructure/services/s3.service';
import { randomUUID } from 'crypto';
import path from 'path';

export class ConfiguracionPaginaProductoController {
  constructor(
    private readonly listarUseCase: ListarConfiguracionesPaginaProductoUseCase,
    private readonly obtenerUseCase: ObtenerConfiguracionPaginaProductoUseCase,
    private readonly resolverUseCase: ResolverConfiguracionPaginaProductoUseCase,
    private readonly crearUseCase: CrearConfiguracionPaginaProductoUseCase,
    private readonly actualizarUseCase: ActualizarConfiguracionPaginaProductoUseCase,
    private readonly eliminarUseCase: EliminarConfiguracionPaginaProductoUseCase,
    private readonly crearSeccionUseCase: CrearSeccionPaginaProductoUseCase,
    private readonly actualizarSeccionUseCase: ActualizarSeccionPaginaProductoUseCase,
    private readonly eliminarSeccionUseCase: EliminarSeccionPaginaProductoUseCase,
    private readonly reordenarSeccionesUseCase: ReordenarSeccionesPaginaProductoUseCase,
    private readonly toggleSeccionUseCase: ToggleSeccionPaginaProductoUseCase,
    private readonly crearPestanaUseCase: CrearPestanaContenidoUseCase,
    private readonly actualizarPestanaUseCase: ActualizarPestanaContenidoUseCase,
    private readonly eliminarPestanaUseCase: EliminarPestanaContenidoUseCase,
    private readonly reordenarPestanasUseCase: ReordenarPestanasContenidoUseCase,
    private readonly crearCaracteristicaUseCase: CrearCaracteristicaUseCase,
    private readonly actualizarCaracteristicaUseCase: ActualizarCaracteristicaUseCase,
    private readonly eliminarCaracteristicaUseCase: EliminarCaracteristicaUseCase,
    private readonly reordenarCaracteristicasUseCase: ReordenarCaracteristicasUseCase,
    private readonly s3Service: S3Service
  ) {}

  // ============================================
  // CONFIGURACIONES
  // ============================================

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listarUseCase.execute();
      if (result.success) {
        res.status(200).json({ success: true, datos: result.data });
      } else {
        res.status(500).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.obtenerUseCase.execute(id);
      if (result.success) {
        res.status(200).json({ success: true, datos: result.data });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async resolver(req: Request, res: Response): Promise<void> {
    try {
      const producto_id = req.query.producto_id ? parseInt(req.query.producto_id as string, 10) : undefined;
      const categoria_id = req.query.categoria_id ? parseInt(req.query.categoria_id as string, 10) : undefined;

      const result = await this.resolverUseCase.execute(producto_id, categoria_id);
      if (result.success) {
        res.status(200).json({ success: true, datos: result.data });
      } else {
        res.status(500).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, alcance, activo, categoria_id, producto_id } = req.body;

      const result = await this.crearUseCase.execute(
        nombre,
        alcance,
        activo,
        categoria_id,
        producto_id
      );

      if (result.success) {
        res.status(201).json({ success: true, datos: result.data, message: result.message });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.actualizarUseCase.execute(id, req.body);
      if (result.success) {
        res.status(200).json({ success: true, datos: result.data, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.eliminarUseCase.execute(id);
      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async subirImagen(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen' });
        return;
      }

      const { config_id, section_id } = req.body;
      const scope = section_id ? `seccion-${section_id}` : 'general';
      const configPart = config_id ? config_id : 'new';
      const ext = path.extname(req.file.originalname) || '.jpg';
      const s3Key = `pagina-producto/${configPart}/${scope}/${randomUUID()}${ext}`;

      await this.s3Service.uploadFile(req.file, s3Key);

      res.status(200).json({ success: true, datos: { url: s3Key } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // SECCIONES
  // ============================================

  async crearSeccion(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      if (isNaN(configId)) {
        res.status(400).json({ success: false, message: 'configId inválido' });
        return;
      }

      const { tipo, titulo, activo, estilo, configuracion } = req.body;

      const result = await this.crearSeccionUseCase.execute(
        configId,
        tipo,
        titulo,
        activo,
        estilo,
        configuracion
      );

      if (result.success) {
        res.status(201).json({ success: true, datos: result.data, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async actualizarSeccion(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      if (isNaN(configId) || isNaN(sectionId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.actualizarSeccionUseCase.execute(configId, sectionId, req.body);
      if (result.success) {
        res.status(200).json({ success: true, datos: result.data, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async eliminarSeccion(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      if (isNaN(configId) || isNaN(sectionId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.eliminarSeccionUseCase.execute(configId, sectionId);
      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async reordenarSecciones(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      if (isNaN(configId)) {
        res.status(400).json({ success: false, message: 'configId inválido' });
        return;
      }

      const { section_ids } = req.body;
      const result = await this.reordenarSeccionesUseCase.execute(configId, section_ids);
      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async toggleSeccion(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      if (isNaN(configId) || isNaN(sectionId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.toggleSeccionUseCase.execute(configId, sectionId);
      if (result.success) {
        res.status(200).json({ success: true, datos: result.data, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // PESTAÑAS
  // ============================================

  async crearPestana(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      if (isNaN(configId) || isNaN(sectionId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const { titulo, contenido, activo, usar_datos_producto, campo_datos_producto } = req.body;

      const result = await this.crearPestanaUseCase.execute(
        configId,
        sectionId,
        titulo,
        contenido,
        activo,
        usar_datos_producto,
        campo_datos_producto
      );

      if (result.success) {
        res.status(201).json({ success: true, datos: result.data, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async actualizarPestana(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      const pestanaId = parseInt(req.params.pestanaId, 10);
      if (isNaN(configId) || isNaN(sectionId) || isNaN(pestanaId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.actualizarPestanaUseCase.execute(
        configId,
        sectionId,
        pestanaId,
        req.body
      );

      if (result.success) {
        res.status(200).json({ success: true, datos: result.data, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async eliminarPestana(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      const pestanaId = parseInt(req.params.pestanaId, 10);
      if (isNaN(configId) || isNaN(sectionId) || isNaN(pestanaId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.eliminarPestanaUseCase.execute(configId, sectionId, pestanaId);
      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async reordenarPestanas(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      if (isNaN(configId) || isNaN(sectionId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const { pestana_ids } = req.body;
      const result = await this.reordenarPestanasUseCase.execute(configId, sectionId, pestana_ids);
      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // CARACTERÍSTICAS
  // ============================================

  async crearCaracteristica(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      if (isNaN(configId) || isNaN(sectionId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const { titulo, descripcion, icono, activo } = req.body;

      const result = await this.crearCaracteristicaUseCase.execute(
        configId,
        sectionId,
        titulo,
        descripcion,
        icono,
        activo
      );

      if (result.success) {
        res.status(201).json({ success: true, datos: result.data, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async actualizarCaracteristica(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      const caracteristicaId = parseInt(req.params.caracteristicaId, 10);
      if (isNaN(configId) || isNaN(sectionId) || isNaN(caracteristicaId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.actualizarCaracteristicaUseCase.execute(
        configId,
        sectionId,
        caracteristicaId,
        req.body
      );

      if (result.success) {
        res.status(200).json({ success: true, datos: result.data, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async eliminarCaracteristica(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      const caracteristicaId = parseInt(req.params.caracteristicaId, 10);
      if (isNaN(configId) || isNaN(sectionId) || isNaN(caracteristicaId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const result = await this.eliminarCaracteristicaUseCase.execute(
        configId,
        sectionId,
        caracteristicaId
      );

      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async reordenarCaracteristicas(req: Request, res: Response): Promise<void> {
    try {
      const configId = parseInt(req.params.configId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);
      if (isNaN(configId) || isNaN(sectionId)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const { caracteristica_ids } = req.body;
      const result = await this.reordenarCaracteristicasUseCase.execute(
        configId,
        sectionId,
        caracteristica_ids
      );

      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(result.notFound ? 404 : 400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
}
