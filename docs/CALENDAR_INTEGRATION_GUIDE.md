# Guía de Integración: Procesamiento de Calendarios en el Flujo de Pedidos

## 📋 Resumen

El backend ahora puede procesar customizaciones de tipo `calendar` recibidas desde el frontend, aplicando transformaciones, efectos y componiendo con los templates correctos de cada mes.

---

## ✅ Lo que se Implementó

### 1. **CalendarProcessingService** ✅
**Ubicación:** `src/infrastructure/services/calendar-processing.service.ts`

**Capacidades:**
- ✅ Descarga templates por mes desde `monthTemplates`
- ✅ Descarga imágenes de usuario (base64 o S3)
- ✅ Aplica transformaciones (escala, rotación, posición)
- ✅ Aplica efectos (brillo, contraste, saturación, sepia)
- ✅ Aplica filtros predefinidos
- ✅ Crea fondo difuminado (blur background)
- ✅ Compone: fondo difuminado → imagen usuario → template
- ✅ Exporta a 300 DPI PNG

### 2. **ProcesarCalendarCustomizationUseCase** ✅
**Ubicación:** `src/application/use-cases/procesar-calendar-customization.use-case.ts`

**Función principal:**
```typescript
async execute(
  customizationData: CalendarCustomizationData,
  pedidoId: number,
  itemPedidoId: number
): Promise<ProcesarCalendarCustomizationResult>
```

---

## 📥 Formato de Datos de Entrada

El frontend envía una customización con este formato:

```typescript
{
  "editorType": "calendar",
  "data": {
    "canvasWidth": 2550,
    "canvasHeight": 3300,
    "widthInches": 8.5,
    "heightInches": 11,
    "exportResolution": 300,

    // Templates por mes (uno diferente por cada mes)
    "monthTemplates": {
      "1": "/calendarios2026/1-ENERO 2026.png",
      "2": "/calendarios2026/Calendario Febrero 2026.png",
      "3": "/calendarios2026/3-MARZO 2026.png",
      // ... hasta "12"
    },

    // Área de foto (parte superior, normalmente 47% de altura)
    "photoArea": {
      "x": 0,
      "y": 0,
      "width": 2550,
      "height": 1551  // 47% de 3300
    },

    // Meses customizados (puede ser 1 mes o hasta 12)
    "months": [
      {
        "month": 1,  // Enero
        "imageSrc": "data:image/jpeg;base64,...",
        "transformations": {
          "scale": 1.2,
          "rotation": 0,
          "posX": 10,
          "posY": -5
        },
        "effects": {
          "brightness": 10,
          "contrast": 5,
          "saturation": -10,
          "sepia": 0
        },
        "selectedFilter": "vintage",
        "canvasStyle": {
          "backgroundColor": "#ffffff"
        }
      },
      {
        "month": 2,  // Febrero
        // ... (mismo formato)
      }
      // ... (hasta 12 meses)
    ]
  }
}
```

---

## 🔄 Flujo de Procesamiento

```mermaid
graph TD
    A[Recibir Customización Calendar] --> B[Validar Datos]
    B --> C[Por cada mes en months]
    C --> D[Descargar Template del mes monthTemplates[month]]
    D --> E[Descargar Imagen Usuario imageSrc]
    E --> F[Aplicar Transformaciones scale, rotation, posX, posY]
    F --> G[Aplicar Efectos brightness, contrast, etc.]
    G --> H[Aplicar Filtro selectedFilter]
    H --> I[Crear Fondo Difuminado Blur 20px]
    I --> J[Redimensionar Imagen a photoArea]
    J --> K[Componer: Fondo → Imagen → Template]
    K --> L[Exportar a 300 DPI PNG]
    L --> M[Subir a S3]
    M --> N[Siguiente mes]
    N --> C
```

---

## 🎨 Diferencias vs Polaroids

| Aspecto | Polaroid | Calendar |
|---------|----------|----------|
| **Templates** | 1 template para todos | 12 templates diferentes (uno por mes) |
| **Fondo** | Transparente | Fondo difuminado de la imagen |
| **Área de foto** | Centro del polaroid | Parte superior (47%) |
| **Composición** | Imagen → Template | Fondo blur → Imagen → Template |
| **Clipping** | No necesario | Necesario en área de foto |
| **Cantidad** | 1 imagen procesada | Hasta 12 imágenes (una por mes) |

---

## 🔧 Integración en el Flujo de Pedidos

### Opción A: Webhook de Stripe (Recomendado ⭐)

