# Documentación del Sistema de Gestión de Pedidos

## Índice
1. [Introducción](#introducción)
2. [Capa de Dominio](#capa-de-dominio)
3. [Capa de Aplicación](#capa-de-aplicación)
4. [Capa de Infraestructura](#capa-de-infraestructura)
5. [Endpoints de la API](#endpoints-de-la-api)
6. [Esquema de la Base de Datos](#esquema-de-la-base-de-datos)
7. [Flujo de Trabajo](#flujo-de-trabajo)

---

## Introducción

El sistema de gestión de pedidos es una parte fundamental del API Express Bun que permite a los usuarios crear, consultar y gestionar pedidos de fotos impresas. Este sistema está construido utilizando la arquitectura hexagonal (también conocida como arquitectura de puertos y adaptadores), lo que proporciona una clara separación de responsabilidades y facilita el mantenimiento y la extensión del sistema.

El sistema soporta:
- Creación de pedidos con múltiples items
- Seguimiento de estados de los pedidos
- Integración con servicios de pago como Stripe
- Gestión de imágenes asociadas a los pedidos
- Consultas por usuario, estado y otros filtros

---

## Capa de Dominio

### Entidades

#### Pedido Entity

La entidad `Pedido` representa un pedido realizado por un cliente en el sistema. Incluye información sobre el cliente, los items adquiridos, precios, estado del pedido y datos de envío.

```typescript
// src/domain/entities/pedido.entity.ts
export interface DireccionEnvio {
  calle: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  pais: string;
}

export interface ItemPedido {
  id_paquete: number;
  nombre_paquete: string;
  categoria_paquete?: string;
  precio_unitario: number;
  cantidad: number;
  num_fotos_requeridas: number;
}

export enum EstadoPedido {
  PENDIENTE = 'Pendiente',
  ENVIADO = 'Enviado',
  IMPRIMIENDO = 'Imprimiendo',
  EMPAQUETADO = 'Empaquetado',
  EN_REPARTO = 'En reparto',
  ENTREGADO = 'Entregado',
  ARCHIVADO = 'Archivado'
}

export enum EstadoPago {
  PENDIENTE = 'pending',
  PAGADO = 'paid',
  FALLIDO = 'failed',
  REEMBOLSADO = 'refunded'
}

export interface Pedido {
  id?: number;
  id_usuario?: number;
  id_pago_stripe?: string;
  id_sesion_stripe?: string;
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente?: string;
  direccion_envio: DireccionEnvio;
  fecha_pedido: Date;
  items_pedido: ItemPedido[];
  estado: EstadoPedido;
  estado_pago: EstadoPago;
  subtotal: number;
  iva: number;
  total: number;
  imagenes?: string[];
  creado_en?: Date;
  actualizado_en?: Date;
}

export class PedidoEntity implements Pedido {
  // Implementación de la clase con métodos de creación y validación
}
```

**Descripción de campos:**
- `id`: Identificador único del pedido
- `id_usuario`: Relación opcional con el usuario que realizó el pedido
- `id_pago_stripe`: ID de pago de Stripe (para integración con el sistema de pagos)
- `id_sesion_stripe`: ID de sesión de Stripe
- `nombre_cliente`, `email_cliente`, `telefono_cliente`: Información de contacto del cliente
- `direccion_envio`: Objeto que contiene la dirección de envío
- `fecha_pedido`: Fecha en que se realizó el pedido
- `items_pedido`: Array de items que conforman el pedido
- `estado`: Estado actual del pedido (enum `EstadoPedido`)
- `estado_pago`: Estado del pago (enum `EstadoPago`)
- `subtotal`, `iva`, `total`: Campos monetarios
- `imagenes`: Array de URLs de imágenes asociadas al pedido
- `creado_en`, `actualizado_en`: Timestamps de auditoría

### Puertos (Interfaces)

#### PedidoRepositoryPort

Define las operaciones de acceso a datos para la entidad `Pedido`:

```typescript
// src/domain/ports/pedido.repository.port.ts
export interface PedidoRepositoryPort {
  findById(id: number): Promise<Pedido | null>;
  findByUsuarioId(usuarioId: number): Promise<Pedido[]>;
  findByEstado(estado: string): Promise<Pedido[]>;
  create(pedido: Pedido): Promise<Pedido>;
  update(pedido: Pedido): Promise<Pedido>;
  updateEstado(id: number, estado: string): Promise<Pedido | null>;
  delete(id: number): Promise<boolean>;
}
```

**Descripción de métodos:**
- `findById`: Busca un pedido por ID
- `findByUsuarioId`: Busca pedidos asociados a un usuario
- `findByEstado`: Busca pedidos por estado
- `create`: Crea un nuevo pedido
- `update`: Actualiza un pedido existente
- `updateEstado`: Actualiza solo el estado de un pedido
- `delete`: Elimina un pedido

---

## Capa de Aplicación

### Casos de Uso (Use Cases)

#### CrearPedidoUseCase

El caso de uso `CrearPedidoUseCase` se encarga de crear nuevos pedidos en el sistema. Realiza validaciones de negocio antes de persistir el pedido en la base de datos.

```typescript
// src/application/use-cases/crear-pedido.use-case.ts
interface CrearPedidoResult {
  success: boolean;
  data?: PedidoEntity;
  message?: string;
  error?: string;
}

export class CrearPedidoUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepositoryPort,
    private readonly usuarioRepository: UsuarioRepositoryPort,
    private readonly paqueteRepository: PaqueteRepositoryPort
  ) {}

  async execute(
    id_usuario: number | undefined,
    nombre_cliente: string,
    email_cliente: string,
    direccion_envio: any,
    items_pedido: any[],
    subtotal: number,
    iva: number,
    total: number,
    id_pago_stripe?: string,
    id_sesion_stripe?: string,
    telefono_cliente?: string
  ): Promise<CrearPedidoResult> {
    // Implementación del caso de uso
  }
}
```

**Responsabilidades:**
- Validar que los campos requeridos estén presentes
- Verificar que el usuario exista si se proporciona un ID
- Validar que los paquetes en los items existan en el sistema
- Verificar que las propiedades de los items coincidan con las del paquete
- Crear la entidad de pedido y persistirla en la base de datos

**Validaciones realizadas:**
1. Verificación de campos obligatorios (nombre, email, dirección, items, precios)
2. Verificación de existencia del usuario si se proporciona ID
3. Verificación de existencia de los paquetes en los items
4. Verificación de consistencia entre los datos del item y el paquete

#### ActualizarEstadoPedidoUseCase

El caso de uso `ActualizarEstadoPedidoUseCase` permite actualizar el estado de un pedido existente, aplicando validaciones para asegurar que se use un estado válido.

```typescript
// src/application/use-cases/actualizar-estado-pedido.use-case.ts
interface ActualizarEstadoPedidoResult {
  success: boolean;
  data?: PedidoEntity;
  message?: string;
  error?: string;
}

export class ActualizarEstadoPedidoUseCase {
  constructor(private readonly pedidoRepository: PedidoRepositoryPort) {}

  async execute(
    id: number,
    nuevoEstado: EstadoPedido
  ): Promise<ActualizarEstadoPedidoResult> {
    // Implementación del caso de uso
  }
}
```

**Responsabilidades:**
- Validar que el estado sea uno de los valores permitidos
- Verificar que el pedido exista
- Actualizar el estado del pedido en la base de datos

---

## Capa de Infraestructura

### Repositorios

#### PrismaPedidoRepository

La implementación `PrismaPedidoRepository` es el adaptador concreto de la interfaz `PedidoRepositoryPort` que utiliza Prisma como ORM para interactuar con la base de datos MySQL.

```typescript
// src/infrastructure/repositories/prisma-pedido.repository.ts
export class PrismaPedidoRepository implements PedidoRepositoryPort {
  async findById(id: number): Promise<Pedido | null> {
    // Implementación con Prisma
  }

  async findByUsuarioId(usuarioId: number): Promise<Pedido[]> {
    // Implementación con Prisma
  }

  async findByEstado(estado: string): Promise<Pedido[]> {
    // Implementación con Prisma
  }

  async create(pedido: Pedido): Promise<Pedido> {
    // Implementación con Prisma
  }

  async update(pedido: Pedido): Promise<Pedido> {
    // Implementación con Prisma
  }

  async updateEstado(id: number, estado: string): Promise<Pedido | null> {
    // Implementación con Prisma
  }

  async delete(id: number): Promise<boolean> {
    // Implementación con Prisma
  }

  private toDomain(prismaPedido: any): Pedido {
    // Transforma el modelo de Prisma al modelo de dominio
  }
}
```

**Características principales:**
- Mapea entre el modelo de dominio y el modelo de base de datos
- Incluye relaciones con otras entidades como usuario, dirección, estado e items
- Maneja la inclusión de datos relacionados en las consultas
- Implementa el método `toDomain` para transformar resultados de Prisma al modelo de dominio

### Controladores

#### PedidoController

El controlador `PedidoController` maneja las solicitudes HTTP relacionadas con los pedidos, actuando como adaptador entre la capa de infraestructura y la capa de aplicación.

```typescript
// src/infrastructure/controllers/pedido.controller.ts
export class PedidoController {
  constructor(
    private crearPedidoUseCase: CrearPedidoUseCase,
    private actualizarEstadoPedidoUseCase: ActualizarEstadoPedidoUseCase,
    private pedidoRepository: PedidoRepositoryPort,
    private usuarioRepository: UsuarioRepositoryPort,
    private paqueteRepository: PaqueteRepositoryPort
  ) {}

  async crearPedido(req: Request, res: Response): Promise<void> {
    // Maneja la creación de pedidos
  }

  async getPedidoById(req: Request, res: Response): Promise<void> {
    // Maneja la obtención de un pedido por ID
  }

  async getPedidosByUsuarioId(req: Request, res: Response): Promise<void> {
    // Maneja la obtención de pedidos por ID de usuario
  }

  async getPedidosByEstado(req: Request, res: Response): Promise<void> {
    // Maneja la obtención de pedidos por estado
  }

  async updateEstadoPedido(req: Request, res: Response): Promise<void> {
    // Maneja la actualización de estado de un pedido
  }
}
```

**Responsabilidades:**
- Validar los datos de entrada del cliente
- Extraer parámetros de la solicitud
- Llamar a los casos de uso correspondientes
- Formatear y enviar las respuestas HTTP apropiadas
- Manejar los posibles errores y excepciones

---

## Endpoints de la API

Los endpoints relacionados con los pedidos están definidos en `/src/infrastructure/routes/pedido.routes.ts` y se montan en la ruta base `/api/pedidos`.

### POST /api/pedidos
**Descripción:** Crea un nuevo pedido

**Body requerido:**
```json
{
  "id_usuario": 1,
  "nombre_cliente": "Juan Pérez",
  "email_cliente": "juan@ejemplo.com",
  "telefono_cliente": "+34612345678",
  "direccion_envio": {
    "calle": "Calle Falsa 123",
    "ciudad": "Madrid",
    "estado": "Madrid",
    "codigo_postal": "28001",
    "pais": "España"
  },
  "items_pedido": [
    {
      "id_paquete": 1,
      "nombre_paquete": "Paquete Básico",
      "categoria_paquete": "Fotografía Impresa",
      "precio_unitario": 299.99,
      "cantidad": 2,
      "num_fotos_requeridas": 20
    }
  ],
  "id_pago_stripe": "pi_3L1234567890",
  "id_sesion_stripe": "cs_test_1234567890",
  "subtotal": 599.98,
  "iva": 95.99,
  "total": 695.97
}
```

**Respuestas:**
- `201`: Pedido creado exitosamente
- `400`: Datos de entrada inválidos
- `500`: Error interno del servidor

### GET /api/pedidos/:id
**Descripción:** Obtiene un pedido específico por su ID

**Parámetros:**
- `id`: ID del pedido (path parameter)

**Respuestas:**
- `200`: Pedido encontrado
- `400`: ID de pedido inválido
- `404`: Pedido no encontrado
- `500`: Error interno del servidor

### GET /api/pedidos/usuario/:usuarioId
**Descripción:** Obtiene todos los pedidos de un usuario específico

**Parámetros:**
- `usuarioId`: ID del usuario (path parameter)

**Respuestas:**
- `200`: Lista de pedidos del usuario
- `400`: ID de usuario inválido
- `404`: Usuario no encontrado
- `500`: Error interno del servidor

### GET /api/pedidos/estado/:estado
**Descripción:** Obtiene todos los pedidos con un estado específico

**Parámetros:**
- `estado`: Estado del pedido (path parameter) - valores permitidos: "Pendiente", "Enviado", "Imprimiendo", "Empaquetado", "En reparto", "Entregado", "Archivado"

**Respuestas:**
- `200`: Lista de pedidos con el estado especificado
- `400`: Estado no válido
- `500`: Error interno del servidor

### PATCH /api/pedidos/:id/estado
**Descripción:** Actualiza el estado de un pedido específico

**Parámetros:**
- `id`: ID del pedido (path parameter)

**Body requerido:**
```json
{
  "estado": "Enviado"
}
```

**Respuestas:**
- `200`: Estado del pedido actualizado exitosamente
- `400`: ID de pedido inválido o estado no válido
- `404`: Pedido no encontrado
- `500`: Error interno del servidor

### POST /api/pedidos/:id/imagenes
**Descripción:** Sube imágenes relacionadas con un pedido (funcionalidad en desarrollo)

**Parámetros:**
- `id`: ID del pedido (path parameter)

**Body (multipart/form-data):**
- `foto`: Archivo de imagen (formato binario)
- `usuarioId`: ID del usuario
- `itemPedidoId`: ID del ítem del pedido

**Respuestas:**
- `200`: Imagen subida y asociada al pedido exitosamente
- `400`: Error en los datos enviados
- `500`: Error interno del servidor

### POST /api/fotos/upload
**Descripción:** Sube una foto al sistema, opcionalmente asociada a un pedido

**Body (multipart/form-data):**
- `foto`: Archivo de imagen (archivo binario)
- `usuarioId`: ID del usuario que sube la foto (requerido)
- `pedidoId`: ID del pedido al que se asociará la foto (opcional)
- `itemPedidoId`: ID del ítem del pedido al que se asociará la foto (requerido)

**Respuestas:**
- `200`: Foto subida exitosamente
- `400`: Error en los datos enviados (falta usuarioId o itemPedidoId, o pedidoId no existe)
- `500`: Error interno del servidor

---

## Esquema de la Base de Datos

El sistema de pedidos utiliza las siguientes tablas en la base de datos MySQL, definidas en el archivo `/prisma/schema.prisma`:

### Tabla `pedidos`
Almacena la información principal de los pedidos, incluyendo datos de cliente, precios y estado.

**Campos:**
- `id`: Int, clave primaria autoincremental
- `usuario_id`: Int, referencia al usuario que creó el pedido
- `direccion_id`: Int, referencia a la dirección de envío
- `estado_id`: Int, referencia al estado del pedido (relación con `estados_pedido`)
- `fecha_creacion`: DateTime, timestamp de creación
- `fecha_actualizacion`: DateTime, timestamp de última actualización
- `total`: Decimal(10, 2), total del pedido
- `notas`: String?, notas adicionales del pedido
- `id_pago_stripe`: String?, ID de pago de Stripe
- `id_sesion_stripe`: String?, ID de sesión de Stripe
- `nombre_cliente`: String, nombre del cliente
- `email_cliente`: String, email del cliente
- `telefono_cliente`: String?, teléfono del cliente
- `fecha_pedido`: DateTime, fecha del pedido
- `estado_personalizado`: String, estado del pedido (enum como string)
- `estado_pago`: String, estado del pago (enum como string)
- `subtotal`: Decimal(10, 2), subtotal del pedido
- `iva`: Decimal(10, 2), impuesto del pedido

### Tabla `items_pedido`
Almacena los ítems que conforman cada pedido.

**Campos:**
- `id`: Int, clave primaria autoincremental
- `pedido_id`: Int, referencia al pedido (relación con `pedidos`)
- `tipo_item`: String, tipo de ítem
- `paquete_predefinido_id`: Int?, referencia al paquete predefinido (para compatibilidad)
- `cantidad_fotos`: Int, cantidad de fotos (para compatibilidad)
- `precio_unitario`: Decimal(10, 2), precio unitario
- `subtotal`: Decimal(10, 2), subtotal del ítem
- `paquete_id`: Int?, referencia al paquete (nuevo sistema)
- `nombre_paquete`: String?, nombre del paquete
- `categoria_paquete`: String?, categoría del paquete
- `cantidad`: Int?, cantidad (por defecto 1)
- `num_fotos_requeridas`: Int?, número de fotos requeridas para este ítem

### Tabla `estados_pedido`
Define los posibles estados que puede tener un pedido.

**Campos:**
- `id`: Int, clave primaria
- `nombre`: String, nombre del estado
- `descripcion`: String?, descripción del estado

### Relaciones

- `pedidos` a `usuarios`: Muchos a uno (muchos pedidos pueden pertenecer a un usuario)
- `pedidos` a `direcciones`: Muchos a uno (muchos pedidos pueden tener la misma dirección de envío)
- `pedidos` a `estados_pedido`: Muchos a uno (muchos pedidos pueden tener el mismo estado)
- `pedidos` a `items_pedido`: Uno a muchos (un pedido puede tener muchos ítems)
- `items_pedido` a `paquetes_predefinidos`: Muchos a uno (muchos ítems pueden referenciar el mismo paquete)

---

## Flujo de Trabajo

El sistema de gestión de pedidos implementa un flujo de trabajo completo para el manejo de pedidos fotográficos, desde la creación hasta la entrega:

1. **Creación del Pedido:** El cliente selecciona productos, los agrega a un carrito y procede al checkout. La información del pedido se envía al backend donde se valida y se crea el pedido en la base de datos.

2. **Procesamiento del Pago:** El sistema integra con Stripe para procesar el pago de forma segura.

3. **Seguimiento de Estado:** El pedido comienza en estado "Pendiente" y se actualiza según el progreso:
   - Pendiente → Enviado (cuando el cliente sube las fotos)
   - Enviado → Imprimiendo (cuando comienza la impresión)
   - Imprimiendo → Empaquetado (cuando se completa la impresión)
   - Empaquetado → En reparto (cuando se envía al cliente)
   - En reparto → Entregado (cuando se confirma la entrega)
   - Entregado → Archivado (después de un período de tiempo)

4. **Subida de Imágenes:** El cliente puede subir imágenes relacionadas con su pedido al almacenamiento S3.

5. **Consulta de Pedidos:** Los clientes pueden consultar sus pedidos por ID, por usuario o por estado. Los administradores pueden ver pedidos según diferentes filtros.

La arquitectura hexagonal asegura que la lógica de negocio esté aislada de los detalles de implementación, lo que facilita el mantenimiento y la evolución del sistema.