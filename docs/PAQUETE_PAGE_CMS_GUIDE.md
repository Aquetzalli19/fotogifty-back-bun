# Per-Product CMS — Guía de Integración Frontend

## Descripción general

El Per-Product CMS permite que **cada paquete** tenga su propio contenido de marketing para las 6 secciones de la página de producto. Si un paquete no tiene override para una sección, el frontend recibe automáticamente el contenido global.

### Cadena de fallback
```
Per-producto → Global CMS → Defaults estáticos (solo frontend)
```

**Base URL:** `/api/paquetes/:paqueteId/page-content`

---

## Cómo funciona el sistema

- Las tablas globales (`product_page_*`) **no se modifican** — siguen siendo la fuente global.
- Las tablas per-producto (`paquete_page_*`) almacenan **solo las secciones que tienen override**.
- El endpoint `/merged` aplica el fallback automáticamente: retorna 6 secciones siempre, mezclando per-producto y global según existan.
- El campo `_source` en cada sección indica si viene de `"per_product"` o `"global"` — útil para el panel admin.

### Dato clave: secciones por-producto son opt-in

No existen por defecto. Para tener un override en un paquete, hay dos caminos:
1. **PUT** `/sections/:sectionKey` — crear/editar la sección manualmente
2. **POST** `/clone-from-global` — copiar el contenido global como punto de partida

---

## Respuesta de `GET /merged`

Siempre retorna las **6 secciones** en orden, con slides y options anidados, idéntico al formato del CMS global más el campo `_source`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paquete_id": 42,
      "section_key": "gallery",
      "titulo": "Galería personalizada para este paquete",
      "subtitulo": "...",
      "imagen_principal_url": null,
      "orden": 1,
      "activo": true,
      "slides": [
        {
          "id": 101,
          "paquete_id": 42,
          "section_key": "gallery",
          "tipo": "gallery_image",
          "titulo": "Foto especial",
          "descripcion": "col-span-2",
          "imagen_url": "https://s3.amazonaws.com/paquetes/42/...",
          "icono": null,
          "orden": 1,
          "activo": true,
          "options": []
        }
      ],
      "options": [],
      "_source": "per_product"
    },
    {
      "id": 2,
      "section_key": "why_choose",
      "titulo": "Por Qué Elegir FotoGifty",
      "slides": [...],
      "options": [],
      "_source": "global"
    }
  ]
}
```

> Las secciones con `_source: "global"` tienen `id` y datos del CMS global (sin `paquete_id`).
> Las secciones con `_source: "per_product"` tienen `paquete_id` y datos propios del paquete.

---

## Respuesta de `GET /status`

```json
{
  "success": true,
  "data": [
    { "section_key": "gallery",       "has_override": true  },
    { "section_key": "why_choose",    "has_override": false },
    { "section_key": "paper_types",   "has_override": false },
    { "section_key": "print_services","has_override": true  },
    { "section_key": "product_types", "has_override": false },
    { "section_key": "sizes_table",   "has_override": false }
  ]
}
```

---

## Endpoints

### Lectura (públicos)

```bash
# Contenido completo con fallback aplicado — el que usa el frontend
GET /api/paquetes/:paqueteId/page-content/merged
```

### Solo admin (requieren `Authorization: Bearer <token>`)

```bash
# Qué secciones tienen override activo
GET /api/paquetes/:paqueteId/page-content/status

# Solo las secciones con override (sin fallback)
GET /api/paquetes/:paqueteId/page-content/sections
```

---

## CRUD de secciones (admin)

### Crear o actualizar override — PUT (upsert)

```bash
PUT /api/paquetes/:paqueteId/page-content/sections/:sectionKey
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Galería exclusiva para el paquete premium",
  "subtitulo": "Imágenes curadas para tu experiencia",
  "descripcion": "Descripción opcional",
  "imagen_principal_url": "https://cdn.example.com/img.jpg",
  "activo": true
}
```

**Respuesta** — incluye la sección completa con slides y options anidados:
```json
{
  "success": true,
  "data": {
    "id": 5,
    "paquete_id": 42,
    "section_key": "gallery",
    "titulo": "Galería exclusiva para el paquete premium",
    "slides": [],
    "options": []
  }
}
```

> El PUT es **upsert**: si el override no existe lo crea, si existe lo actualiza. No hace falta un POST separado.

### Eliminar override → revierte a global — DELETE

```bash
DELETE /api/paquetes/:paqueteId/page-content/sections/:sectionKey
Authorization: Bearer <token>
```

```json
{ "success": true, "message": "Sección revertida a global" }
```

> Cascade: elimina también todos los slides y options del override.

### Toggle activo — PATCH

```bash
PATCH /api/paquetes/:paqueteId/page-content/sections/:sectionKey/toggle
Authorization: Bearer <token>
```

```json
{ "success": true, "data": { "activo": false } }
```

---

## CRUD de slides (admin)

> **Prerequisito:** debe existir un override de sección para `(paqueteId, sectionKey)` antes de crear slides.

```bash
# Crear slide
POST /api/paquetes/:paqueteId/page-content/slides
Authorization: Bearer <token>
Content-Type: application/json

