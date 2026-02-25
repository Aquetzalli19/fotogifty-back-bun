# Guía de Integración: Procesamiento de Polaroids en el Flujo de Pedidos

## 🚨 Problema Actual

**Síntoma:** Las imágenes en los pedidos de tipo polaroid aparecen sin el marco/template.

**Causa:** El servicio `PolaroidProcessingService` existe pero **NO se está llamando** en el flujo de creación de pedidos.

**Lo que está pasando ahora:**
```typescript
// ❌ FLUJO ACTUAL (INCORRECTO)
1. Frontend envía customización con templateUrl
2. Backend recibe customización
3. Backend guarda solo polaroid.imageSrc (imagen original) en S3
4. Se crea el registro de foto SIN procesar
5. Resultado: Solo se ve la foto del usuario, sin el marco polaroid
```

**Lo que DEBE pasar:**
```typescript
// ✅ FLUJO CORRECTO
1. Frontend envía customización con templateUrl
2. Backend recibe customización
3. Backend llama a PolaroidProcessingService
4. Service descarga template + imagen usuario
5. Service aplica transformaciones + efectos + filtros
6. Service compone imagen + template a 300 DPI
7. Backend sube imagen PROCESADA a S3
8. Se crea el registro de foto con imagen procesada
9. Resultado: Se ve la foto con el marco polaroid completo
```

---

## ✅ Solución Implementada

### 1. Use Case Creado

**Archivo:** `src/application/use-cases/procesar-polaroid-customization.use-case.ts`

**Función principal:**
```typescript
async execute(
  customizationData: PolaroidCustomizationData,
  pedidoId: number,
  itemPedidoId: number
): Promise<ProcesarPolaroidCustomizationResult>
```

**Qué hace:**
1. Valida datos de customización
2. Llama a `PolaroidProcessingService.processCustomization()`
3. Recibe imagen(es) procesada(s) como Buffer
4. Sube cada Buffer a S3 en: `pedidos/{pedidoId}/items/{itemPedidoId}/polaroid_{timestamp}_{index}.png`
5. Retorna array con URLs de S3 y metadatos

---

## 🔧 Dónde Integrar

Necesitas integrar el use case en **UNO de estos lugares** (según tu arquitectura):

### Opción A: En el Webhook de Stripe (Recomendado)

**Ubicación:** `src/application/use-cases/verificar-sesion-checkout.use-case.ts` o donde proceses `checkout.session.completed`

**Cuándo:** Después de que Stripe confirma el pago exitoso

**Código de integración:**

```typescript
import { ProcesarPolaroidCustomizationUseCase } from '@application/use-cases/procesar-polaroid-customization.use-case';
import { CustomizacionTemporalRepositoryPort } from '@domain/ports/customizacion-temporal.repository.port';

// En el webhook handler o use case de verificación de sesión:
async function handleCheckoutSessionCompleted(session: any) {
  // 1. Crear el pedido (código existente)
  const pedido = await crearPedido(session);

  // 2. Obtener customizaciones temporales del usuario
  const customizaciones = await customizacionRepository.findByUserId(pedido.usuario_id);

  // 3. Procesar polaroids
  const procesarPolaroidUseCase = new ProcesarPolaroidCustomizationUseCase();

  for (const customizacion of customizaciones) {
    if (customizacion.editor_type === 'polaroid') {
      // Obtener el item_pedido_id correspondiente
      const itemPedido = pedido.items.find(item =>
        item.cart_item_id === customizacion.cart_item_id &&
        item.instance_index === customizacion.instance_index
      );

      if (itemPedido) {
        // Procesar polaroid
        const result = await procesarPolaroidUseCase.execute(
          customizacion.datos, // Ya tiene el formato PolaroidCustomizationData
          pedido.id,
          itemPedido.id
        );

        if (result.success && result.data) {
          // Crear registros de fotos con las imágenes procesadas
          for (const imagen of result.data.processedImages) {
            await fotoRepository.create({
              usuario_id: pedido.usuario_id,
              pedido_id: pedido.id,
              item_pedido_id: itemPedido.id,
              nombre_archivo: `polaroid_${Date.now()}.png`,
              ruta_almacenamiento: imagen.s3Key,  // ← Guardar KEY, no URL
              tamaño_archivo: 0, // Sharp no retorna size, usar 0 o calcular
              ancho_foto: customizacion.datos.widthInches,
              alto_foto: customizacion.datos.heightInches,
              resolucion_foto: 300,
              cantidad_copias: imagen.copies,
              procesada: true
            });
          }
        }
      }
    }
  }

  // 4. Limpiar customizaciones temporales (opcional)
  await customizacionRepository.deleteByUserId(pedido.usuario_id);
}
```

