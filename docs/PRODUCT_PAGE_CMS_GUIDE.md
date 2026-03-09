# Product Page CMS — Guía de Integración Frontend

## Descripción general

El Product Page CMS gestiona **6 secciones globales** de marketing compartidas por **todas** las páginas de detalle de producto. No son por-producto: son datos estáticos de marketing (galería, propuesta de valor, tipos de papel, servicios, etc.).

**Base URL:** `/api/product-page-content`

---

## Estructura de datos

### Jerarquía

```
ProductPageSection
├── slides[]          ← Tarjetas, imágenes, tipos de papel, etc.
│   └── options[]     ← Características anidadas dentro del slide (ej: features de papel)
└── options[]         ← Filas de tabla directas a la sección (ej: sizes_table)
```

### Las 6 secciones fijas

| `section_key` | Descripción | `slide.tipo` | Tiene `options` en slide |
|---|---|---|---|
| `gallery` | Mosaico de imágenes | `gallery_image` | No |
| `why_choose` | Tarjetas de propuesta de valor | `value_card` | No |
| `paper_types` | Pestañas de tipos de papel con características | `paper_type` | Sí (features) |
| `print_services` | Tarjetas de servicios | `service_card` | No |
| `product_types` | Showcase de productos | `product_type` | No |
| `sizes_table` | Tabla comparativa de tamaños | _(sin slides)_ | Sí (filas de tabla) |

---

## Respuesta de `GET /sections`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "section_key": "gallery",
      "titulo": "Imprime Tus Mejores Momentos",
      "subtitulo": "Cada foto cuenta una historia...",
      "descripcion": null,
      "imagen_principal_url": null,
      "orden": 1,
      "activo": true,
      "created_at": "2026-03-08T00:00:00.000Z",
      "updated_at": "2026-03-08T00:00:00.000Z",
      "slides": [
        {
          "id": 1,
          "section_key": "gallery",
          "tipo": "gallery_image",
          "titulo": "Impresión de foto profesional",
          "descripcion": "col-span-2 row-span-2",
          "imagen_url": "/slide1.jpg",
          "icono": null,
          "orden": 1,
          "activo": true,
          "options": []
        }
      ],
      "options": []
    },
    {
      "id": 3,
      "section_key": "paper_types",
      "titulo": "Tipos de Papel",
      "subtitulo": "Elige el acabado perfecto...",
      "slides": [
        {
          "id": 10,
          "tipo": "paper_type",
          "titulo": "Lustre",
          "descripcion": "El acabado preferido por fotógrafos...",
          "imagen_url": "/slide1.jpg",
          "options": [
            { "id": 1, "texto": "Textura semi-mate elegante", "orden": 1 },
            { "id": 2, "texto": "Reduce reflejos y huellas", "orden": 2 }
          ]
        }
      ],
      "options": []
    },
    {
      "id": 6,
      "section_key": "sizes_table",
      "titulo": "Tamaños y Opciones",
      "slides": [],
      "options": [
        {
          "id": 20,
          "section_key": "sizes_table",
          "slide_id": null,
          "texto": "4×6\"",
          "texto_secundario": "10 × 15 cm",
          "texto_terciario": "300 DPI",
          "texto_cuarto": "Estándar",
          "texto_quinto": "$15.00",
          "orden": 1,
          "activo": true
        }
      ]
    }
  ]
}
```

---

## Endpoints de lectura (públicos)

### `GET /api/product-page-content/sections`

Retorna todas las secciones con slides y options anidados.

```ts
// Ejemplo fetch en Next.js
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-page-content/sections`);
const { data } = await res.json();
```

### `GET /api/product-page-content/sections/:sectionKey`

Retorna una sección específica.

```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-page-content/sections/paper_types`);
const { data } = await res.json();
// data.slides[0].options → features del primer tipo de papel
```

---

## Endpoints de escritura (requieren `Authorization: Bearer <token>` de admin)

### Secciones

```bash
# Actualizar campos de una sección
PUT /api/product-page-content/sections/:sectionKey
Content-Type: application/json

