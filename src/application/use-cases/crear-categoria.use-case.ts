import { CategoriaEntity } from '../../domain/entities/categoria.entity';
import { CategoriaRepositoryPort } from '../../domain/ports/categoria.repository.port';

interface CrearCategoriaResult {
  success: boolean;
  data?: CategoriaEntity;
  message?: string;
  error?: string;
}

export class CrearCategoriaUseCase {
  constructor(private readonly categoriaRepository: CategoriaRepositoryPort) {}

  async execute(nombre: string, descripcion?: string, activo: boolean = true): Promise<CrearCategoriaResult> {
    try {
      // Validar que el nombre no esté vacío
      if (!nombre || nombre.trim().length === 0) {
        return {
          success: false,
          message: 'El nombre de la categoría es requerido',
          error: 'Nombre vacío'
        };
      }

      // Crear la entidad de categoría
      const nuevaCategoria = CategoriaEntity.create(nombre, activo, descripcion);

      // Guardar en la base de datos
      const categoriaGuardada = await this.categoriaRepository.save(nuevaCategoria);

      return {
        success: true,
        data: categoriaGuardada
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear la categoría',
        error: error.message
      };
    }
  }
}