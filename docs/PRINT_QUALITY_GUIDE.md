# Guía de Calidad de Impresión - DPI y Validación de Imágenes

## 📸 ¿Qué son los DPI?

**DPI** = Dots Per Inch (Puntos Por Pulgada)
**PPI** = Pixels Per Inch (Píxeles Por Pulgada)

En el contexto de imágenes digitales, DPI y PPI son intercambiables.

## 🎯 DPI Necesarios para Impresión

| Tipo de Impresión | DPI Recomendado | Calidad |
|-------------------|-----------------|---------|
| Web / Pantalla | 72 DPI | ❌ NO apto para imprimir |
| Impresión básica | 150 DPI | ⚠️ Aceptable para uso casual |
| **Impresión profesional** | **300 DPI** | ✅ **ÓPTIMO** |
| Impresión de lujo | 600+ DPI | ✨ Premium |

## 📐 Cómo Calcular Tamaño de Impresión

### Fórmula Básica
```
Tamaño físico (pulgadas) = Píxeles / DPI
Tamaño físico (cm) = (Píxeles / DPI) × 2.54
```

### Ejemplos Prácticos

#### Ejemplo 1: Imagen Correcta ✅
```
Imagen: 3000 x 2000 píxeles
DPI: 300
Tamaño de impresión: 10" x 6.67" (25.4cm x 17cm)
Resultado: ✅ Excelente calidad
```

#### Ejemplo 2: Imagen Incorrecta ❌
```
Imagen: 1200 x 800 píxeles
DPI: 72 (foto tomada con celular sin configurar)
Tamaño de impresión: 16.67" x 11.11" (42cm x 28cm)
Resultado: ❌ Se verá pixelada y borrosa
```

#### Ejemplo 3: Misma Imagen con DPI Correcto ✅
```
Imagen: 1200 x 800 píxeles
DPI: 300 (corregido)
Tamaño de impresión: 4" x 2.67" (10cm x 6.8cm)
Resultado: ✅ Buena calidad (pero pequeña)
```

## 🔧 Cómo Funciona el Sistema de Validación

### 1. Cuando el Usuario Sube una Foto

```typescript
// El sistema extrae los metadatos REALES de la imagen
{
  width: 3000,         // Píxeles de ancho
  height: 2000,        // Píxeles de alto
  dpi: 300,            // DPI embebidos en el archivo
  format: 'jpeg',
  size: 2457600        // Tamaño en bytes
}
```

### 2. Validaciones Automáticas

El sistema valida:

✅ **Formato**: Solo JPG, JPEG, PNG
✅ **Tamaño de archivo**: Máximo 10MB
✅ **DPI mínimo**: 300 DPI recomendado
✅ **Dimensiones físicas**: Coinciden con el paquete ±0.5cm
✅ **Píxeles suficientes**: Para el tamaño de impresión

### 3. Errores vs Advertencias

**ERRORES** (Rechazan la imagen):
- Formato no permitido
- Archivo muy grande
- Dimensiones en píxeles insuficientes

**ADVERTENCIAS** (Aceptan pero alertan):
- DPI bajo (puede afectar calidad)
- Dimensiones físicas no exactas
- Sin metadatos DPI

## 📊 Tabla de Referencia Rápida

### Tamaños Comunes de Foto y Píxeles Necesarios a 300 DPI

| Tamaño (cm) | Tamaño (pulg) | Píxeles Necesarios | Megapíxeles |
|-------------|---------------|-------------------|-------------|
| 9 x 13 | 3.5" x 5" | 1050 x 1500 | 1.6 MP |
| 10 x 15 | 4" x 6" | 1200 x 1800 | 2.2 MP |
| 13 x 18 | 5" x 7" | 1500 x 2100 | 3.2 MP |
| 15 x 20 | 6" x 8" | 1800 x 2400 | 4.3 MP |
| 20 x 25 | 8" x 10" | 2400 x 3000 | 7.2 MP |
| 20 x 30 | 8" x 12" | 2400 x 3600 | 8.6 MP |
| 30 x 40 | 12" x 16" | 3600 x 4800 | 17.3 MP |

## 🚀 Endpoints de Validación

### 1. Validar Imagen Antes de Subir

```bash
POST /api/images/validate
Content-Type: multipart/form-data

Body:
- image: [archivo]
- expectedWidthCm: 10
- expectedHeightCm: 15
- minDPI: 300
- toleranceCm: 0.5
```

**Respuesta:**
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

### 2. Calcular Requisitos

