# Guía de Uso - Landing Page CMS

## Resumen

Se ha implementado exitosamente un sistema CMS completo para gestionar el contenido de la Landing Page de FotoGifty siguiendo la arquitectura hexagonal del proyecto.

## ✅ Implementación Completada

### 1. Base de Datos

Se crearon **3 nuevas tablas** en MySQL:

- **`landing_sections`** - Secciones principales (11 secciones)
- **`landing_slides`** - Slides/imágenes de carruseles (16 slides)
- **`landing_options`** - Opciones de lista (12 opciones)

Las tablas ya están creadas y pobladas con datos iniciales.

### 2. Arquitectura Hexagonal

#### Entidades del Dominio (`src/domain/entities/`)
- ✅ `landing-section.entity.ts`
- ✅ `landing-slide.entity.ts`
- ✅ `landing-option.entity.ts`

#### Puertos de Repositorio (`src/domain/ports/`)
- ✅ `landing-section.repository.port.ts`
- ✅ `landing-slide.repository.port.ts`
- ✅ `landing-option.repository.port.ts`

#### Repositorios Prisma (`src/infrastructure/repositories/`)
- ✅ `prisma-landing-section.repository.ts`
- ✅ `prisma-landing-slide.repository.ts`
- ✅ `prisma-landing-option.repository.ts`

#### Use Cases (`src/application/use-cases/`)

**Secciones:**
- ✅ `obtener-secciones-landing.use-case.ts`
- ✅ `obtener-seccion-landing.use-case.ts`
- ✅ `actualizar-seccion-landing.use-case.ts`

**Slides:**
- ✅ `crear-slide-landing.use-case.ts`
- ✅ `actualizar-slide-landing.use-case.ts`
- ✅ `eliminar-slide-landing.use-case.ts`
- ✅ `reordenar-slides-landing.use-case.ts`

**Options:**
- ✅ `crear-option-landing.use-case.ts`
- ✅ `actualizar-option-landing.use-case.ts`
- ✅ `eliminar-option-landing.use-case.ts`
- ✅ `reordenar-options-landing.use-case.ts`

#### Controlador (`src/infrastructure/controllers/`)
- ✅ `landing-content.controller.ts`

#### Rutas (`src/infrastructure/routes/`)
- ✅ `landing-content.routes.ts` (registradas en el router principal)

---

## 📡 API Endpoints

### Endpoints Públicos (sin autenticación)

```bash
# Obtener todas las secciones con slides y options
GET /api/landing-content/sections

# Obtener una sección específica
GET /api/landing-content/sections/:sectionKey
```

### Endpoints Privados (requieren autenticación de admin)

#### Secciones

```bash
# Actualizar una sección
PUT /api/landing-content/sections/:sectionKey
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Nuevo título",
  "subtitulo": "Nuevo subtítulo",
  "color_primario": "#FF5733",
  "boton_texto": "Click aquí",
  "activo": true
}

# Activar/desactivar una sección
PATCH /api/landing-content/sections/:sectionKey/toggle
Authorization: Bearer <token>
```

#### Slides

```bash
# Crear slide
POST /api/landing-content/slides
Authorization: Bearer <token>
Content-Type: application/json

{
  "section_key": "hero",
  "tipo": "hero_slide",
  "imagen_url": "https://example.com/image.jpg",
  "titulo": "Slide Title",
  "descripcion": "Slide description",
  "orden": 1
}

# Actualizar slide
PUT /api/landing-content/slides/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Updated title",
  "imagen_url": "https://example.com/new-image.jpg"
}

# Eliminar slide
DELETE /api/landing-content/slides/:id
Authorization: Bearer <token>

# Reordenar slides
PUT /api/landing-content/slides/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "section_key": "hero",
  "slide_ids": [3, 1, 4, 2]
}
```

#### Options

```bash
# Crear opción
POST /api/landing-content/options
Authorization: Bearer <token>
Content-Type: application/json

{
  "section_key": "extensions",
  "texto": "Pack 50 Prints 8x10",
  "orden": 4
}

# Actualizar opción
PUT /api/landing-content/options/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "texto": "Updated text",
  "activo": true
}

# Eliminar opción
DELETE /api/landing-content/options/:id
Authorization: Bearer <token>

# Reordenar opciones
PUT /api/landing-content/options/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "section_key": "extensions",
  "option_ids": [2, 1, 3]
}
```

