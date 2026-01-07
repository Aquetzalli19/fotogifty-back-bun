import { Request, Response } from 'express';
import { PaqueteEntity } from '../../domain/entities/paquete.entity';
import { CrearPaqueteUseCase } from '../../application/use-cases/crear-paquete.use-case';
import { ActualizarPaqueteUseCase } from '../../application/use-cases/actualizar-paquete.use-case';
import { CategoriaRepositoryPort } from '../../domain/ports/categoria.repository.port';
import { PaqueteRepositoryPort } from '../../domain/ports/paquete.repository.port';
import { S3Service } from '../services/s3.service';

export class PaqueteController {
  constructor(
    private crearPaqueteUseCase: CrearPaqueteUseCase,
    private actualizarPaqueteUseCase: ActualizarPaqueteUseCase,
    private paqueteRepository: PaqueteRepositoryPort,
    private categoriaRepository: CategoriaRepositoryPort,
    private s3Service: S3Service
  ) {}

  async crearPaquete(req: Request, res: Response): Promise<void> {
    try {
      const {
        nombre,
        categoria_id,
        descripcion,
        cantidad_fotos,
        precio,
        estado,
        resolucion_foto,
        ancho_foto,
        alto_foto
      } = req.body;

      // Convertir valores de string a los tipos correctos (cuando vienen de form-data)
      const parsedCategoriaId = categoria_id ? parseInt(categoria_id) : undefined;
      const parsedCantidadFotos = parseInt(cantidad_fotos);
      const parsedPrecio = parseFloat(precio);
      const parsedEstado = estado === 'true' || estado === true;
      const parsedResolucionFoto = resolucion_foto ? parseInt(resolucion_foto) : undefined;
      const parsedAnchoFoto = ancho_foto ? parseFloat(ancho_foto) : undefined;
      const parsedAltoFoto = alto_foto ? parseFloat(alto_foto) : undefined;

      // Validar que los campos requeridos estén presentes
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'El nombre del paquete es requerido y debe ser un string no vacío'
        });
        return;
      }

      if (isNaN(parsedCantidadFotos) || parsedCantidadFotos <= 0) {
        res.status(400).json({
          success: false,
          message: 'La cantidad de fotos es requerida y debe ser un número positivo'
        });
        return;
      }

      if (isNaN(parsedPrecio) || parsedPrecio <= 0) {
        res.status(400).json({
          success: false,
          message: 'El precio es requerido y debe ser un número positivo'
        });
        return;
      }

      // Procesar imagen si fue enviada
      let imagenUrl: string | undefined = undefined;
      if (req.file) {
        // Generar key única para S3
        const timestamp = Date.now();
        const key = `paquetes/${timestamp}-${req.file.originalname}`;

        // Subir a S3
        imagenUrl = await this.s3Service.uploadFile(req.file, key);
      }

      // Ejecutar el caso de uso
      const result = await this.crearPaqueteUseCase.execute(
        nombre.trim(),
        parsedCategoriaId,
        descripcion,
        parsedCantidadFotos,
        parsedPrecio,
        parsedEstado,
        parsedResolucionFoto,
        parsedAnchoFoto,
        parsedAltoFoto,
        imagenUrl
      );

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al crear el paquete'
        });
      }
    } catch (error) {
      console.error('Error en crearPaquete:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getPaquetesByCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { categoriaId } = req.params;

      const categoriaIdNum = parseInt(categoriaId, 10);
      if (isNaN(categoriaIdNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }

      // Verificar que la categoría exista
      const categoria = await this.categoriaRepository.findById(categoriaIdNum);
      if (!categoria) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      // Obtener paquetes por categoría
      const paquetes = await this.paqueteRepository.findByCategoriaId(categoriaIdNum);

      res.status(200).json({
        success: true,
        data: paquetes
      });
    } catch (error) {
      console.error('Error en getPaquetesByCategoria:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getAllPaquetes(req: Request, res: Response): Promise<void> {
    try {
      // Obtener parámetro de estado de la query string
      const { estado } = req.query;

      // Convertir el parámetro a booleano si está presente
      let estadoFiltro: boolean | undefined;
      if (estado !== undefined) {
        if (estado === 'true' || estado === '1') {
          estadoFiltro = true;
        } else if (estado === 'false' || estado === '0') {
          estadoFiltro = false;
        }
      }

      // Obtener paquetes con filtro opcional de estado
      const paquetes = await this.paqueteRepository.findAll(estadoFiltro);

      res.status(200).json({
        success: true,
        data: paquetes
      });
    } catch (error) {
      console.error('Error en getAllPaquetes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getPaqueteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de paquete inválido'
        });
        return;
      }

      const paquete = await this.paqueteRepository.findById(idNum);

      if (!paquete) {
        res.status(404).json({
          success: false,
          message: 'Paquete no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: paquete
      });
    } catch (error) {
      console.error('Error en getPaqueteById:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updatePaquete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        nombre,
        categoria_id,
        descripcion,
        cantidad_fotos,
        precio,
        estado,
        resolucion_foto,
        ancho_foto,
        alto_foto
      } = req.body;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de paquete inválido'
        });
        return;
      }

      // Convertir valores de string a los tipos correctos (cuando vienen de form-data)
      const parsedCategoriaId = categoria_id ? parseInt(categoria_id) : undefined;
      const parsedCantidadFotos = cantidad_fotos ? parseInt(cantidad_fotos) : undefined;
      const parsedPrecio = precio ? parseFloat(precio) : undefined;
      const parsedEstado = estado !== undefined ? (estado === 'true' || estado === true) : undefined;
      const parsedResolucionFoto = resolucion_foto ? parseInt(resolucion_foto) : undefined;
      const parsedAnchoFoto = ancho_foto ? parseFloat(ancho_foto) : undefined;
      const parsedAltoFoto = alto_foto ? parseFloat(alto_foto) : undefined;

      // Procesar imagen si fue enviada
      let imagenUrl: string | undefined = undefined;
      if (req.file) {
        // Generar key única para S3
        const timestamp = Date.now();
        const key = `paquetes/${timestamp}-${req.file.originalname}`;

        // Subir a S3
        imagenUrl = await this.s3Service.uploadFile(req.file, key);
      }

      // Ejecutar el caso de uso de actualización
      const result = await this.actualizarPaqueteUseCase.execute(
        idNum,
        nombre,
        parsedCategoriaId,
        descripcion,
        parsedCantidadFotos,
        parsedPrecio,
        parsedEstado,
        parsedResolucionFoto,
        parsedAnchoFoto,
        parsedAltoFoto,
        imagenUrl
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        const statusCode = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al actualizar el paquete'
        });
      }
    } catch (error) {
      console.error('Error en updatePaquete:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async deletePaquete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de paquete inválido'
        });
        return;
      }

      // Verificar que el paquete exista
      const paquete = await this.paqueteRepository.findById(idNum);
      if (!paquete) {
        res.status(404).json({
          success: false,
          message: 'Paquete no encontrado'
        });
        return;
      }

      // Eliminar (desactivar) el paquete
      const eliminado = await this.paqueteRepository.delete(idNum);

      if (eliminado) {
        res.status(200).json({
          success: true,
          message: 'Paquete eliminado exitosamente'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar el paquete'
        });
      }
    } catch (error) {
      console.error('Error en deletePaquete:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}