{
  "titulo": "Nuevo título",
  "subtitulo": "Nuevo subtítulo",
  "descripcion": "Descripción opcional",
  "imagen_principal_url": "https://cdn.example.com/img.jpg",
  "activo": true
}

# Toggle activo/inactivo
PATCH /api/product-page-content/sections/:sectionKey/toggle
```

### Slides

```bash
# Crear slide
POST /api/product-page-content/slides
Content-Type: application/json

{
  "section_key": "why_choose",
  "tipo": "value_card",
  "titulo": "Nueva ventaja",
  "descripcion": "Descripción de la ventaja",
  "icono": "Star",
  "orden": 7
}

# Actualizar slide
PUT /api/product-page-content/slides/:id
Content-Type: application/json

{
  "titulo": "Título actualizado",
  "imagen_url": "https://cdn.example.com/nueva.jpg",
  "activo": false
}

# Eliminar slide (cascade elimina sus options)
DELETE /api/product-page-content/slides/:id

# Reordenar slides — enviar IDs en el nuevo orden deseado
PUT /api/product-page-content/slides/reorder
Content-Type: application/json

{
  "section_key": "why_choose",
  "slide_ids": [4, 2, 6, 1, 3, 5]
}
```

### Options

```bash
# Crear option de sección (ej: fila de sizes_table)
POST /api/product-page-content/options
Content-Type: application/json

{
  "section_key": "sizes_table",
  "texto": "12×16\"",
  "texto_secundario": "30 × 40 cm",
  "texto_terciario": "300 DPI",
  "texto_cuarto": "Estándar",
  "texto_quinto": "$120.00"
}

# Crear option anidada en un slide (ej: feature de paper_type)
POST /api/product-page-content/options
Content-Type: application/json

{
  "section_key": "paper_types",
  "slide_id": 10,
  "texto": "Nueva característica del papel"
}

# Actualizar option
PUT /api/product-page-content/options/:id
Content-Type: application/json

{
  "texto": "Texto actualizado",
  "texto_quinto": "$130.00",
  "activo": true
}

# Eliminar option
DELETE /api/product-page-content/options/:id

# Reordenar options
PUT /api/product-page-content/options/reorder
Content-Type: application/json

{
  "section_key": "sizes_table",
  "option_ids": [3, 1, 5, 2, 4]
}
```

### Upload de imagen

```bash
POST /api/product-page-content/upload
Content-Type: multipart/form-data

# Campos:
# section_key: string  (ej: "gallery")
# image_type:  "main" | "slide"
# imagen:      File (imagen binaria)

# Respuesta:
{
  "success": true,
  "data": { "url": "https://bucket.s3.amazonaws.com/product-page/gallery/slide/uuid.jpg" },
  "message": "Imagen subida exitosamente"
}
```

```ts
// Ejemplo desde el frontend
async function uploadProductPageImage(file: File, sectionKey: string, imageType: 'main' | 'slide') {
  const formData = new FormData();
  formData.append('section_key', sectionKey);
  formData.append('image_type', imageType);
  formData.append('imagen', file);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-page-content/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const { data } = await res.json();
  return data.url; // URL pública en S3
}
```

---

## Integración en el frontend (Next.js)

### 1. Proxy en `next.config.ts`

```ts
// next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/product-page-content/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/product-page-content/:path*`,
      },
    ];
  },
};
```

### 2. Activar el servicio real

En `src/services/product-page-content.ts`, cambiar:

```ts
// Antes (mock)
const USE_MOCK_DATA = true;

// Después (backend real)
const USE_MOCK_DATA = false;
```

### 3. Verificar el mapper

El mapper en `src/lib/mappers/product-page-mapper.ts` convierte `snake_case` → `camelCase`. Verificar que mapea los campos de `options` correctamente, en especial los nuevos:

| Campo API (`snake_case`) | Campo frontend (`camelCase`) |
|---|---|
| `texto` | `texto` |
| `texto_secundario` | `textoSecundario` |
| `texto_terciario` | `textoTerciario` |
| `texto_cuarto` | `textoCuarto` |
| `texto_quinto` | `textoQuinto` |
| `slide_id` | `slideId` |
| `section_key` | `sectionKey` |
| `imagen_url` | `imagenUrl` |
| `imagen_principal_url` | `imagenPrincipalUrl` |

---

## Lógica de anidación: paper_types

La sección `paper_types` es la única donde los slides tienen options propias. Cada slide de tipo `paper_type` incluye su array `options` con las características del papel:

```ts
// Uso en componente React
const paperTypesSection = sections.find(s => s.section_key === 'paper_types');

