# 🔧 Solución de CORS para Descarga de Fotos

Este documento explica las soluciones implementadas para resolver el problema de CORS al descargar imágenes de S3.

---

## 📋 Problema

El frontend no puede descargar imágenes directamente de S3 debido a restricciones de CORS:
- Las URLs de S3 no permiten fetch desde el navegador
- CORS bloquea las solicitudes cross-origin
- El frontend necesita descargar múltiples imágenes para impresión

---

## ✅ Soluciones Implementadas

### Solución 1: Endpoint Proxy (Fix Rápido) ⚡

**Endpoint**: `POST /api/fotos/download-by-url`

El backend actúa como proxy entre el frontend y S3.

#### Cómo funciona:
```
Frontend → Backend (proxy) → S3 → Backend → Frontend
```

#### Uso desde el Frontend:

```typescript
// Descargar imagen a través del proxy
const response = await fetch('/api/fotos/download-by-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    imageUrl: 'https://bucket.s3.amazonaws.com/fotos/1/imagen.jpg'
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);

// Descargar archivo
const a = document.createElement('a');
a.href = url;
a.download = 'foto.jpg';
a.click();
```

#### Características:
- ✅ **Rápido de implementar**: Listo en minutos
- ✅ **Sin cambios en frontend**: Compatible con URLs existentes
- ✅ **Seguridad**: Valida que la URL sea de tu bucket S3
- ✅ **Cache**: Headers de cache para mejor performance
- ⚠️ **Limitación**: Usa URLs públicas de S3 (no firmadas)

#### Validaciones de Seguridad:
1. Requiere autenticación (`authenticateToken`)
2. Requiere roles: `admin`, `super_admin`, o `store`
3. Valida que la URL contenga el nombre del bucket configurado
4. Retorna 400 si la URL es inválida

#### Archivos modificados:
- `src/infrastructure/controllers/foto.controller.ts:157-218` - Método `downloadByUrl()`
- `src/infrastructure/routes/foto.routes.ts:280-282` - Ruta POST

---

### Solución 2: Objetos de Fotos Completos (Permanente) 🚀

Los endpoints de pedidos ahora devuelven objetos de fotos completos con IDs, no solo URLs.

#### Cambios en la Respuesta de Pedidos:

**ANTES:**
```json
{
  "id": 123,
  "nombre_cliente": "Juan Pérez",
  "imagenes": [
    "https://bucket.s3.amazonaws.com/fotos/1/foto1.jpg",
    "https://bucket.s3.amazonaws.com/fotos/1/foto2.jpg"
  ]
}
```

**AHORA:**
```json
{
  "id": 123,
  "nombre_cliente": "Juan Pérez",
  "fotos": [
    {
      "id": 45,
      "url": "https://bucket.s3.amazonaws.com/fotos/1/foto1.jpg",
      "nombre_archivo": "foto1.jpg",
      "ancho_foto": 10.16,
      "alto_foto": 15.24,
      "resolucion_foto": 300,
      "tamanio_archivo": 2457600,
      "id_item_pedido": 12
    },
    {
      "id": 46,
      "url": "https://bucket.s3.amazonaws.com/fotos/1/foto2.jpg",
      "nombre_archivo": "foto2.jpg",
      "ancho_foto": 13.5,
      "alto_foto": 18.2,
      "resolucion_foto": 300,
      "tamanio_archivo": 3145728,
      "id_item_pedido": 12
    }
  ],
  "imagenes": [
    "https://bucket.s3.amazonaws.com/fotos/1/foto1.jpg",
    "https://bucket.s3.amazonaws.com/fotos/1/foto2.jpg"
  ]
}
```

#### Uso desde el Frontend:

```typescript
// Opción A: Usar el endpoint de descarga por ID
const downloadFoto = async (fotoId: number) => {
  const response = await fetch(`/api/fotos/${fotoId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  // Usar la URL firmada (válida por 1 hora)
  window.location.href = data.data.downloadUrl;
};

// Opción B: Usar el proxy con las URLs de fotos
const downloadFotoByUrl = async (url: string) => {
  const response = await fetch('/api/fotos/download-by-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ imageUrl: url })
  });

  const blob = await response.blob();
  // ... procesar blob
};

// Descargar todas las fotos de un pedido
const descargarFotosPedido = async (pedido) => {
  for (const foto of pedido.fotos) {
    await downloadFoto(foto.id);
    // O usar: await downloadFotoByUrl(foto.url);
  }
};
```

#### Características:
- ✅ **URLs firmadas**: Mayor seguridad con GET `/api/fotos/{id}/download`
- ✅ **Metadatos completos**: Ancho, alto, DPI, tamaño
- ✅ **Mejor UX**: Barra de progreso, reintentos
- ✅ **Escalable**: Mejor arquitectura a largo plazo
- ✅ **Retrocompatible**: El campo `imagenes` sigue disponible

#### Archivos modificados:
- `src/domain/entities/pedido.entity.ts:10-19` - Interface `FotoDetalle`
- `src/domain/entities/pedido.entity.ts:54` - Campo `fotos` en `Pedido`
- `src/infrastructure/repositories/prisma-pedido.repository.ts:249-258` - Mapeo de fotos

---

## 🎯 Comparación de Soluciones

| Aspecto                    | Solución 1: Proxy       | Solución 2: IDs de Fotos |
|----------------------------|-------------------------|--------------------------|
| Implementación             | ✅ Inmediata            | ✅ Implementada          |
| Funciona con frontend actual | ✅ Sí                 | ✅ Sí (ambas opciones)   |
| URLs firmadas              | ❌ No                   | ✅ Sí                    |
| Metadatos DPI              | ❌ No incluye           | ✅ Completo              |
| Seguridad                  | ⚠️ Básica               | ✅ Alta                  |
| Performance                | ⚠️ Pasa por servidor    | ✅ Descarga directa S3   |
| Cache                      | ✅ Sí                   | ✅ Sí                    |

---

## 📊 Endpoints Disponibles

### 1. GET `/api/fotos/{id}/download`
Genera URL firmada para descarga segura.

**Request:**
```bash
GET /api/fotos/45/download
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://bucket.s3.amazonaws.com/fotos/1/foto.jpg?X-Amz-...",
    "filename": "foto.jpg",
    "expiresIn": 3600,
    "metadata": {
      "anchoFisico": 10.16,
      "altoFisico": 15.24,
      "resolucionDPI": 300,
      "tamanioArchivo": 2457600
    }
  },
  "message": "URL de descarga generada. La URL expirará en 1 hora."
}
```

### 2. POST `/api/fotos/download-by-url`
Proxy para descargar desde S3 sin CORS.

**Request:**
```bash
POST /api/fotos/download-by-url
Authorization: Bearer {token}
Content-Type: application/json

