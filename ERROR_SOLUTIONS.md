# Solución de errores comunes en Express Bun API

## Índice
1. [Error de restricción de clave foránea en la subida de fotos](#error-de-restricción-de-clave-foránea-en-la-subida-de-fotos)

---

## Error de restricción de clave foránea en la subida de fotos

### Problema
Al intentar subir una foto a través de la ruta `http://localhost:3001/api/fotos/upload`, se recibe el siguiente error:

```
{
    "success": false,
    "error": "\nInvalid `prisma.fotos.create()` invocation in\n/Users/emilianoaquetzalliobregonreyes/Documents/express-bun-api/src/infrastructure/repositories/prisma-foto.repository.ts:7:40\n\n  4 \n  5 export class PrismaFotoRepository implements FotoRepositoryPort {\n  6   async save(foto: Foto): Promise<Foto> {\n  7     const created = await prisma.fotos.create(\nForeign key constraint violated on the fields: (`pedido_id`)"
}
```

### Causa
El error ocurre porque estás intentando crear un registro en la tabla `fotos` con un `pedido_id` que no existe en la tabla `pedidos`. La base de datos tiene una restricción de clave foránea que obliga a que cada `pedido_id` en la tabla `fotos` tenga una entrada correspondiente en la tabla `pedidos`.

Según el esquema actual en `schema.prisma`, el campo `pedido_id` en la tabla `fotos` es obligatorio:
```
model fotos {
  id                  Int          @id @default(autoincrement())
  usuario_id          Int
  pedido_id           Int          // Campo obligatorio (sin ?)
  item_pedido_id      Int
  ...
}
```

Y la relación está definida como obligatoria:
```
pedido             pedidos      @relation(fields: [pedido_id], references: [id])
```

### Soluciones

#### Solución 1: Asegurar que el pedido exista antes de subir la foto
1. Verifica que el pedido con el ID especificado exista en la base de datos
2. Puedes hacer esto consultando la tabla de pedidos antes de intentar subir la foto
3. Si no existen pedidos, puedes crear uno primero o dejar el campo `pedido_id` como opcional (si es apropiado para tu lógica de negocio)

#### Solución 2: Hacer que el campo pedido_id sea opcional en la tabla fotos (RECOMENDADA)
1. Modifica el esquema de Prisma en `schema.prisma`:
```
model fotos {
  id                  Int          @id @default(autoincrement())
  usuario_id          Int
  pedido_id           Int?         // Cambiado a opcional con ?
  item_pedido_id      Int
  nombre_archivo      String       @db.VarChar(255)
  ruta_almacenamiento String       @db.VarChar(500)
  tamaño_archivo      Int
  fecha_subida        DateTime     @default(now())
  procesada           Boolean      @default(false)

  // Relaciones
  usuario             usuarios     @relation(fields: [usuario_id], references: [id])
  pedido             pedidos?     @relation(fields: [pedido_id], references: [id]) // Relación opcional
  item_pedido        items_pedido @relation(fields: [item_pedido_id], references: [id])
  calendarios        calendario_fotos[]
}
```

2. Luego ejecuta las migraciones:
```
bunx prisma db push
```

3. Actualiza el cliente de Prisma:
```
bunx prisma generate
```

#### Solución 3: Validar la existencia del pedido antes de crear la foto
Modifica la implementación del caso de uso para verificar la existencia del pedido antes de crear la foto:

```typescript
// src/application/use-cases/subir-foto.use-case.ts
import { S3Service } from '../../infrastructure/services/s3.service';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port'; // Importar el repositorio de pedidos
import { FotoRepositoryPort } from '../../domain/ports/foto.repository.port';
import { Foto } from '../../domain/entities/foto.entity';

export interface SubirFotoRequest {
  file: Express.Multer.File;
  usuarioId: number;
  pedidoId: number;
  itemPedidoId: number;
}

export class SubirFotoUseCase {
  constructor(
    private readonly s3Service: S3Service,
    private readonly usuarioRepository: UsuarioRepositoryPort,
    private readonly pedidoRepository: PedidoRepositoryPort, // Agregar el repositorio de pedidos
    private readonly fotoRepository: FotoRepositoryPort
  ) {}

  async execute(request: SubirFotoRequest): Promise<Foto> {
    const { file, usuarioId, pedidoId, itemPedidoId } = request;

    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que el pedido existe (si se proporciona)
    if (pedidoId) {
      const pedido = await this.pedidoRepository.findById(pedidoId);
      if (!pedido) {
        throw new Error(`El pedido con ID ${pedidoId} no existe`);
      }
    }

    // Generar key único para S3
    const timestamp = Date.now();
    const key = `fotos/${usuarioId}/${timestamp}-${file.originalname}`;

    // Subir archivo a S3
    const url = await this.s3Service.uploadFile(file, key);

    // Crear registro en base de datos
    const foto: Foto = {
      usuario_id: usuarioId,
      pedido_id: pedidoId,
      item_pedido_id: itemPedidoId,
      nombre_archivo: file.originalname,
      ruta_almacenamiento: url,
      tamaño_archivo: file.size
    };

    return await this.fotoRepository.save(foto);
  }
}
```

Y actualiza el constructor del FotoController para inyectar el PedidoRepositoryPort.

### Recomendación
La solución 2 (hacer que pedido_id sea opcional) es probablemente la más adecuada si la subida de fotos puede ocurrir tanto con pedidos existentes como en otros contextos (por ejemplo, para una galería de usuario o para previsualización).

### Comprobación de pedidos en la base de datos
Antes de implementar cualquier solución, puedes verificar si tienes pedidos en tu base de datos ejecutando:

```sql
SELECT * FROM pedidos LIMIT 5;
```

O a través de Prisma:
```bash
bun run prisma db seed
```

### Pasos para implementar la solución 2 (recomendada)
1. Actualiza el archivo `prisma/schema.prisma` con `pedido_id` como opcional
2. Ejecuta las migraciones: `bunx prisma db push`
3. Genera el cliente de Prisma: `bunx prisma generate`
4. Actualiza tu código para manejar el campo `pedido_id` como opcional si es necesario
5. Prueba nuevamente la subida de fotos

### Prueba
Después de aplicar la solución, intenta subir una foto nuevamente:
```
curl -X POST -F "foto=@ruta/a/tu/imagen.jpg" -F "usuarioId=1" -F "pedidoId=1" -F "itemPedidoId=1" http://localhost:3001/api/fotos/upload
```

O si decides hacer opcional el pedido_id:
```
curl -X POST -F "foto=@ruta/a/tu/imagen.jpg" -F "usuarioId=1" -F "itemPedidoId=1" http://localhost:3001/api/fotos/upload
```

---

## Error de restricción de clave foránea en item_pedido_id

### Problema
Después de resolver el problema con `pedido_id`, ahora se encuentra un nuevo error de restricción de clave foránea con `item_pedido_id`:

```
PrismaClientKnownRequestError:
Invalid `prisma.fotos.create()` invocation in
/Users/emilianoaquetzalliobregonreyes/Documents/express-bun-api/src/infrastructure/repositories/prisma-foto.repository.ts:7:40

  4
  5 export class PrismaFotoRepository implements FotoRepositoryPort {
  6   async save(foto: Foto): Promise<Foto> {
  7     const created = await prisma.fotos.create(
Foreign key constraint violated on the fields: (`item_pedido_id`)
```

### Causa
Este error ocurre porque estás intentando crear un registro en la tabla `fotos` con un `item_pedido_id` que no existe en la tabla `items_pedido`.

### Solución

#### Opción 1: Asegurar que el item_pedido_id exista
1. Verifica que existan registros en la tabla `items_pedido`:
   ```sql
   SELECT * FROM items_pedido LIMIT 5;
   ```

2. Si no hay registros, debes crear un pedido primero, lo que debería crear automáticamente items de pedido.

#### Opción 2: Hacer que item_pedido_id sea opcional
Similar a la solución para `pedido_id`, puedes considerar hacer `item_pedido_id` opcional si tu aplicación permite subir fotos que no están asociadas directamente a un ítem de pedido.

### Verificación
Puedes verificar si tienes registros en la tabla `items_pedido` ejecutando:
```bash
bunx prisma db shell
```
Y luego:
```sql
SELECT COUNT(*) FROM items_pedido;
SELECT * FROM items_pedido LIMIT 5;
```

Si no tienes registros en `items_pedido` o `pedidos`, necesitarás crearlos primero. Puedes usar un script de seeding como el siguiente:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    // Check if estados_pedido with id=1 exists, if not create it
    let estado = await prisma.estados_pedido.findUnique({
      where: { id: 1 }
    });

    if (!estado) {
      estado = await prisma.estados_pedido.create({
        data: {
          id: 1,
          nombre: "Pendiente",
          descripcion: "Pedido pendiente de procesar"
        }
      });
    }

    // Check if tipo_paquete with id=1 exists, if not create it
    let tipoPaquete = await prisma.tipo_paquete.findUnique({
      where: { id: 1 }
    });

    if (!tipoPaquete) {
      tipoPaquete = await prisma.tipo_paquete.create({
        data: {
          id: 1,
          nombre: "Básico",
          descripcion: "Paquete básico de fotografía"
        }
      });
    }

    // Create a sample category
    const category = await prisma.categorias.create({
      data: {
        nombre: "Fotografía Impresa",
        descripcion: "Paquetes de fotografía impresa"
      }
    });

    // Create a sample package
    const paquete = await prisma.paquetes_predefinidos.create({
      data: {
        categoria_id: category.id,
        tipo_paquete_id: tipoPaquete.id,
        nombre: "Paquete Básico",
        descripcion: "Paquete básico de fotografía impresa",
        cantidad_fotos: 10,
        precio: 299.99,
      }
    });

    // Create a sample order (assuming you have a user with id 1 and address)
    const order = await prisma.pedidos.create({
      data: {
        usuario_id: 1, // Debes tener un usuario existente
        direccion_id: 1, // Debes tener una dirección existente
        estado_id: estado.id,
        id_pago_stripe: "pi_sample123",
        id_sesion_stripe: "cs_test_sample123",
        nombre_cliente: "Nombre del Cliente",
        email_cliente: "cliente@ejemplo.com",
        telefono_cliente: "+34612345678",
        fecha_pedido: new Date(),
        estado_personalizado: "Pendiente",
        estado_pago: "paid",
        subtotal: 299.99,
        iva: 47.99,
        total: 347.98,
        items: {
          create: {
            tipo_item: "Paquete",
            paquete_id: paquete.id,
            nombre_paquete: "Paquete Básico",
            categoria_paquete: "Fotografía Impresa",
            precio_unitario: 299.99,
            cantidad_fotos: 10,
            subtotal: 299.99,
            cantidad: 1,
            num_fotos_requeridas: 10
          }
        }
      }
    });

    console.log('Created order:', order.id);

    // Get the item_pedido that was created with the order
    const itemPedido = await prisma.items_pedido.findFirst({
      where: { pedido_id: order.id }
    });

    console.log('Database seeding completed successfully!');
    console.log('Created order with ID:', order.id);
    console.log('Created item_pedido with ID:', itemPedido?.id);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
```

### Solución Final Comprobada
Después de ejecutar el script de seeding, ahora tienes:
- 1 usuario (ID: 1)
- 1 pedido (ID: 1)
- 1 item_pedido (ID: 1)

Puedes probar la subida de fotos con los IDs válidos:
```
curl -X POST -F "foto=@ruta/a/tu/imagen.jpg" -F "usuarioId=1" -F "pedidoId=1" -F "itemPedidoId=1" http://localhost:3001/api/fotos/upload
```

Esto debería funcionar correctamente ahora que tienes los registros necesarios en la base de datos.