paperTypesSection.slides.forEach(paperType => {
  console.log(paperType.titulo);      // "Lustre"
  console.log(paperType.imagen_url);  // "/slide1.jpg"
  console.log(paperType.options);     // [{ texto: "Textura semi-mate..." }, ...]
});
```

---

## Lógica de la tabla de tamaños: sizes_table

La sección `sizes_table` no tiene slides. Sus datos son las `options` a nivel de sección:

```ts
const sizesSection = sections.find(s => s.section_key === 'sizes_table');

sizesSection.options.forEach(row => {
  console.log(row.texto);            // "4×6\""
  console.log(row.texto_secundario); // "10 × 15 cm"
  console.log(row.texto_terciario);  // "300 DPI"
  console.log(row.texto_cuarto);     // "Estándar"
  console.log(row.texto_quinto);     // "$15.00"
});
```

---

## Campos de slide por tipo

| `tipo` | `titulo` | `descripcion` | `imagen_url` | `icono` |
|---|---|---|---|---|
| `gallery_image` | Alt text | Clases CSS del span (`col-span-2`) | Sí | — |
| `value_card` | Título de tarjeta | Texto de tarjeta | — | Nombre de icono Lucide |
| `paper_type` | Nombre del papel | Descripción del papel | Sí | — |
| `service_card` | Nombre del servicio | Descripción | Sí | — |
| `product_type` | Nombre del producto | Descripción | Sí | — |

---

## Pruebas con cURL

```bash
BASE=http://localhost:3001

# Leer todas las secciones (sin auth)
curl "$BASE/api/product-page-content/sections"

# Leer sección específica
curl "$BASE/api/product-page-content/sections/paper_types"

# Login como admin
TOKEN=$(curl -s -X POST "$BASE/api/auth/login/admin" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"tu-password"}' \
  | jq -r '.data.token')

# Actualizar sección
curl -X PUT "$BASE/api/product-page-content/sections/gallery" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"titulo":"Galería de Impresiones Premium"}'

# Crear un value_card en why_choose
curl -X POST "$BASE/api/product-page-content/slides" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "section_key": "why_choose",
    "tipo": "value_card",
    "titulo": "Soporte 24/7",
    "descripcion": "Estamos disponibles para ayudarte en cualquier momento.",
    "icono": "Headset"
  }'

# Crear feature para tipo de papel (slide_id del paper type)
curl -X POST "$BASE/api/product-page-content/options" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"section_key":"paper_types","slide_id":1,"texto":"Durabilidad excepcional"}'

# Crear fila en sizes_table
curl -X POST "$BASE/api/product-page-content/options" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "section_key": "sizes_table",
    "texto": "12x16\"",
    "texto_secundario": "30 × 40 cm",
    "texto_terciario": "300 DPI",
    "texto_cuarto": "Estándar",
    "texto_quinto": "$120.00"
  }'

# Subir imagen
curl -X POST "$BASE/api/product-page-content/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "section_key=gallery" \
  -F "image_type=slide" \
  -F "imagen=@/ruta/a/imagen.jpg"

# Toggle activo de una sección
curl -X PATCH "$BASE/api/product-page-content/sections/sizes_table/toggle" \
  -H "Authorization: Bearer $TOKEN"

# Reordenar slides de why_choose
curl -X PUT "$BASE/api/product-page-content/slides/reorder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"section_key":"why_choose","slide_ids":[4,2,6,1,3,5]}'
```

---

## Re-seed

Si necesitas restaurar los datos iniciales:

```bash
bun run scripts/seed-product-page-content.ts
```

> **Advertencia:** El seed elimina todos los datos existentes de las 3 tablas antes de insertar.

---

## Swagger

Todos los endpoints están documentados en Swagger UI bajo la etiqueta **"Product Page Content"**:

```
http://localhost:3001/api-docs
```
