# 🔧 Corrección de DPI en Fotos - Documentación

## 🔴 Problema Identificado

Las fotos descargadas en el ZIP tenían **72 DPI** en lugar de los **300 DPI** especificados en el paquete.

### Causa Raíz

El código estaba guardando el DPI **original** de la imagen subida por el usuario, en lugar del DPI **del paquete**.

**Flujo incorrecto**:
```
1. Usuario sube foto con 72 DPI
2. Sistema lee: "tiene 72 DPI"
3. Sistema procesa y embebe 300 DPI → sube a S3 ✅
4. Sistema guarda en BD: resolucion_foto = 72 ❌ (DPI original)
5. Al descargar ZIP, lee de BD: 72 DPI
6. Embebe 72 DPI en el ZIP ❌
```

### Código Problemático

**Archivo**: `src/application/use-cases/subir-foto.use-case.ts`

```typescript
// ❌ ANTES (incorrecto)
const dpi_real = imageMetadata.dpi || resolucion_esperada;

// ...

resolucion_foto: dpi_real  // Guardaba 72 DPI en lugar de 300
```

## ✅ Solución Implementada

### 1. Cambios en el Código

**Archivo**: `src/application/use-cases/subir-foto.use-case.ts`

```typescript
// ✅ DESPUÉS (correcto)
const dpi_original = imageMetadata.dpi || 72;  // Solo para referencia

// Calcular dimensiones físicas usando el DPI del paquete
const { widthCm, heightCm } = ImageValidationService.calculatePhysicalSize(
  imageMetadata.width,
  imageMetadata.height,
  resolucion_esperada  // Usar DPI del paquete
);

// Guardar el DPI del paquete en la BD
resolucion_foto: resolucion_esperada  // Guarda 300 DPI
```

### 2. Flujo Correcto

```
1. Usuario sube foto con 72 DPI
2. Sistema lee: "tiene 72 DPI" (solo para validación)
3. Sistema procesa y embebe 300 DPI → sube a S3 ✅
4. Sistema guarda en BD: resolucion_foto = 300 ✅ (DPI del paquete)
5. Al descargar ZIP, lee de BD: 300 DPI ✅
6. Embebe 300 DPI en el ZIP ✅
```

## 🔄 Migración de Datos

### Fotos Existentes con DPI Incorrecto

Las fotos ya subidas tienen DPI incorrectos en la BD. Hay dos opciones:

#### Opción 1: Script Automatizado (Recomendado)

```bash
./scripts/fix-dpi-photos.sh
```

El script:
- ✅ Muestra estado actual de las fotos
- ✅ Lista fotos con DPI incorrecto
- ✅ Solicita confirmación antes de actualizar
- ✅ Actualiza DPI en la BD
- ✅ Recalcula dimensiones físicas
- ✅ Muestra resultado final

#### Opción 2: SQL Manual

```bash
# Ejecutar el archivo SQL
mysql -h HOST -P PORT -u USER -p'PASSWORD' DATABASE < scripts/fix-dpi-existing-photos.sql
```

### Qué Actualiza el Script

1. **`resolucion_foto`**: DPI original → DPI del paquete
2. **`ancho_foto`**: Recalcula con DPI correcto
3. **`alto_foto`**: Recalcula con DPI correcto

### Ejemplo de Corrección

**Antes**:
```sql
id: 96
nombre_archivo: foto.jpg
resolucion_foto: 72     ❌
ancho_foto: 28.22 cm
alto_foto: 35.28 cm
```

**Después**:
```sql
id: 96
nombre_archivo: foto.jpg
resolucion_foto: 300    ✅
ancho_foto: 6.77 cm     (recalculado: 28.22 * 72 / 300)
alto_foto: 8.47 cm      (recalculado: 35.28 * 72 / 300)
```

## 🎯 Verificación

### 1. Verificar Foto Individual

```bash
mysql -h HOST -P PORT -u USER -p'PASSWORD' DATABASE -e "
SELECT id, nombre_archivo, resolucion_foto, ancho_foto, alto_foto
FROM fotos
WHERE id = 96;
"
```

Resultado esperado:
```
resolucion_foto: 300 (no 72)
```

### 2. Descargar ZIP y Verificar

```bash
# Descargar ZIP
curl -H "Authorization: Bearer $TOKEN" \
  https://tu-api.up.railway.app/api/pedidos/31/fotos/download-zip \
  -o test.zip

# Extraer
unzip test.zip -d extracted/

# Verificar DPI
exiftool extracted/foto-001-*.jpg | grep Resolution

# Resultado esperado:
# X Resolution: 300
# Y Resolution: 300
```

## 📊 Impacto

### Fotos Nuevas (después del fix)

✅ Se guardan automáticamente con DPI correcto
- **Subida**: Embebe 300 DPI en S3
- **BD**: Guarda 300 DPI
- **Descarga ZIP**: Usa 300 DPI

### Fotos Existentes (antes del fix)

⚠️ Requieren corrección manual con el script

**Estado en S3**: ✅ Ya tienen 300 DPI embebidos correctamente
**Estado en BD**: ❌ Tienen 72 DPI (hasta que se ejecute el script)
**Descarga ZIP**: ❌ Usa 72 DPI de la BD (hasta que se ejecute el script)

## 🚀 Deploy

### 1. Commit y Deploy del Código

```bash
git add .
git commit -m "fix: save package DPI instead of original image DPI in database"
git push origin main
```

Railway redesplegará automáticamente.

### 2. Ejecutar Script de Corrección

**DESPUÉS** de que el deploy esté completo:

```bash
./scripts/fix-dpi-photos.sh
```

## 📝 Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `subir-foto.use-case.ts` | Guardar `resolucion_esperada` en lugar de `dpi_real` |
| `scripts/fix-dpi-photos.sh` | Script bash para corrección automatizada |
| `scripts/fix-dpi-existing-photos.sql` | Queries SQL para corrección manual |
| `DPI_FIX_DOCUMENTATION.md` | Esta documentación |

## 🧪 Testing

### Test 1: Subir Nueva Foto

```bash
# 1. Subir foto (debería guardar 300 DPI en BD)
curl -X POST http://localhost:3001/api/pedidos/31/imagenes \
  -H "Authorization: Bearer $TOKEN" \
  -F "imagenes=@test.jpg" \
  -F "usuarioId=2" \
  -F "itemPedidoId=30"

# 2. Verificar en BD
SELECT resolucion_foto FROM fotos ORDER BY id DESC LIMIT 1;

# Resultado esperado: 300
```

### Test 2: Descargar ZIP

```bash
# 1. Descargar ZIP
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/pedidos/31/fotos/download-zip \
  -o test.zip

# 2. Verificar DPI
unzip test.zip
exiftool foto-001-*.jpg | grep "Resolution"

# Resultado esperado: 300
```

## 🎉 Resultado Final

Después de aplicar los cambios:

✅ **Subida de fotos**: Guarda DPI del paquete (300) en BD
✅ **Fotos en S3**: Tienen 300 DPI embebidos
✅ **Descarga de ZIP**: Usa 300 DPI de la BD
✅ **Dimensiones físicas**: Calculadas correctamente con 300 DPI
✅ **Fotos existentes**: Corregidas con el script

---

**Fecha**: 2024-02-02
**Versión**: 1.0
**Estado**: ✅ Solucionado
