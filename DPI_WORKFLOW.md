# 🖼️ Flujo Completo de DPI - Subida y Descarga de Fotos

Este documento explica el flujo completo de cómo las fotos se procesan con DPI correctos para impresión, desde la subida hasta la descarga.

---

## 📋 Resumen del Flujo

```
1. Cliente sube foto → 2. Validación → 3. Embed DPI → 4. Upload S3 → 5. Guardar metadata → 6. Descarga con DPI
```

---

## 1️⃣ Subida de Foto

### Endpoint
```
POST /api/fotos/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

### Parámetros
- `foto` (file): Archivo de imagen (JPG, JPEG, PNG)
- `usuarioId` (number): ID del usuario
- `itemPedidoId` (number): ID del item del pedido
- `pedidoId` (number, opcional): ID del pedido

### Proceso Interno

#### A. Validación de Imagen
```typescript
// El sistema valida:
✅ Formato: Solo JPG, JPEG, PNG
✅ Tamaño: Máximo 10MB
✅ DPI: Mínimo 300 DPI recomendado
✅ Dimensiones físicas: Coinciden con paquete ±0.5cm
✅ Píxeles suficientes: Para el tamaño de impresión
```

#### B. Embedding de DPI
```typescript
// Si la imagen pasa validación:
1. Se extrae metadata original
2. Se embebe 300 DPI usando Sharp
3. Se procesa la imagen con EXIF tags:
   - XResolution: 300
   - YResolution: 300
   - ResolutionUnit: 2 (pulgadas)
```

#### C. Subida a S3
```typescript
// Imagen procesada (con DPI) se sube a S3
Key: fotos/{usuarioId}/{timestamp}-{filename}.{ext}
Metadata S3:
  - processed-for-print: 'true'
  - dpi: '300'
```

#### D. Guardado en Base de Datos
```sql
INSERT INTO fotos (
  usuario_id,
  pedido_id,
  item_pedido_id,
  nombre_archivo,
  ruta_almacenamiento,  -- URL de S3
  tamaño_archivo,
  ancho_foto,           -- Ancho REAL en cm
  alto_foto,            -- Alto REAL en cm
  resolucion_foto       -- DPI REAL embebido
)
```

### Respuesta de Ejemplo
```json
{
  "success": true,
  "data": {
    "id": 123,
    "url": "https://bucket.s3.amazonaws.com/fotos/1/1640000000-foto.jpg",
    "filename": "foto.jpg",
    "size": 2457600,
    "fecha_subida": "2024-12-19T10:30:00Z"
  }
}
```

### Logs de Consola
```
📸 Embebiendo DPI (300) en imagen...
☁️  Subiendo a S3 con DPI embebidos: 300 DPI
```

Si hay advertencias:
```
⚠️  Advertencias de calidad de imagen:
   - DPI bajo. Recomendado: 300 DPI. Actual: 72 DPI
```

---

## 2️⃣ Descarga de Foto

### Endpoint
```
GET /api/fotos/{id}/download
Authorization: Bearer {token}
```

### Permisos de Descarga
Pueden descargar:
- ✅ El usuario que subió la foto (dueño)
- ✅ Administradores (`admin`, `super_admin`)
- ✅ Personal de ventanilla (`store`)

### Proceso Interno

#### A. Verificación de Permisos
```typescript
1. Se busca la foto en base de datos
2. Se verifica que el usuario sea:
   - Dueño: foto.usuario_id === user.userId
   - O autorizado: role in ['admin', 'super_admin', 'store']
```

#### B. Generación de URL Firmada
```typescript
1. Se extrae la S3 key de la URL almacenada
2. Se genera URL firmada con AWS SDK
3. URL válida por 1 hora (3600 segundos)
4. Configuración: ResponseContentDisposition = 'attachment'
   → Fuerza descarga en lugar de mostrar en navegador