---

### Opción B: En el Endpoint de Crear Pedido

**Ubicación:** `src/application/use-cases/crear-pedido.use-case.ts`

**Cuándo:** Inmediatamente después de crear el pedido

**Código de integración:**

```typescript
import { ProcesarPolaroidCustomizationUseCase } from '@application/use-cases/procesar-polaroid-customization.use-case';

export class CrearPedidoUseCase {
  // ... constructor existente ...

  async execute(
    // ... parámetros existentes ...
    customizaciones?: any[] // ← Agregar parámetro opcional
  ): Promise<CrearPedidoResult> {
    try {
      // ... código existente de validaciones ...

      // Guardar pedido (código existente)
      const pedidoGuardado = await this.pedidoRepository.create(nuevoPedido);

      // ✅ NUEVO: Procesar customizaciones de polaroid
      if (customizaciones && customizaciones.length > 0) {
        const procesarPolaroidUseCase = new ProcesarPolaroidCustomizationUseCase();

        for (const customizacion of customizaciones) {
          if (customizacion.editorType === 'polaroid') {
            // Encontrar el item_pedido correspondiente
            const itemPedido = pedidoGuardado.items?.find(item =>
              item.cart_item_id === customizacion.cart_item_id
            );

            if (itemPedido && itemPedido.id) {
              const result = await procesarPolaroidUseCase.execute(
                customizacion.data,
                pedidoGuardado.id!,
                itemPedido.id
              );

              if (result.success && result.data) {
                // Crear fotos procesadas
                for (const imagen of result.data.processedImages) {
                  await this.fotoRepository.create({
                    usuario_id: pedidoGuardado.usuario_id,
                    pedido_id: pedidoGuardado.id!,
                    item_pedido_id: itemPedido.id,
                    nombre_archivo: `polaroid_${Date.now()}.png`,
                    ruta_almacenamiento: imagen.s3Key,
                    tamaño_archivo: 0,
                    ancho_foto: customizacion.data.widthInches,
                    alto_foto: customizacion.data.heightInches,
                    resolucion_foto: 300,
                    cantidad_copias: imagen.copies,
                    procesada: true
                  });
                }
              }
            }
          }
        }
      }

      return {
        success: true,
        data: pedidoGuardado
      };
    } catch (error: any) {
      // ... manejo de errores existente ...
    }
  }
}
```

---

### Opción C: Endpoint Separado de Procesamiento

**Crear nuevo endpoint:** `POST /api/pedidos/:id/process-polaroids`

**Cuándo:** Después de crear el pedido, llamar este endpoint explícitamente

**Ventaja:** Separación de responsabilidades, más fácil de debuggear

**Pasos:**
1. Crear controller method en `pedido.controller.ts`
2. Crear ruta en `pedido.routes.ts`
3. Frontend llama a este endpoint después de confirmar pedido

---

## 📋 Checklist de Integración

- [ ] **Paso 1:** Elegir dónde integrar (Opción A, B o C)
- [ ] **Paso 2:** Importar `ProcesarPolaroidCustomizationUseCase`
- [ ] **Paso 3:** Obtener customizaciones de tipo `polaroid`
- [ ] **Paso 4:** Llamar a `procesarPolaroidUseCase.execute()` por cada customización
- [ ] **Paso 5:** Crear registros de `fotos` con las URLs de S3 retornadas
- [ ] **Paso 6:** (Opcional) Limpiar customizaciones temporales
- [ ] **Paso 7:** Probar con un pedido real
- [ ] **Paso 8:** Verificar que las imágenes en pedidos tengan el marco polaroid