{
  "section_key": "gallery",
  "tipo": "gallery_image",
  "titulo": "Nueva imagen del paquete",
  "descripcion": "col-span-2",
  "imagen_url": "https://s3.amazonaws.com/paquetes/42/...",
  "icono": null,
  "orden": 3
}

# Actualizar slide
PUT /api/paquetes/:paqueteId/page-content/slides/:slideId
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Imagen actualizada",
  "imagen_url": "https://s3.amazonaws.com/nueva.jpg",
  "activo": false
}

# Eliminar slide (cascade a sus options)
DELETE /api/paquetes/:paqueteId/page-content/slides/:slideId

# Reordenar slides — enviar IDs en el orden deseado
PUT /api/paquetes/:paqueteId/page-content/slides/reorder
Content-Type: application/json

{
  "section_key": "gallery",
  "slide_ids": [103, 101, 102]
}
```

---

## CRUD de options (admin)

```bash
# Crear option de sección (ej: fila de sizes_table)
POST /api/paquetes/:paqueteId/page-content/options
Content-Type: application/json

{
  "section_key": "sizes_table",
  "texto": "20×30\"",
  "texto_secundario": "50 × 76 cm",
  "texto_terciario": "300 DPI",
  "texto_cuarto": "Estándar",
  "texto_quinto": "$250.00"
}

# Crear option anidada en un slide per-producto (ej: feature de paper_type)
POST /api/paquetes/:paqueteId/page-content/options
Content-Type: application/json

{
  "section_key": "paper_types",
  "slide_id": 101,
  "texto": "Característica exclusiva de este paquete"
}

# Actualizar
PUT /api/paquetes/:paqueteId/page-content/options/:optionId
Content-Type: application/json
{ "texto": "Texto actualizado", "activo": true }

# Eliminar
DELETE /api/paquetes/:paqueteId/page-content/options/:optionId

# Reordenar
PUT /api/paquetes/:paqueteId/page-content/options/reorder
Content-Type: application/json
{ "section_key": "sizes_table", "option_ids": [5, 3, 1, 4, 2] }
```

---

## Clone desde global

El flujo más común para el panel admin: copiar el contenido global como punto de partida y luego personalizar.

```bash
# Clonar todas las 6 secciones
POST /api/paquetes/:paqueteId/page-content/clone-from-global
Authorization: Bearer <token>
Content-Type: application/json

{}

# Clonar solo secciones específicas
POST /api/paquetes/:paqueteId/page-content/clone-from-global
Authorization: Bearer <token>
Content-Type: application/json

{
  "section_keys": ["gallery", "sizes_table"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [ ...secciones clonadas con slides y options... ],
  "message": "2 sección(es) clonada(s) exitosamente"
}
```

**Comportamiento del clone:**
- Si ya existe override para una sección → la **reemplaza** (no duplica)
- Los `slide_id` en options se remapean correctamente a los nuevos IDs per-producto
- No afecta secciones que no estén en `section_keys`

---

## Upload de imagen

```bash
POST /api/paquetes/:paqueteId/page-content/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Campos:
# section_key: string  (ej: "gallery")
# image_type:  "main" | "slide"
# imagen:      File
```

```json
{
  "success": true,
  "data": { "url": "https://bucket.s3.amazonaws.com/paquetes/42/page-content/gallery/slide/uuid.jpg" },
  "message": "Imagen subida exitosamente"
}
```

S3 path: `paquetes/{paqueteId}/page-content/{section_key}/{image_type}/{uuid}.{ext}`

```ts
// Ejemplo TypeScript
async function uploadPaqueteImage(paqueteId: number, file: File, sectionKey: string, imageType: 'main' | 'slide') {
  const formData = new FormData();
  formData.append('section_key', sectionKey);
  formData.append('image_type', imageType);
  formData.append('imagen', file);

  const res = await fetch(`${API_URL}/api/paquetes/${paqueteId}/page-content/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const { data } = await res.json();
  return data.url;
}
```

---

## Integración Next.js

### 1. Proxy en `next.config.ts`

```ts
async rewrites() {
  return [
    // Global CMS (ya existente)
    {
      source: '/api/product-page-content/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL}/api/product-page-content/:path*`,
    },
    // Per-product CMS (nuevo)
    {
      source: '/api/paquetes/:paqueteId/page-content/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL}/api/paquetes/:paqueteId/page-content/:path*`,
    },
  ];
}
```

### 2. Servicio en el frontend

```ts
// src/services/paquete-page-content.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Obtener contenido merged para renderizar la página de producto
export async function getPaquetePageContent(paqueteId: number) {
  const res = await fetch(`${API_BASE}/api/paquetes/${paqueteId}/page-content/merged`);
  if (!res.ok) throw new Error('Error al obtener contenido del paquete');
  const { data } = await res.json();
  return data; // Array de 6 secciones con _source: "per_product" | "global"
}

