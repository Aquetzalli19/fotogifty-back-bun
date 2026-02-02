# Implementación: Descarga de Fotos en ZIP con Metadatos EXIF

## 📋 Resumen

Se ha implementado exitosamente el endpoint para descargar todas las fotos de un pedido en un archivo ZIP con metadatos EXIF embebidos (DPI, perfil sRGB, copyright) y archivo de metadata.txt.

## 🎯 Endpoint Implementado

```
GET /api/pedidos/:id/fotos/download-zip
```

**Autenticación**: Bearer Token (solo admin, super_admin, store)

## ✅ Características Implementadas

### 1. Procesamiento de Imágenes

Cada foto se procesa con:
- **DPI**: 300 (o el especificado por el paquete)
- **Perfil de color**: sRGB IEC61966-2.1
- **Metadatos EXIF**:
  - `Copyright`: "Pedido #X - FotoGifty"
  - `Artist`: Nombre del cliente
  - `ImageDescription`: Descripción de la foto
  - `Software`: "FotoGifty Platform"

### 2. Estructura del ZIP

```
pedido-31-2024-02-02.zip
├── foto-001-polaroid-2copias.jpg
├── foto-002-imantada-1copia.jpg
├── foto-003-calendario-3copias.jpg
└── metadata.txt
```

**Nomenclatura de archivos**: `foto-{número}-{categoría}-{cantidad}copia(s).{ext}`

### 3. Archivo metadata.txt

Contiene:
- Información del pedido (ID, fecha, cliente, estado, total)
- Lista detallada de fotos:
  - Nombre del archivo
  - Categoría
  - Cantidad de copias
  - Dimensiones físicas (cm)
  - Resolución (DPI)
  - Tamaño del archivo
- Resumen:
  - Total de copias a imprimir
  - Fotos únicas
  - Promedio de copias por foto
- Especificaciones técnicas

Ejemplo:

```
╔══════════════════════════════════════════════════════════════╗
║                    PEDIDO #00031                             ║
╚══════════════════════════════════════════════════════════════╝

INFORMACIÓN DEL PEDIDO
═══════════════════════════════════════════════════════════════
Fecha: 2 de febrero de 2024
Cliente: Juan Pérez
Email: juan@example.com
Teléfono: +52 123 456 7890
Estado: Pendiente
Total: $450.00 MXN

FOTOS INCLUIDAS
═══════════════════════════════════════════════════════════════

1. foto-001-polaroid-2copias.jpg
   ├─ Nombre original: mi-foto.jpg
   ├─ Cantidad de copias: 2
   ├─ Dimensiones físicas: 10 × 15 cm
   ├─ Resolución: 300 DPI
   └─ Tamaño: 2.45 MB

RESUMEN DE IMPRESIÓN
═══════════════════════════════════════════════════════════════
Total de copias a imprimir: 5
Fotos únicas: 3
Promedio de copias por foto: 1.7

ESPECIFICACIONES TÉCNICAS
═══════════════════════════════════════════════════════════════
Todas las fotos incluyen:
  • Perfil de color: sRGB IEC61966-2.1
  • Resolución: 300 DPI (o especificada por paquete)
  • Metadatos EXIF embebidos
  • Copyright: Pedido #31 - FotoGifty
```

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

1. **`src/application/use-cases/descargar-pedido-zip.use-case.ts`**
   - Lógica principal de generación del ZIP
   - Descarga de fotos desde S3
   - Procesamiento de imágenes con metadatos
   - Generación de metadata.txt

2. **`scripts/test-download-zip.sh`**
   - Script de testing automatizado
   - Verificación de metadatos EXIF
   - Inspección del contenido del ZIP

3. **`DOWNLOAD_ZIP_IMPLEMENTATION.md`**
   - Documentación completa de la implementación

### Archivos Modificados

1. **`src/infrastructure/services/s3.service.ts`**
   - Agregado método `downloadFile()` para descargar archivos de S3
   - Agregado método `extractKeyFromUrl()` para extraer key desde URL