```bash
POST /api/images/calculate-requirements
Content-Type: application/json

{
  "widthCm": 10,
  "heightCm": 15,
  "dpi": 300
}
```

**Respuesta:**
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

## 📥 Descarga desde S3 para Impresión

### Metadatos DPI se Preservan

Cuando subes una imagen a S3, los metadatos EXIF (incluidos los DPI) **se mantienen** dentro del archivo. S3 no modifica el contenido del archivo.

### Endpoint de Descarga

```bash
GET /api/fotos/{id}/download
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://bucket.s3.amazonaws.com/fotos/...",
    "filename": "mi-foto.jpg",
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

### Para Descargar e Imprimir

1. **Solicitar URL de descarga**:
   ```bash
   GET /api/fotos/123/download
   ```

2. **Usar la URL firmada** para descargar el archivo
   - La URL expira en 1 hora
   - La descarga es directa desde S3 (no pasa por el servidor)

3. **Los DPI están embebidos** en el archivo JPEG/PNG descargado

4. **El software de impresión** (Photoshop, Lightroom, sistema de impresora) lee los DPI del archivo automáticamente

5. **Base de datos tiene los metadatos** guardados para referencia:
   ```sql
   SELECT
     nombre_archivo,
     ancho_foto,      -- cm reales
     alto_foto,       -- cm reales
     resolucion_foto  -- DPI reales
   FROM fotos
   ```

### Permisos de Descarga

Pueden descargar una foto:
- ✅ El usuario que la subió (dueño)
- ✅ Administradores (`admin`, `super_admin`)
- ✅ Personal de ventanilla (`store`)

## ⚠️ Casos Especiales

### Foto sin Metadatos DPI

Si una imagen no tiene DPI en sus metadatos:

```typescript
// El sistema asume 300 DPI
const dpi_asumido = metadata.dpi || 300;

// Y muestra advertencia
warnings.push('La imagen no tiene metadatos DPI. Se asumirá 300 DPI para impresión.');
```

### Foto de Smartphone

La mayoría de smartphones guardan fotos a 72 DPI, pero con **muchos píxeles**:

```
Foto de iPhone 14:
- Tamaño: 4032 x 3024 píxeles (12 MP)
- DPI embebido: 72
- DPI real necesario para 10x15cm: ~300

El sistema:
1. Detecta 72 DPI (advertencia)
2. Calcula que tiene suficientes píxeles
3. Recalcula DPI óptimo: 300 DPI
4. Guarda con 300 DPI en metadata
```

## 🎨 Mejores Prácticas

### Para el Frontend

1. **Validar ANTES de subir**:
   ```javascript
   // Usar endpoint de validación
   const validation = await validateImage(file, packageInfo);
   if (!validation.isValid) {
     showErrors(validation.errors);
   }
   ```

2. **Mostrar requisitos al usuario**:
   ```javascript
   const requirements = await calculateRequirements(10, 15, 300);
   // "Necesitas una imagen de al menos 1181x1772 píxeles"
   ```

3. **Advertir sobre calidad**:
   ```javascript
   if (validation.warnings.length > 0) {
     showWarnings(validation.warnings);
     // "DPI bajo. La impresión puede no tener la calidad esperada."
   }
   ```

### Para el Equipo de Impresión

1. **Revisar logs de advertencias**:
   ```bash
   # Los logs muestran:
   ⚠️  Advertencias de calidad de imagen:
      - DPI bajo. Recomendado: 300 DPI. Actual: 72 DPI
      - Dimensiones físicas: 10.2cm x 15.8cm (esperado: 10cm x 15cm)
   ```

2. **Consultar base de datos**:
   ```sql
   SELECT
     f.*,
     p.nombre as paquete
   FROM fotos f
   JOIN items_pedido ip ON f.item_pedido_id = ip.id
   JOIN paquetes_predefinidos p ON ip.paquete_id = p.id
   WHERE f.resolucion_foto < 300;
   ```

## 📝 Resumen

### ✅ Lo que SÍ hace el sistema:
- Extrae DPI reales del archivo
- Valida dimensiones físicas
- Calcula si tiene suficientes píxeles
- Guarda metadatos reales en BD
- Preserva DPI en S3
- Alerta sobre problemas de calidad

### ❌ Lo que NO hace:
- No modifica la imagen
- No cambia DPI del archivo
- No redimensiona
- No comprime

### 🎯 Resultado Final:
**Garantiza que todas las fotos en el sistema tienen la calidad necesaria para impresión profesional a 300 DPI**
