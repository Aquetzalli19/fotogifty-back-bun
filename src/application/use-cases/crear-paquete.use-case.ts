import { PaqueteEntity } from '../../domain/entities/paquete.entity';
import { PaqueteRepositoryPort } from '../../domain/ports/paquete.repository.port';
import { CategoriaRepositoryPort } from '../../domain/ports/categoria.repository.port';

interface CrearPaqueteResult {
  success: boolean;
  data?: PaqueteEntity;
  message?: string;
  error?: string;
}

export class CrearPaqueteUseCase {
  constructor(
    private readonly paqueteRepository: PaqueteRepositoryPort,
    private readonly categoriaRepository: CategoriaRepositoryPort
  ) {}

  async execute(
    nombre: string,
    categoria_id: number | undefined,
    descripcion: string | undefined,
    cantidad_fotos: number,
    precio: number,
    estado: boolean,
    resolucion_foto?: number,
    ancho_foto?: number,
    alto_foto?: number,
    imagen_url?: string,
    template_url?: string,
    templates_calendario?: Record<string, string>,
    template_key?: string,
    templates_calendario_keys?: Record<string, string>
  ): Promise<CrearPaqueteResult> {
    try {
      // Validar que el nombre no esté vacío
      if (!nombre || nombre.trim().length === 0) {
        return {
          success: false,
          message: 'El nombre del paquete es requerido',
          error: 'Nombre vacío'
        };
      }

      // Validar que cantidad_fotos sea un número positivo
      if (cantidad_fotos <= 0) {
        return {
          success: false,
          message: 'La cantidad de fotos debe ser un número positivo',
          error: 'Cantidad de fotos inválida'
        };
      }

      // Validar que precio sea un número positivo
      if (precio <= 0) {
        return {
          success: false,
          message: 'El precio debe ser un número positivo',
          error: 'Precio inválido'
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

      // Crear la entidad de paquete
      const nuevoPaquete = PaqueteEntity.create(
        nombre,
        cantidad_fotos,
        precio,
        estado,
        categoria_id,
        descripcion,
        resolucion_foto,
        ancho_foto,
        alto_foto,
        imagen_url,
        template_url,
        templates_calendario,
        template_key,
        templates_calendario_keys
      );

      // Guardar en la base de datos
      const paqueteGuardado = await this.paqueteRepository.save(nuevoPaquete);

      return {
        success: true,
        data: paqueteGuardado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el paquete',
        error: error.message
      };
    }
  }
}