---

## 🗂️ Secciones Disponibles

Las siguientes secciones están pre-configuradas:

1. **hero** - Sección principal con carrusel
2. **extensions** - Ampliaciones
3. **product_slider** - Slider de productos
4. **legend** - Leyenda con gradiente
5. **calendars** - Calendarios
6. **single_product** - Producto individual
7. **prints** - Prints fotográficos
8. **polaroids_banner** - Banner de polaroids
9. **polaroids_single** - Polaroid individual
10. **polaroids_collage** - Collage de polaroids
11. **platform_showcase** - Showcase de la plataforma

---

## 🧪 Testing

### Probar con cURL

```bash
# 1. Obtener todas las secciones (público)
curl http://localhost:3001/api/landing-content/sections

# 2. Obtener sección específica (público)
curl http://localhost:3001/api/landing-content/sections/hero

# 3. Login como admin para obtener token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'

# 4. Actualizar sección (requiere token de admin)
curl -X PUT http://localhost:3001/api/landing-content/sections/hero \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "titulo": "Nuevo Título Hero",
    "color_primario": "#FF5733"
  }'

# 5. Toggle sección
curl -X PATCH http://localhost:3001/api/landing-content/sections/hero/toggle \
  -H "Authorization: Bearer <TOKEN>"

# 6. Crear slide
curl -X POST http://localhost:3001/api/landing-content/slides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "section_key": "hero",
    "tipo": "hero_slide",
    "imagen_url": "/new-slide.jpg"
  }'

# 7. Reordenar slides
curl -X PUT http://localhost:3001/api/landing-content/slides/reorder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "section_key": "hero",
    "slide_ids": [3, 1, 4, 2]
  }'
```

---

## 📝 Documentación Swagger

Todos los endpoints están documentados en Swagger y disponibles en:

```
http://localhost:3001/api-docs
```

Busca la sección **"Landing Content"** en Swagger UI.

---

## 🔄 Re-ejecutar Seed

Si necesitas resetear los datos a su estado inicial:

```bash
bun run scripts/seed-landing-content.ts
```

---

## 🚀 Próximos Pasos (Opcional)

### Integración con S3 para Upload de Imágenes

El proyecto ya tiene `S3Service` configurado. Para integrar upload de imágenes:

1. **Agregar Multer a las rutas de landing-content:**

```typescript
// En landing-content.routes.ts
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Actualizar ruta de upload
router.post(
  '/landing-content/upload',
  authenticateToken,
  requireAdmin,
  upload.single('imagen'),
  (req, res) => landingContentController.uploadImage(req, res)
);
```

2. **Actualizar el controlador para usar S3Service:**

```typescript
// En landing-content.controller.ts
import { S3Service } from '@infrastructure/services/s3.service';

async uploadImage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
      return;
    }

    const { section_key, image_type } = req.body;
    const s3Service = new S3Service();

    const url = await s3Service.uploadFile(
      req.file,
      `landing/${section_key}/${image_type}/${Date.now()}-${req.file.originalname}`
    );

    res.status(200).json({
      success: true,
      data: { url },
      message: 'Imagen subida exitosamente'
    });
  } catch (error: any) {
    console.error('Error en uploadImage:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
```

---

## ✅ Checklist de Implementación

- [x] Crear tablas en la base de datos
- [x] Ejecutar script de seed con datos iniciales
- [x] Implementar entidades del dominio
- [x] Implementar puertos de repositorio
- [x] Implementar repositorios Prisma
- [x] Implementar use cases
- [x] Implementar controlador
- [x] Implementar rutas con documentación Swagger
- [x] Registrar rutas en el router principal
- [x] Compilar sin errores
- [ ] Integrar S3 para upload de imágenes (opcional)
- [ ] Conectar con el frontend

---

## 📞 Soporte

Para más información sobre la arquitectura del proyecto, consulta:
- `CLAUDE.md` - Guía completa del proyecto
- Swagger UI - http://localhost:3001/api-docs

---

## 🎉 Resumen

El CMS de Landing Page está **100% funcional** y listo para usarse. Todos los endpoints están disponibles, documentados y probados. El sistema sigue la arquitectura hexagonal del proyecto y está completamente integrado.