2. **`src/infrastructure/services/image-validation.service.ts`**
   - Agregado método `processImageWithFullMetadata()` para metadatos EXIF completos

3. **`src/infrastructure/controllers/pedido.controller.ts`**
   - Agregado método `downloadPedidoZip()`
   - Agregado use case en constructor

4. **`src/infrastructure/routes/pedido.routes.ts`**
   - Agregada ruta con middleware de autenticación y rol
   - Documentación Swagger completa

## 🔧 Dependencias Instaladas

```json
{
  "archiver": "^7.0.1",
  "@types/archiver": "^7.0.0"
}
```

## 🧪 Testing

### Método 1: Script Automatizado (Recomendado)

```bash
# Obtener token de admin (login)
TOKEN="tu_token_jwt_aqui"

# Ejecutar test
./scripts/test-download-zip.sh 31 $TOKEN

# Con variables de entorno
API_URL=http://localhost:3001 ./scripts/test-download-zip.sh 31 $TOKEN
```

El script:
- ✅ Descarga el ZIP
- ✅ Verifica que sea un archivo ZIP válido
- ✅ Lista el contenido
- ✅ Opción de descomprimir para inspección
- ✅ Verifica metadatos EXIF (si exiftool está instalado)
- ✅ Muestra contenido de metadata.txt

### Método 2: cURL Manual

```bash
# Descargar ZIP
curl -H "Authorization: Bearer $TOKEN" \
  -o pedido-31.zip \
  http://localhost:3001/api/pedidos/31/fotos/download-zip

# Listar contenido
unzip -l pedido-31.zip

# Extraer
unzip pedido-31.zip -d extracted/

# Verificar metadatos EXIF
exiftool extracted/foto-001-*.jpg

# Ver metadata.txt
cat extracted/metadata.txt
```

### Método 3: Navegador

1. Hacer login en el sistema como admin
2. Navegar a: `http://localhost:3001/api/pedidos/31/fotos/download-zip`
3. El navegador descargará automáticamente el ZIP

## 📊 Validaciones y Manejo de Errores

| Caso | Status Code | Respuesta |
|------|-------------|-----------|
| Usuario no es admin/super_admin/store | 403 | `{ success: false, error: "No tienes permisos..." }` |
| Pedido no encontrado | 404 | `{ success: false, error: "Pedido no encontrado" }` |
| Pedido sin fotos | 404 | `{ success: false, error: "No se encontraron fotos...", code: "NO_PHOTOS_FOUND" }` |
| Foto no existe en S3 | Log warning | Omite la foto y continúa |
| Descarga exitosa | 200 | Stream de archivo ZIP |

## 🔍 Verificación de Metadatos EXIF

### Instalar ExifTool (macOS)

```bash
brew install exiftool
```

### Verificar Perfil ICC

```bash
exiftool -ICC_Profile:ProfileDescription foto.jpg
# Output esperado: sRGB IEC61966-2.1
```

### Verificar Todos los Metadatos

```bash
exiftool -ICC_Profile:all -XResolution -YResolution -Copyright -Artist foto.jpg
```

Salida esperada:

```
ICC Profile Description: sRGB IEC61966-2.1
X Resolution: 300
Y Resolution: 300
Copyright: Pedido #31 - FotoGifty
Artist: Juan Pérez
```

## 📈 Performance y Limitaciones

### Configuración Actual

- **Compresión ZIP**: Nivel 9 (máxima)
- **Calidad JPEG**: 95%
- **Chroma Subsampling**: 4:4:4 (máxima calidad)
- **Timeout**: 60 segundos (Express default)

### Características

- Stream directo al cliente (no guarda en disco temporalmente)
- Procesamiento foto por foto (evita cargar todo en memoria)
- Manejo de errores por foto (si una falla, continúa con las demás)

### Recomendaciones para Producción

Si los pedidos tienen muchas fotos (>50):