```

### Respuesta de Ejemplo
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://bucket.s3.amazonaws.com/fotos/1/1640000000-foto.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
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

### Uso de la URL

```javascript
// En el frontend:
const response = await fetch('/api/fotos/123/download', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

// Descargar archivo
window.location.href = data.data.downloadUrl;
// O usar fetch para descarga programática
```

---

## 3️⃣ Validación Previa (Opcional)

Antes de subir, puedes validar la imagen:

### Endpoint
```
POST /api/images/validate
Content-Type: multipart/form-data
```

### Parámetros
- `image` (file): Imagen a validar
- `expectedWidthCm` (number): Ancho esperado en cm
- `expectedHeightCm` (number): Alto esperado en cm
- `minDPI` (number): DPI mínimo (default: 300)
- `toleranceCm` (number): Tolerancia en cm (default: 0.5)

### Respuesta
```json
{
  "success": true,
  "isValid": true,
  "metadata": {
    "width": 1200,
    "height": 1800,
    "format": "jpeg",
    "dpi": 300,
    "physicalWidthCm": "10.16",
    "physicalHeightCm": "15.24",
    "sizeInMB": "2.34"
  },
  "errors": [],
  "warnings": [],
  "message": "Imagen válida para impresión"
}
```

---

## 4️⃣ Calcular Requisitos

Para saber qué resolución necesitas:

### Endpoint
```
POST /api/images/calculate-requirements
Content-Type: application/json

{
  "widthCm": 10,
  "heightCm": 15,
  "dpi": 300
}
```

### Respuesta
```json
{
  "success": true,
  "data": {
    "widthCm": 10,
    "heightCm": 15,
    "dpi": 300,
    "requiredPixels": {
      "width": 1181,
      "height": 1772
    },
    "megapixels": "2.09",
    "recommendation": "Para imprimir 10cm x 15cm a 300 DPI, necesitas una imagen de al menos 1181x1772 píxeles"
  }
}
```

---

## 📊 Diagrama de Flujo

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ 1. POST /api/fotos/upload
       │    (foto + metadata)
       ▼
┌─────────────────────────────────────┐
│  SubirFotoUseCase                   │
├─────────────────────────────────────┤
│ 1. Validar usuario/pedido           │
│ 2. Obtener paquete (dimensiones)    │
│ 3. Validar imagen:                  │
│    ✓ Formato, tamaño, DPI           │
│    ✓ Dimensiones físicas            │
│ 4. ⭐ Embeber DPI (300)              │
│ 5. Subir a S3 (con DPI)             │
│ 6. Guardar metadata en DB           │
└──────────┬──────────────────────────┘
           │
           │ Foto almacenada ✓
           ▼
    ┌─────────────┐
    │   AWS S3    │
    │  (con DPI)  │
    └──────┬──────┘
           │
           │ 2. GET /api/fotos/{id}/download
           │    (usuario autenticado)
           ▼
┌─────────────────────────────────────┐
│  FotoController.descargarFoto       │
├─────────────────────────────────────┤
│ 1. Verificar permisos               │
│ 2. Buscar foto en DB                │
│ 3. Generar URL firmada S3           │
│ 4. Retornar URL + metadata          │
└──────────┬──────────────────────────┘
           │
           │ URL firmada (1h)
           ▼
    ┌─────────────┐
    │   Cliente   │
    │  Descarga   │
    │  (con DPI)  │
    └─────────────┘
```

---

## 🔍 Verificar DPI en Archivo Descargado

### Usando ImageMagick (CLI)
```bash
identify -verbose foto.jpg | grep Resolution
# Output: Resolution: 300x300
```

### Usando Photoshop
1. Abrir imagen
2. Image → Image Size
3. Ver "Resolution: 300 Pixels/Inch"

### Usando Python
```python
from PIL import Image

img = Image.open('foto.jpg')
print(img.info.get('dpi'))  # (300, 300)
```

### Usando Sharp (Node.js)
```javascript
import sharp from 'sharp';

const metadata = await sharp('foto.jpg').metadata();
console.log(metadata.density);  // 300
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario Final Sube Foto
```
1. Cliente sube foto desde su celular
2. Sistema valida y embebe 300 DPI
3. Foto almacenada en S3 con DPI correctos
4. Cliente puede ver su foto en el pedido
```

### Caso 2: Store Descarga para Imprimir
```
1. Store recibe pedido nuevo
2. Consulta GET /api/pedidos
3. Para cada foto del pedido:
   - GET /api/fotos/{id}/download
   - Descarga archivo con URL firmada
4. Abre archivos en software de impresión
5. Software lee DPI (300) automáticamente
6. Imprime con calidad correcta
```

### Caso 3: Admin Revisa Calidad
```
1. Admin lista fotos con advertencias
2. Consulta metadata desde DB
3. Descarga fotos para revisar
4. Verifica calidad en Photoshop
```

---

## ⚠️ Consideraciones Importantes

### 1. URLs Firmadas Expiran
- **Duración**: 1 hora (3600 segundos)
- **Acción**: Generar nueva URL si expira
- **No almacenar**: La URL firmada es temporal

### 2. DPI se Preservan en S3
- S3 **NO modifica** el contenido del archivo
- Los metadatos EXIF se mantienen intactos
- El archivo descargado es idéntico al subido (con DPI embebidos)

### 3. Permisos de Descarga
- Solo usuarios autorizados pueden descargar
- Verificación en cada solicitud
- Log de accesos en consola del servidor

### 4. Validaciones son Advertencias
- Errores: Rechazan la imagen
- Advertencias: Aceptan pero alertan
- Revisar logs para calidad

---

## 🚀 Próximos Pasos Sugeridos

1. **Frontend**: Implementar preview de metadata antes de subir
2. **Backend**: Agregar endpoint para listar fotos de un pedido
3. **Backend**: Agregar endpoint para descargar múltiples fotos (ZIP)
4. **Monitoring**: Alertas para fotos con DPI bajo
5. **Analytics**: Dashboard de calidad de imágenes

---

## 📚 Documentación Relacionada

- [PRINT_QUALITY_GUIDE.md](./PRINT_QUALITY_GUIDE.md) - Guía completa de DPI y validación
- [CLAUDE.md](./CLAUDE.md) - Documentación general del proyecto
- [Swagger API Docs](http://localhost:3001/api-docs) - Documentación interactiva

---

**✅ Sistema completo de DPI implementado y funcionando**
