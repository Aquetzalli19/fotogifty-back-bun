import { CategoriaEntity } from '../../domain/entities/categoria.entity';
import { CategoriaRepositoryPort } from '../../domain/ports/categoria.repository.port';

interface ActualizarCategoriaResult {
  success: boolean;
  data?: CategoriaEntity;
  message?: string;
  error?: string;
}

export class ActualizarCategoriaUseCase {
  constructor(private readonly categoriaRepository: CategoriaRepositoryPort) {}

  async execute(
    id: number,
    nombre?: string,
    descripcion?: string,
    activo?: boolean
  ): Promise<ActualizarCategoriaResult> {
    try {
      // Verificar si la categoría existe
      const categoriaExistente = await this.categoriaRepository.findById(id);
      if (!categoriaExistente) {
        return {
          success: false,
          message: 'La categoría no existe',
          error: 'Categoría no encontrada'
        };
      }

      // Validar campos si están presentes
      if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length === 0)) {
        return {
          success: false,
          message: 'El nombre de la categoría debe ser un string no vacío si se proporciona',
          error: 'Nombre inválido'
        };
      }

      if (activo !== undefined && typeof activo !== 'boolean') {
        return {
          success: false,
          message: 'El campo "activo" debe ser un valor booleano si se proporciona',
          error: 'Estado inválido'
        };
      }

      // Actualizar la categoría
      const categoriaActualizada = {
        ...categoriaExistente,
        id,
        nombre: nombre !== undefined ? nombre.trim() : categoriaExistente.nombre,
        descripcion: descripcion !== undefined ? descripcion : categoriaExistente.descripcion,
        activo: activo !== undefined ? activo : categoriaExistente.activo
      };

      const categoriaGuardada = await this.categoriaRepository.update(categoriaActualizada);

      return {
        success: true,
        data: categoriaGuardada
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la categoría',
        error: error.message
      };
    }
  }
}