```typescript
import { ProcesarCalendarCustomizationUseCase } from '@application/use-cases/procesar-calendar-customization.use-case';

// En el webhook handler cuando Stripe confirma pago:
async function handleCheckoutSessionCompleted(session: any) {
  // 1. Crear el pedido
  const pedido = await crearPedido(session);

  // 2. Obtener customizaciones temporales
  const customizaciones = await customizacionRepository.findByUserId(pedido.usuario_id);

  // 3. Procesar polaroids
  const procesarPolaroidUseCase = new ProcesarPolaroidCustomizationUseCase();

  // 4. ✅ NUEVO: Procesar calendarios
  const procesarCalendarUseCase = new ProcesarCalendarCustomizationUseCase();

  for (const customizacion of customizaciones) {
    const itemPedido = pedido.items.find(item =>
      item.cart_item_id === customizacion.cart_item_id &&
      item.instance_index === customizacion.instance_index
    );

    if (!itemPedido) continue;

    // Procesar según tipo
    if (customizacion.editor_type === 'polaroid') {
      const result = await procesarPolaroidUseCase.execute(
        customizacion.datos,
        pedido.id,
        itemPedido.id
      );

      if (result.success && result.data) {
        for (const imagen of result.data.processedImages) {
          await fotoRepository.create({
            usuario_id: pedido.usuario_id,
            pedido_id: pedido.id,
            item_pedido_id: itemPedido.id,
            nombre_archivo: `polaroid_${Date.now()}.png`,
            ruta_almacenamiento: imagen.s3Key,
            tamaño_archivo: 0,
            ancho_foto: customizacion.datos.widthInches || 4,
            alto_foto: customizacion.datos.heightInches || 6,
            resolucion_foto: 300,
            cantidad_copias: imagen.copies,
            procesada: true
          });
        }
      }
    }
    else if (customizacion.editor_type === 'calendar') {
      // ✅ Procesar calendario
      const result = await procesarCalendarUseCase.execute(
        customizacion.datos,
        pedido.id,
        itemPedido.id
      );

      if (result.success && result.data) {
        for (const month of result.data.processedMonths) {
          await fotoRepository.create({
            usuario_id: pedido.usuario_id,
            pedido_id: pedido.id,
            item_pedido_id: itemPedido.id,
            nombre_archivo: `calendar_month_${month.month}.png`,
            ruta_almacenamiento: month.s3Key,
            tamaño_archivo: 0,
            ancho_foto: customizacion.datos.widthInches || 8.5,
            alto_foto: customizacion.datos.heightInches || 11,
            resolucion_foto: 300,
            cantidad_copias: 1,  // 1 calendario = 1 copia
            procesada: true
          });

          // También guardar relación mes-foto en tabla calendario_fotos
          await calendarioFotoRepository.create({
            pedido_id: pedido.id,
            item_pedido_id: itemPedido.id,
            mes: month.month,
            foto_id: fotoCreada.id  // ID de la foto recién creada
          });
        }
      }
    }
  }

  // 5. Limpiar customizaciones temporales
  await customizacionRepository.deleteByUserId(pedido.usuario_id);
}
```

---

## 📋 Checklist de Integración

- [ ] **Paso 1:** Importar `ProcesarCalendarCustomizationUseCase`
- [ ] **Paso 2:** Detectar customizaciones de tipo `calendar`
- [ ] **Paso 3:** Llamar a `procesarCalendarUseCase.execute()`
- [ ] **Paso 4:** Crear registros de `fotos` por cada mes procesado
- [ ] **Paso 5:** Crear registros en `calendario_fotos` (relación mes-foto)
- [ ] **Paso 6:** Verificar que templates de mes existan en S3
- [ ] **Paso 7:** Probar con calendario de 1 mes
- [ ] **Paso 8:** Probar con calendario de 12 meses
- [ ] **Paso 9:** Verificar imágenes tengan fondo difuminado + template correcto

---

## 🗄️ Estructura de Base de Datos

### Tabla `calendario_fotos` (Ya existe)

```sql
CREATE TABLE calendario_fotos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pedido_id INT NOT NULL,
  item_pedido_id INT NOT NULL,
  mes INT NOT NULL,  -- 1-12
  foto_id INT NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (item_pedido_id) REFERENCES items_pedido(id),
  FOREIGN KEY (foto_id) REFERENCES fotos(id)
);
```

Esta tabla relaciona cada mes (1-12) con su foto procesada correspondiente.

---

## 🧪 Testing

### Prueba con 1 mes