---

## 🧪 Testing

### Prueba Manual

1. **Crear pedido con polaroid desde el frontend**
2. **Verificar en S3** que existan archivos en:
   ```
   pedidos/{pedidoId}/items/{itemPedidoId}/polaroid_{timestamp}_0.png
   ```
3. **Descargar imagen de S3** y verificar que:
   - ✅ Tiene el marco/template del polaroid
   - ✅ Tiene la imagen del usuario en el área correcta
   - ✅ Tiene las transformaciones aplicadas (rotación, escala, etc.)
   - ✅ Tiene los efectos aplicados (filtros, brillo, contraste, etc.)
   - ✅ Tiene 300 DPI embebido en metadatos

### Prueba con curl

```bash
# 1. Obtener customización temporal
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/customizaciones-temporales

# 2. Crear pedido (el procesamiento debe ocurrir automáticamente)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_cliente": "Test User",
    "email_cliente": "test@example.com",
    "items_pedido": [...],
    "customizaciones": [...]
  }' \
  http://localhost:3001/api/pedidos

# 3. Verificar que las fotos tengan el template
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/pedidos/{pedidoId}
```

---

## 🐛 Troubleshooting

### Problema: "Template not found"
**Solución:** Verifica que el `templateUrl` del frontend sea correcto y que el archivo exista en S3.

### Problema: "Image is null after processing"
**Solución:** Verifica que `polaroid.imageSrc` sea un data URL válido o una URL de S3 accesible.

### Problema: "Processed image is blank"
**Solución:** El `photoArea` puede estar fuera de los límites del template. Verifica las coordenadas en el frontend.

### Problema: "Effects don't match frontend preview"
**Solución:** Ajusta los multiplicadores en `PolaroidProcessingService.applyTransformationsAndEffects()`.

---

## 📊 Ejemplo de Flujo Completo

```typescript
// 1. Frontend guarda customización temporal
POST /api/customizaciones-temporales
{
  "cart_item_id": "abc123",
  "editor_type": "polaroid",
  "datos": {
    "templateUrl": "/polaroid/Polaroid.png",
    "polaroids": [{ "imageSrc": "data:image/...", ... }]
  }
}

// 2. Frontend crea sesión de checkout
POST /api/checkout/create-session
// Stripe devuelve session_id

// 3. Usuario paga en Stripe
// Stripe envía webhook: checkout.session.completed

// 4. Backend recibe webhook
POST /api/webhooks/stripe
// ✅ AQUÍ DEBE OCURRIR EL PROCESAMIENTO

// 5. Backend en el webhook handler:
const customizaciones = await getCustomizacionesByUserId(userId);
const procesarUseCase = new ProcesarPolaroidCustomizationUseCase();

for (const c of customizaciones) {
  if (c.editor_type === 'polaroid') {
    const result = await procesarUseCase.execute(c.datos, pedidoId, itemId);
    // Crear fotos con result.data.processedImages
  }
}

// 6. Usuario ve pedido con imágenes procesadas
GET /api/pedidos/{pedidoId}
// Las fotos ahora tienen el marco polaroid
```

---

## 📝 Resumen

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| `PolaroidProcessingService` | ✅ Implementado | `src/infrastructure/services/polaroid-processing.service.ts` |
| `ProcesarPolaroidCustomizationUseCase` | ✅ Implementado | `src/application/use-cases/procesar-polaroid-customization.use-case.ts` |
| **Integración en flujo de pedidos** | ⚠️ **FALTA** | Webhook / Crear Pedido / Endpoint separado |

**Próximo paso:** Elegir una opción de integración y agregar el código en el lugar correspondiente.