1. **Agregar timeout mayor** en el servidor:
   ```typescript
   req.setTimeout(300000); // 5 minutos
   ```

2. **Considerar procesamiento asíncrono**:
   - Generar ZIP en background job
   - Notificar al usuario cuando esté listo
   - Guardar en S3 temporalmente (24h)

3. **Monitorear uso de memoria**:
   - Archiver procesa en stream
   - Sharp libera memoria automáticamente
   - Pero con 100+ fotos de 10MB, considerar límites

## 🔐 Seguridad

- ✅ Requiere autenticación Bearer Token
- ✅ Validación de roles (solo admin/super_admin/store)
- ✅ Validación de ID de pedido
- ✅ No expone información sensible en errores
- ✅ URLs de S3 no se exponen directamente

## 📚 Documentación Swagger

La ruta está completamente documentada en Swagger UI:

**URL**: `http://localhost:3001/api-docs`

**Buscar**: `GET /api/pedidos/{id}/fotos/download-zip`

## 🐛 Troubleshooting

### Error: "No se pudo descargar el archivo"

- Verificar que la URL de S3 en la BD sea correcta
- Verificar credenciales de AWS en `.env`
- Verificar que el bucket tenga las fotos

### Error: "Error creando ZIP"

- Ver logs del servidor para detalles
- Verificar permisos de escritura (aunque usa stream)
- Verificar memoria disponible

### Error 403: "No tienes permisos"

- Verificar que el token sea de un usuario admin/super_admin/store
- Verificar que el token no haya expirado

### ZIP corrupto o vacío

- Verificar que las fotos existan en S3
- Verificar que el pedido tenga fotos en la BD
- Ver logs del servidor para errores durante procesamiento

## 🎯 Criterios de Aceptación Cumplidos

- ✅ Endpoint implementado y funcionando
- ✅ Autenticación y autorización configurada
- ✅ ZIP contiene todas las fotos del pedido
- ✅ Metadatos EXIF embebidos en cada foto:
  - ✅ DPI 300 (o especificado)
  - ✅ Perfil sRGB IEC61966-2.1
  - ✅ Copyright con info del pedido
  - ✅ Artist con nombre del cliente
- ✅ Archivo metadata.txt incluido con:
  - ✅ Info completa del pedido
  - ✅ Lista de fotos con especificaciones
  - ✅ Resumen de copias totales
- ✅ Nombres de archivos descriptivos
- ✅ Manejo de errores robusto
- ✅ Script de testing
- ✅ Documentación completa en Swagger
- ✅ Código sigue arquitectura hexagonal del proyecto

## 📝 Próximos Pasos (Opcional)

1. **Tests unitarios**:
   - Test del use case con mocks
   - Test del controlador
   - Test de integración completo

2. **Optimizaciones**:
   - Cache de ZIPs frecuentemente descargados
   - Generación asíncrona para pedidos grandes
   - Paralelización de descarga de S3

3. **Features adicionales**:
   - Selección de fotos específicas (no todas)
   - Diferentes calidades de exportación
   - Marcas de agua opcionales

## 🤝 Uso en Frontend

```javascript
// React/Next.js ejemplo
async function downloadPedidoZip(pedidoId, token) {
  const response = await fetch(
    `${API_URL}/api/pedidos/${pedidoId}/fotos/download-zip`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  // Obtener blob
  const blob = await response.blob();

  // Extraer nombre del archivo del header
  const disposition = response.headers.get('Content-Disposition');
  const filename = disposition
    ? disposition.split('filename=')[1].replace(/"/g, '')
    : `pedido-${pedidoId}.zip`;

  // Crear link de descarga
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Uso
try {
  await downloadPedidoZip(31, userToken);
  toast.success('ZIP descargado exitosamente');
} catch (error) {
  toast.error(`Error: ${error.message}`);
}
```

---

**Fecha de implementación**: 2026-02-02
**Versión**: 1.0
**Estado**: ✅ Completado y testeado
