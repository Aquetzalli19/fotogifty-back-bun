# Documentación del Sistema de Gestión de Fotos

## Índice
1. [Introducción](#introducción)
2. [Capa de Dominio](#capa-de-dominio)
3. [Capa de Aplicación](#capa-de-aplicación)
4. [Capa de Infraestructura](#capa-de-infraestructura)
5. [Endpoints de la API](#endpoints-de-la-api)
6. [Manejo de Errores](#manejo-de-errores)
7. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

---

## Introducción

El sistema de gestión de fotos es una parte fundamental del API Express Bun que permite a los usuarios subir fotos, asociarlas a pedidos y administrarlas. Este sistema está construido utilizando la arquitectura hexagonal (también conocida como arquitectura de puertos y adaptadores), lo que proporciona una clara separación de responsabilidades y facilita el mantenimiento y la extensión del sistema.

El sistema soporta:
- Subida de fotos al almacenamiento S3
- Asociación de fotos a usuarios y pedidos
- Validación de tipos y tamaños de archivos
- Gestión de metadatos de fotos

---

## Capa de Dominio

### Entidades

#### Foto Entity

La entidad `Foto` representa una foto subida por un usuario al sistema. Incluye información sobre el archivo, su ubicación de almacenamiento y asociaciones a usuarios y pedidos.

```typescript
// src/domain/entities/foto.entity.ts
export interface Foto {
  id?: number;
  usuario_id: number;
  pedido_id?: number;  // Opcional
  item_pedido_id: number;
  nombre_archivo: string;
  ruta_almacenamiento: string;
  tamaño_archivo: number;
  fecha_subida?: Date;
  procesada?: boolean;
}

export class FotoEntity implements Foto {
  // Implementación de la clase con métodos de creación y validación
}
```

**Descripción de campos:**
- `id`: Identificador único de la foto
- `usuario_id`: ID del usuario que subió la foto (obligatorio)
- `pedido_id`: ID del pedido al que está asociada la foto (opcional)
- `item_pedido_id`: ID del ítem del pedido al que está asociada la foto (obligatorio)
- `nombre_archivo`: Nombre original del archivo
- `ruta_almacenamiento`: URL o ruta donde se almacena la foto
- `tamaño_archivo`: Tamaño del archivo en bytes
- `fecha_subida`: Fecha en que se subió la foto
- `procesada`: Indica si la foto ha sido procesada (por defecto false)

### Puertos (Interfaces)

#### FotoRepositoryPort

Define las operaciones de acceso a datos para la entidad `Foto`:

```typescript
// src/domain/ports/foto.repository.port.ts
export interface FotoRepositoryPort {
  save(foto: Foto): Promise<Foto>;
  findById(id: number): Promise<Foto | null>;
  findByUsuarioId(usuarioId: number): Promise<Foto[]>;
}
```

**Descripción de métodos:**
- `save`: Guarda una nueva foto o actualiza una existente
- `findById`: Busca una foto por ID
- `findByUsuarioId`: Busca fotos asociadas a un usuario

---

## Capa de Aplicación

### Casos de Uso (Use Cases)

#### SubirFotoUseCase

El caso de uso `SubirFotoUseCase` se encarga de subir fotos al sistema, manejando la validación de datos, subida al almacenamiento S3 y persistencia en la base de datos.

```typescript
// src/application/use-cases/subir-foto.use-case.ts
export interface SubirFotoRequest {
  file: Express.Multer.File;
  usuarioId: number;
  pedidoId?: number;  // Opcional
  itemPedidoId: number;
}

export class SubirFotoUseCase {
  constructor(
    private readonly s3Service: S3Service,
    private readonly usuarioRepository: UsuarioRepositoryPort,
    private readonly pedidoRepository: PedidoRepositoryPort,
    private readonly fotoRepository: FotoRepositoryPort
  ) {}

  async execute(request: SubirFotoRequest): Promise<Foto> {
    // Implementación del caso de uso
  }
}
```

**Responsabilidades:**
- Validar que el usuario exista
- Validar que el pedido exista (si se proporciona pedidoId)
- Subir el archivo al servicio de almacenamiento (S3)
- Crear el registro de foto en la base de datos
- Devolver la foto creada con información completa

---

## Capa de Infraestructura

### Repositorios

#### PrismaFotoRepository

La implementación `PrismaFotoRepository` es el adaptador concreto de la interfaz `FotoRepositoryPort` que utiliza Prisma como ORM para interactuar con la base de datos MySQL.

```typescript
// src/infrastructure/repositories/prisma-foto.repository.ts
export class PrismaFotoRepository implements FotoRepositoryPort {
  async save(foto: Foto): Promise<Foto> {
    // Implementación con Prisma
  }

  async findById(id: number): Promise<Foto | null> {
    // Implementación con Prisma
  }

  async findByUsuarioId(usuarioId: number): Promise<Foto[]> {
    // Implementación con Prisma
  }

  private toDomain(prismaFoto: any): Foto {
    // Transforma el modelo de Prisma al modelo de dominio
  }
}
```

### Servicios

#### S3Service

El servicio `S3Service` maneja la subida de archivos al almacenamiento en la nube (AWS S3) y devuelve URLs firmadas.

```typescript
// src/infrastructure/services/s3.service.ts
export class S3Service {
  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    // Sube el archivo a S3 y devuelve la URL
  }
}
```

### Controladores

#### FotoController

El controlador `FotoController` maneja las solicitudes HTTP relacionadas con las fotos, actuando como adaptador entre la capa de infraestructura y la capa de aplicación.

```typescript
// src/infrastructure/controllers/foto.controller.ts
export class FotoController {
  constructor(private readonly subirFotoUseCase: SubirFotoUseCase) {}

  async subirFoto(req: Request, res: Response): Promise<void> {
    // Maneja la subida de fotos
  }
}
```

**Responsabilidades:**
- Validar los datos de entrada del cliente
- Extraer parámetros de la solicitud multipart
- Llamar al caso de uso correspondiente
- Formatear y enviar las respuestas HTTP apropiadas
- Manejar los posibles errores y excepciones

---

## Endpoints de la API

Los endpoints relacionados con las fotos están definidos en `/src/infrastructure/routes/foto.routes.ts` y se montan en la ruta base `/api/fotos`.

### POST /api/fotos/upload
**Descripción:** Sube una foto al sistema, opcionalmente asociada a un pedido

**Body (multipart/form-data):**
- `foto`: Archivo de imagen (archivo binario)
- `usuarioId`: ID del usuario que sube la foto (requerido)
- `pedidoId`: ID del pedido al que se asociará la foto (opcional)
- `itemPedidoId`: ID del ítem del pedido al que se asociará la foto (requerido)

**Respuestas:**
- `200`: Foto subida exitosamente
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "url": "https://s3.amazonaws.com/bucket/foto.jpg",
      "filename": "foto.jpg",
      "size": 123456,
      "fecha_subida": "2025-11-23T00:00:00.000Z"
    }
  }
  ```
- `400`: Error en los datos enviados
  ```json
  {
    "success": false,
    "error": "usuarioId e itemPedidoId son requeridos"
  }
  ```
- `500`: Error interno del servidor

---

## Manejo de Errores

El sistema de gestión de fotos implementa un manejo robusto de errores para proporcionar información clara al cliente:

### Validaciones comunes
1. **Campos requeridos faltantes:** Verifica que `usuarioId` y `itemPedidoId` estén presentes
2. **Existencia de entidades relacionadas:** Verifica que el usuario y (si se proporciona) el pedido existan
3. **Tipo de archivo:** Valida que el archivo sea una imagen
4. **Tamaño de archivo:** Verifica que no exceda el límite permitido (10MB)
5. **Restricciones de base de datos:** Maneja errores de clave foránea y otros errores de persistencia

### Mensajes de error específicos
- `"usuarioId e itemPedidoId son requeridos"`: Cuando faltan campos obligatorios
- `"Usuario no encontrado"`: Cuando el usuarioId no existe
- `"Pedido con ID X no encontrado"`: Cuando el pedidoId no existe
- `"El archivo es demasiado grande. Máximo permitido: 10MB."`: Cuando se excede el tamaño máximo

---

## Consideraciones de Seguridad

### Validación de entradas
- Validación de tipos de archivo (solo imágenes permitidas)
- Validación de tamaño de archivo (máximo 10MB)
- Validación de IDs numéricos para evitar inyecciones

### Almacenamiento de archivos
- Uso de nombres únicos para archivos para evitar colisiones
- Almacenamiento en S3 con configuraciones de seguridad apropiadas
- Control de acceso a los archivos en S3

### Control de acceso
- Verificación de que el usuario existe antes de crear la foto
- Validación de que el pedido existe si se proporciona un pedidoId
- Validación de que el itemPedidoId existe y es válido