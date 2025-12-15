import { PaqueteEntity } from '../../domain/entities/paquete.entity';
import { PaqueteRepositoryPort } from '../../domain/ports/paquete.repository.port';
import { CategoriaRepositoryPort } from '../../domain/ports/categoria.repository.port';

interface ActualizarPaqueteResult {
  success: boolean;
  data?: PaqueteEntity;
  message?: string;
  error?: string;
}

export class ActualizarPaqueteUseCase {
  constructor(
    private readonly paqueteRepository: PaqueteRepositoryPort,
    private readonly categoriaRepository: CategoriaRepositoryPort
  ) {}

  async execute(
    id: number,
    nombre?: string,
    categoria_id?: number,
    descripcion?: string,
    cantidad_fotos?: number,
    precio?: number,
    estado?: boolean,
    resolucion_foto?: number,
    ancho_foto?: number,
    alto_foto?: number
  ): Promise<ActualizarPaqueteResult> {
    try {
      // Verificar si el paquete existe
      const paqueteExistente = await this.paqueteRepository.findById(id);
      if (!paqueteExistente) {
        return {
          success: false,
          message: 'El paquete no existe',
          error: 'Paquete no encontrado'
        };
      }

      // Validar campos si están presentes
      if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length === 0)) {
        return {
          success: false,
          message: 'El nombre del paquete debe ser un string no vacío si se proporciona',
          error: 'Nombre inválido'
        };
      }

      if (cantidad_fotos !== undefined && (typeof cantidad_fotos !== 'number' || cantidad_fotos <= 0)) {
        return {
          success: false,
          message: 'La cantidad de fotos debe ser un número positivo si se proporciona',
          error: 'Cantidad de fotos inválida'
        };
      }

      if (precio !== undefined && (typeof precio !== 'number' || precio <= 0)) {
        return {
          success: false,
          message: 'El precio debe ser un número positivo si se proporciona',
          error: 'Precio inválido'
        };
      }

      if (estado !== undefined && typeof estado !== 'boolean') {
        return {
          success: false,
          message: 'El estado debe ser un valor booleano si se proporciona',
          error: 'Estado inválido'
        };
      }

      // Validaciones adicionales para campos opcionales si están presentes
      if (categoria_id !== undefined && typeof categoria_id !== 'number') {
        return {
          success: false,
          message: 'categoria_id debe ser un número si se proporciona',
          error: 'ID de categoría inválido'
        };
      }

      if (resolucion_foto !== undefined && (typeof resolucion_foto !== 'number' || resolucion_foto <= 0)) {
        return {
          success: false,
          message: 'resolucion_foto debe ser un número positivo si se proporciona',
          error: 'Resolución de foto inválida'
        };
      }

      if (ancho_foto !== undefined && (typeof ancho_foto !== 'number' || ancho_foto <= 0)) {
        return {
          success: false,
          message: 'ancho_foto debe ser un número positivo si se proporciona',
          error: 'Ancho de foto inválido'
        };
      }

      if (alto_foto !== undefined && (typeof alto_foto !== 'number' || alto_foto <= 0)) {
        return {
          success: false,
          message: 'alto_foto debe ser un número positivo si se proporciona',
          error: 'Alto de foto inválido'
        };
      }

      // Si se proporciona categoria_id, verificar que la categoría exista
      if (categoria_id !== undefined) {
        const categoria = await this.categoriaRepository.findById(categoria_id);
        if (!categoria) {
          return {
            success: false,
            message: 'La categoría especificada no existe',
            error: 'Categoría no encontrada'
          };
        }
      }

      // Actualizar el paquete
      const paqueteActualizado = {
        ...paqueteExistente,
        id,
        nombre: nombre !== undefined ? nombre.trim() : paqueteExistente.nombre,
        categoria_id: categoria_id !== undefined ? categoria_id : paqueteExistente.categoria_id,
        descripcion: descripcion !== undefined ? descripcion : paqueteExistente.descripcion,
        cantidad_fotos: cantidad_fotos !== undefined ? cantidad_fotos : paqueteExistente.cantidad_fotos,
        precio: precio !== undefined ? precio : paqueteExistente.precio,
        estado: estado !== undefined ? estado : paqueteExistente.estado,
        resolucion_foto: resolucion_foto !== undefined ? resolucion_foto : paqueteExistente.resolucion_foto,
        ancho_foto: ancho_foto !== undefined ? ancho_foto : paqueteExistente.ancho_foto,
        alto_foto: alto_foto !== undefined ? alto_foto : paqueteExistente.alto_foto
      };

      const paqueteGuardado = await this.paqueteRepository.update(paqueteActualizado);

      return {
        success: true,
        data: paqueteGuardado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar el paquete',
        error: error.message
      };
    }
  }
}