// Panel admin: saber qué secciones tienen override
export async function getOverrideStatus(paqueteId: number, token: string) {
  const res = await fetch(`${API_BASE}/api/paquetes/${paqueteId}/page-content/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data } = await res.json();
  return data; // [{ section_key, has_override }]
}

// Panel admin: clonar todo el global como punto de partida
export async function cloneFromGlobal(paqueteId: number, token: string, sectionKeys?: string[]) {
  const res = await fetch(`${API_BASE}/api/paquetes/${paqueteId}/page-content/clone-from-global`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(sectionKeys ? { section_keys: sectionKeys } : {}),
  });
  return res.json();
}

// Panel admin: upsert sección
export async function upsertSection(paqueteId: number, sectionKey: string, data: object, token: string) {
  const res = await fetch(`${API_BASE}/api/paquetes/${paqueteId}/page-content/sections/${sectionKey}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Panel admin: revertir sección a global
export async function revertSectionToGlobal(paqueteId: number, sectionKey: string, token: string) {
  const res = await fetch(`${API_BASE}/api/paquetes/${paqueteId}/page-content/sections/${sectionKey}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
```

### 3. Uso en página de producto (Server Component)

```tsx
// app/productos/[paqueteId]/page.tsx
import { getPaquetePageContent } from '@/services/paquete-page-content';

export default async function ProductoPage({ params }: { params: { paqueteId: string } }) {
  const sections = await getPaquetePageContent(Number(params.paqueteId));

  const gallery      = sections.find(s => s.section_key === 'gallery');
  const whyChoose    = sections.find(s => s.section_key === 'why_choose');
  const paperTypes   = sections.find(s => s.section_key === 'paper_types');
  const sizesTable   = sections.find(s => s.section_key === 'sizes_table');

  return (
    <>
      {gallery?.activo && <GallerySection data={gallery} />}
      {whyChoose?.activo && <WhyChooseSection data={whyChoose} />}
      {paperTypes?.activo && <PaperTypesSection data={paperTypes} />}
      {sizesTable?.activo && <SizesTableSection data={sizesTable} />}
    </>
  );
}
```

### 4. Mapper snake_case → camelCase

El mapper del CMS global (`product-page-mapper.ts`) es reutilizable. Solo agregar el campo `_source` y `paquete_id`:

```ts
// Campos adicionales vs global
interface PaqueteSectionRaw {
  paquete_id: number;       // → paqueteId
  _source: 'per_product' | 'global';  // sin transformar
}

function mapSection(raw: any) {
  return {
    ...mapGlobalSection(raw),  // reutilizar mapper global
    paqueteId: raw.paquete_id ?? null,
    _source: raw._source,
  };
}
```

---

## Flujos del panel admin

### Flujo A: Primera vez — clonar global y personalizar

```
1. GET /status → ver que ninguna sección tiene override
2. POST /clone-from-global → clonar las 6 secciones
3. PUT /sections/gallery → cambiar título/imagen
4. POST /upload → subir imagen propia
5. PUT /slides/:id → actualizar imagen de un slide con la URL de S3
6. GET /merged → verificar resultado final
```

### Flujo B: Override parcial (solo una sección)

```
1. PUT /sections/sizes_table → crear override solo para la tabla
   Body: { "titulo": "Tamaños para el paquete 4×6 especial" }
2. DELETE /options/:id → eliminar filas que no aplican
3. POST /options → agregar fila nueva específica del paquete
4. GET /merged → la sección sizes_table vendrá con _source: "per_product"
            y el resto con _source: "global"
```

### Flujo C: Revertir cambios

```
1. DELETE /sections/gallery → la sección gallery vuelve a usar el global
   → Cascade: elimina todos los slides y options del override
2. GET /merged → gallery ahora tiene _source: "global"
```

---

## Relaciones importantes

### `slide_id` en options apunta a `paquete_page_slides`

A diferencia del CMS global (donde `slide_id` apunta a `product_page_slides`), aquí el `slide_id` de las options per-producto apunta a **`paquete_page_slides`**. El clone se encarga de remapear los IDs automáticamente.

### Validaciones del backend

| Acción | Validación |
|---|---|
| `POST /slides` | El override de sección debe existir previamente |
| `POST /options` con `slide_id` | El slide debe pertenecer al mismo `paqueteId` |
| `PUT/DELETE /slides/:id` | El slide debe pertenecer al `paqueteId` |
| `PUT/DELETE /options/:id` | La option debe pertenecer al `paqueteId` |
| `PUT /sections/:key` | El paquete debe existir en `paquetes_predefinidos` |
| `POST /clone-from-global` | El paquete debe existir |

---

## Pruebas con cURL

```bash
BASE=http://localhost:3001
PAQUETE_ID=1

# ── Lectura pública ───────────────────────────────────────────

# Contenido merged (lo que usa el frontend para renderizar)
curl "$BASE/api/paquetes/$PAQUETE_ID/page-content/merged"

# ── Auth ─────────────────────────────────────────────────────

TOKEN=$(curl -s -X POST "$BASE/api/auth/login/admin" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"tu-password"}' \
  | jq -r '.data.token')

# ── Status de overrides ───────────────────────────────────────

curl "$BASE/api/paquetes/$PAQUETE_ID/page-content/status" \
  -H "Authorization: Bearer $TOKEN"

# ── Clonar todo el global ────────────────────────────────────

curl -X POST "$BASE/api/paquetes/$PAQUETE_ID/page-content/clone-from-global" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}'

# Clonar solo gallery y sizes_table
curl -X POST "$BASE/api/paquetes/$PAQUETE_ID/page-content/clone-from-global" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"section_keys": ["gallery", "sizes_table"]}'

# ── Upsert de sección ────────────────────────────────────────

curl -X PUT "$BASE/api/paquetes/$PAQUETE_ID/page-content/sections/gallery" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"titulo": "Galería exclusiva del paquete premium"}'

# ── Revertir sección a global ────────────────────────────────

curl -X DELETE "$BASE/api/paquetes/$PAQUETE_ID/page-content/sections/gallery" \
  -H "Authorization: Bearer $TOKEN"

# ── Toggle activo ────────────────────────────────────────────

curl -X PATCH "$BASE/api/paquetes/$PAQUETE_ID/page-content/sections/why_choose/toggle" \
  -H "Authorization: Bearer $TOKEN"

# ── Slides ───────────────────────────────────────────────────

# Crear slide (requiere override de sección previo)
curl -X POST "$BASE/api/paquetes/$PAQUETE_ID/page-content/slides" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "section_key": "gallery",
    "tipo": "gallery_image",
    "titulo": "Imagen especial del paquete",
    "imagen_url": "/img/paquete-gallery.jpg",
    "descripcion": "col-span-2"
  }'

# Reordenar slides
curl -X PUT "$BASE/api/paquetes/$PAQUETE_ID/page-content/slides/reorder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"section_key": "gallery", "slide_ids": [3, 1, 2]}'

# Eliminar slide
curl -X DELETE "$BASE/api/paquetes/$PAQUETE_ID/page-content/slides/3" \
  -H "Authorization: Bearer $TOKEN"

# ── Options ──────────────────────────────────────────────────

# Agregar fila a sizes_table
curl -X POST "$BASE/api/paquetes/$PAQUETE_ID/page-content/options" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "section_key": "sizes_table",
    "texto": "20x30\"",
    "texto_secundario": "50 × 76 cm",
    "texto_terciario": "300 DPI",
    "texto_cuarto": "Estándar",
    "texto_quinto": "$250.00"
  }'

# Agregar feature a un paper_type (slide_id del per-producto)
curl -X POST "$BASE/api/paquetes/$PAQUETE_ID/page-content/options" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"section_key": "paper_types", "slide_id": 101, "texto": "Acabado premium exclusivo"}'

# ── Upload de imagen ─────────────────────────────────────────

curl -X POST "$BASE/api/paquetes/$PAQUETE_ID/page-content/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "section_key=gallery" \
  -F "image_type=slide" \
  -F "imagen=@/ruta/a/imagen.jpg"
```

---

## Diferencias con el CMS global

| Característica | Global (`/api/product-page-content`) | Per-producto (`/api/paquetes/:id/page-content`) |
|---|---|---|
| Secciones | 6 fijas, siempre existen | Solo existen si hay override |
| PUT sección | Actualiza existente | **Upsert** (crea si no existe) |
| DELETE sección | No disponible | Disponible → revierte a global |
| `_source` en respuesta | No | Sí (`"per_product"` o `"global"`) |
| Clone | No aplica | `POST /clone-from-global` |
| `slide_id` en options | → `product_page_slides` | → `paquete_page_slides` |
| S3 path | `product-page/{section}/{type}/` | `paquetes/{id}/page-content/{section}/{type}/` |
| Prerrequisito para slides | Ninguno | El override de sección debe existir |

---

## Swagger

Todos los endpoints están documentados bajo la etiqueta **"Paquete Page Content"**:

```
http://localhost:3001/api-docs
```