{
  "imageUrl": "https://bucket.s3.amazonaws.com/fotos/1/foto.jpg"
}
```

**Response:**
```
Content-Type: image/jpeg
Content-Length: 2457600
Cache-Control: public, max-age=31536000

[Binary image data]
```

### 3. GET `/api/pedidos`
Lista todos los pedidos con objetos de fotos completos.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "nombre_cliente": "Juan Pérez",
      "fotos": [
        {
          "id": 45,
          "url": "https://...",
          "nombre_archivo": "foto.jpg",
          "ancho_foto": 10.16,
          "alto_foto": 15.24,
          "resolucion_foto": 300,
          "tamanio_archivo": 2457600,
          "id_item_pedido": 12
        }
      ],
      "imagenes": ["https://..."]
    }
  ]
}
```

---

## 🚀 Recomendaciones de Uso

### Para Uso Inmediato (Proxy)

Usa el endpoint proxy cuando:
- Necesitas compatibilidad inmediata
- Ya tienes URLs de S3 almacenadas
- No necesitas URLs firmadas

```typescript
// Ejemplo: Descargar múltiples imágenes
const descargarImagenes = async (imageUrls: string[]) => {
  for (const url of imageUrls) {
    const response = await fetch('/api/fotos/download-by-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ imageUrl: url })
    });

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = url.split('/').pop() || 'foto.jpg';
    a.click();

    URL.revokeObjectURL(downloadUrl);
  }
};
```

### Para Mejor Arquitectura (IDs)

Usa el endpoint con IDs cuando:
- Necesitas máxima seguridad (URLs firmadas)
- Quieres metadatos de las fotos (DPI, dimensiones)
- Estás desarrollando nueva funcionalidad

```typescript
// Ejemplo: Descargar fotos de un pedido
const descargarFotosPedido = async (pedido: Pedido) => {
  for (const foto of pedido.fotos) {
    const response = await fetch(`/api/fotos/${foto.id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const { data } = await response.json();

    // Usar URL firmada (válida 1 hora)
    const a = document.createElement('a');
    a.href = data.downloadUrl;
    a.download = foto.nombre_archivo;
    a.click();
  }
};
```

---

## 🔒 Seguridad

### Ambas soluciones requieren:
- ✅ Autenticación con JWT
- ✅ Roles autorizados: `admin`, `super_admin`, `store`
- ✅ Validación de permisos

### Solución 1 (Proxy) valida:
- La URL contiene el nombre del bucket configurado
- El bucket es el correcto (`S3_BUCKET_NAME` en `.env`)

### Solución 2 (IDs) valida:
- El usuario es dueño de la foto, admin, o store
- La foto existe en la base de datos
- La URL firmada expira en 1 hora

---

## 📝 Migración Gradual

Puedes usar ambas soluciones en paralelo:

```typescript
// Interfaz que soporta ambos formatos
interface Pedido {
  id: number;
  fotos?: FotoDetalle[];     // Nuevo formato
  imagenes?: string[];        // Formato legacy
}

// Función adaptadora
const descargarFotos = async (pedido: Pedido) => {
  if (pedido.fotos && pedido.fotos.length > 0) {
    // Usar nuevo formato (con IDs)
    for (const foto of pedido.fotos) {
      await downloadFotoById(foto.id);
    }
  } else if (pedido.imagenes && pedido.imagenes.length > 0) {
    // Usar formato legacy (con URLs)
    for (const url of pedido.imagenes) {
      await downloadFotoByUrl(url);
    }
  }
};
```

---

## ✅ Estado de Implementación

- ✅ Endpoint proxy implementado
- ✅ Entidad Pedido actualizada con campo `fotos`
- ✅ Repositorio actualizado para incluir objetos de fotos
- ✅ Retrocompatibilidad con campo `imagenes`
- ✅ Documentación Swagger actualizada
- ✅ Build exitoso sin errores

**Ambas soluciones están listas para producción** 🚀

---

## 📚 Documentación Relacionada

- [DPI_WORKFLOW.md](./DPI_WORKFLOW.md) - Flujo completo de DPI
- [PRINT_QUALITY_GUIDE.md](./PRINT_QUALITY_GUIDE.md) - Guía de calidad de impresión
- [Swagger API Docs](http://localhost:3001/api-docs) - Documentación interactiva