```json
{
  "editorType": "calendar",
  "data": {
    "monthTemplates": {
      "1": "/calendarios2026/1-ENERO 2026.png"
    },
    "months": [
      {
        "month": 1,
        "imageSrc": "data:image/jpeg;base64,...",
        "transformations": { "scale": 1.0, "posX": 0, "posY": 0 },
        "effects": { "brightness": 0, "contrast": 0, "saturation": 0, "sepia": 0 },
        "selectedFilter": "none"
      }
    ]
  }
}
```

**Resultado esperado:**
- 1 archivo PNG en S3: `pedidos/{id}/items/{id}/calendar_enero_{timestamp}.png`
- 1 registro en `fotos`
- 1 registro en `calendario_fotos` con `mes = 1`

### Prueba con 12 meses

```json
{
  "editorType": "calendar",
  "data": {
    "monthTemplates": {
      "1": "/calendarios2026/1-ENERO 2026.png",
      "2": "/calendarios2026/Calendario Febrero 2026.png",
      // ... hasta "12"
    },
    "months": [
      { "month": 1, ... },
      { "month": 2, ... },
      // ... hasta { "month": 12, ... }
    ]
  }
}
```

**Resultado esperado:**
- 12 archivos PNG en S3
- 12 registros en `fotos`
- 12 registros en `calendario_fotos`

---

## ⚠️ Consideraciones Importantes

### 1. **Templates por Mes**
Cada mes DEBE tener su propio template en `monthTemplates`. El servicio busca el template usando:
```typescript
const templateUrl = monthTemplates[month.toString()];
```

Si falta un template, el procesamiento de ese mes fallará.

### 2. **Fondo Difuminado**
A diferencia de polaroids, los calendarios tienen un **fondo difuminado** de la imagen del usuario en el área de foto. Esto se crea con:
```typescript
.blur(20)  // Blur fuerte
```

### 3. **PhotoArea**
El `photoArea` normalmente es **47% de la altura total** en la parte superior. Si no se proporciona, se calcula automáticamente:
```typescript
photoArea: {
  x: 0,
  y: 0,
  width: canvasWidth,
  height: Math.round(canvasHeight * 0.47)
}
```

### 4. **Orden de Composición**
Es crítico mantener este orden:
1. Fondo difuminado (blur de imagen usuario)
2. Imagen usuario procesada (sobre el fondo)
3. Template del mes (encima de todo)

### 5. **Relación Mes-Foto**
La tabla `calendario_fotos` vincula cada mes con su foto. Esto permite:
- Saber qué foto corresponde a qué mes
- Mostrar el calendario completo en el admin
- Descargar meses individuales

---

## 🐛 Troubleshooting

### Problema: "No se encontró template para el mes X"
**Solución:** Verifica que `monthTemplates` tenga el key del mes (1-12) y que el archivo exista en S3.

### Problema: "El fondo difuminado no se ve"
**Solución:** Verifica que el blur se esté aplicando correctamente. Ajusta el valor de blur si es necesario.

### Problema: "La imagen no cabe en el photoArea"
**Solución:** El servicio usa `fit: 'cover'`, que recorta. Verifica que las dimensiones del photoArea sean correctas.

### Problema: "El template no se superpone correctamente"
**Solución:** Verifica que el template PNG tenga transparencia en el área de foto y sea opaco en el área del calendario.

---

## 📊 Comparación: Polaroids vs Calendarios

```typescript
// ✅ POLAROIDS
const procesarPolaroidUseCase = new ProcesarPolaroidCustomizationUseCase();
const result = await procesarPolaroidUseCase.execute(data, pedidoId, itemId);
// Resultado: { processedImages: [{ copies: 3, ... }] }
// → Crear 1 foto con cantidad_copias = 3

// ✅ CALENDARIOS
const procesarCalendarUseCase = new ProcesarCalendarCustomizationUseCase();
const result = await procesarCalendarUseCase.execute(data, pedidoId, itemId);
// Resultado: { processedMonths: [{ month: 1, ... }, { month: 2, ... }, ...] }
// → Crear 12 fotos (una por mes) + 12 registros en calendario_fotos
```

---

## 📝 Resumen

| Componente | Estado |
|------------|--------|
| `CalendarProcessingService` | ✅ Implementado |
| `ProcesarCalendarCustomizationUseCase` | ✅ Implementado |
| **Integración en flujo de pedidos** | ⚠️ **FALTA** |

**Próximo paso:** Integrar ambos servicios (polaroids + calendarios) en el webhook de Stripe o en el endpoint de crear pedido.

---

## 🚀 Código Completo de Integración

Ver ejemplo completo en la sección **"Opción A: Webhook de Stripe"** arriba.
