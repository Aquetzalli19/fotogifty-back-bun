# 📋 Sistema de Aceptación de Términos - Implementación Completa

## ✅ Estado: Implementado

Fecha: 2024-02-02
Versión: 1.0

## 📊 Resumen de la Implementación

Se ha implementado un sistema completo de aceptación de términos y condiciones versionados que permite:

1. ✅ Registrar automáticamente la aceptación de términos durante el signup
2. ✅ Validar que los usuarios hayan aceptado términos antes del checkout
3. ✅ Consultar el estado de aceptación de términos por usuario
4. ✅ Aceptar términos manualmente vía API
5. ✅ Middleware para proteger rutas que requieren términos aceptados
6. ✅ Soporte para versionado de documentos legales

## 🗂️ Estructura Implementada

### 1. Base de Datos

**Tabla nueva: `aceptaciones_terminos`**

```sql
CREATE TABLE aceptaciones_terminos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  documento_legal_id INT NOT NULL,
  version VARCHAR(50) NOT NULL,
  fecha_aceptacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (documento_legal_id) REFERENCES documentos_legales(id) ON DELETE CASCADE,
  INDEX idx_usuario_documento (usuario_id, documento_legal_id)
);
```

**Schema Prisma actualizado:**
- Relaciones bidireccionales entre `usuarios`, `documentos_legales` y `aceptaciones_terminos`
- Cliente Prisma regenerado con los nuevos modelos

### 2. Capa de Dominio

**Archivos creados:**

- `src/domain/entities/aceptacion-terminos.entity.ts`
  - Interface `AceptacionTerminos`
  - Clase `AceptacionTerminosEntity` con método estático `create()`

- `src/domain/ports/aceptacion-terminos.repository.port.ts`
  - Métodos: `save()`, `findByUsuarioId()`, `findByUsuarioAndDocumento()`, `findByUsuarioAndTipo()`, `hasAcceptedCurrentVersion()`

### 3. Capa de Infraestructura

**Repositorio:**
- `src/infrastructure/repositories/prisma-aceptacion-terminos.repository.ts`
  - Implementa `AceptacionTerminosRepositoryPort`
  - Mappers `toDomain()` y `toPrisma()`
  - Consultas optimizadas con joins

**Middleware:**
- `src/infrastructure/middlewares/auth.middleware.ts`
  - Nuevo middleware: `requireTermsAcceptance`
  - Valida que el usuario haya aceptado la versión actual de términos
  - Retorna 403 con código `TERMS_NOT_ACCEPTED` si no ha aceptado

### 4. Casos de Uso

**Use Cases creados:**

1. **`ObtenerEstadoTerminosUseCase`** (`obtener-estado-terminos.use-case.ts`)
   - Obtiene el estado de aceptación de términos y privacidad
   - Retorna versión actual, versión aceptada, y si requiere nueva aceptación

2. **`AceptarTerminosUseCase`** (`aceptar-terminos.use-case.ts`)
   - Registra la aceptación de un documento legal
   - Valida que no haya sido aceptado previamente
   - Guarda IP y User-Agent para auditoría

**Use Cases actualizados:**

3. **`CrearUsuarioUseCase`** (modificado en `usuario.controller.ts`)
   - Automáticamente registra aceptación de términos durante signup
   - Captura IP y User-Agent del request

4. **`CrearSesionCheckoutUseCase`**
   - Valida que el usuario haya aceptado términos antes de crear sesión de pago
   - Retorna error `TERMS_NOT_ACCEPTED` si no ha aceptado

### 5. Controladores y Rutas

**Controller creado:**
- `src/infrastructure/controllers/aceptacion-terminos.controller.ts`
  - `getTermsStatus(req, res)` - GET /api/usuarios/:id/terms-status
  - `acceptTerms(req, res)` - POST /api/usuarios/:id/accept-terms

**Rutas creadas:**
- `src/infrastructure/routes/aceptacion-terminos.routes.ts`
  - Ambas rutas protegidas con `authenticateToken`
  - Documentación Swagger completa

**Rutas actualizadas:**
- `src/infrastructure/routes/index.ts` - Registra las nuevas rutas
- `src/infrastructure/routes/usuario.routes.ts` - Inyecta `AceptarTerminosUseCase`
- `src/infrastructure/routes/checkout.routes.ts` - Inyecta dependencias de términos

## 🚀 Endpoints API

### 1. Obtener Estado de Términos

```bash
GET /api/usuarios/:id/terms-status
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "tipo": "terms",
      "aceptado": true,
      "version_actual": "1.0.0",
      "version_aceptada": "1.0.0",
      "fecha_aceptacion": "2024-02-02T10:30:00.000Z",
      "requiere_aceptacion": false
    },
    {
      "tipo": "privacy",
      "aceptado": false,
      "version_actual": "1.0.0",
      "version_aceptada": null,
      "fecha_aceptacion": null,
      "requiere_aceptacion": true
    }
  ]
}
```

### 2. Aceptar Términos

```bash
POST /api/usuarios/:id/accept-terms
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_documento": "terms"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Términos aceptados exitosamente",
  "data": {
    "id": 1,
    "version": "1.0.0",
    "fecha_aceptacion": "2024-02-02T10:30:00.000Z"
  }
}
```

### 3. Signup (Actualizado)

```bash
POST /api/usuarios
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+34123456789",
  "acepto_terminos": true
}
```

**Comportamiento actualizado:**
- Si `acepto_terminos: true`, automáticamente registra la aceptación en `aceptaciones_terminos`
- Guarda versión actual del documento activo de términos
- Captura IP y User-Agent del request

### 4. Checkout (Actualizado)

```bash
POST /api/checkout/crear-sesion
Authorization: Bearer {token}
Content-Type: application/json

{
  "id_usuario": 1,
  "items": [...],
  "total": 100.00,
  ...
}
```

**Validación nueva:**
- ❌ Retorna error si el usuario no ha aceptado la versión actual de términos
- ✅ Permite continuar solo si términos están aceptados

**Error cuando no ha aceptado:**
```json
{
  "success": false,
  "message": "Debe aceptar los términos y condiciones antes de realizar una compra",
  "error": "TERMS_NOT_ACCEPTED"
}
```

## 🔧 Middleware de Protección

### requireTermsAcceptance

Uso en rutas que requieren términos aceptados:

```typescript
router.post(
  '/api/pedidos/crear',
  authenticateToken,
  requireTermsAcceptance,  // ← Valida términos
  (req, res) => controller.crearPedido(req, res)
);
```

**Comportamiento:**
- Verifica que `req.user` exista (requiere `authenticateToken` previo)
- Obtiene documento activo de términos
- Verifica que el usuario haya aceptado la versión actual
- Retorna 403 si no ha aceptado
- Permite continuar si ha aceptado

## 🧪 Testing

### 1. Test de Signup con Términos

```bash
# 1. Registrar nuevo usuario
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nombre": "Test",
    "apellido": "User",
    "acepto_terminos": true
  }'

# 2. Verificar en BD
mysql -h gondola.proxy.rlwy.net -P 42206 -u root -p railway -e "
SELECT * FROM aceptaciones_terminos
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'test@example.com');
"
```

**Resultado esperado:**
- Usuario creado exitosamente
- Registro en `aceptaciones_terminos` con versión actual

### 2. Test de Estado de Términos

```bash
# Obtener token del usuario
TOKEN="tu_token_jwt"
USER_ID=1

curl -X GET http://localhost:3001/api/usuarios/$USER_ID/terms-status \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado esperado:**
- Lista de estados de términos y privacidad
- Indica si requiere nueva aceptación

### 3. Test de Aceptación Manual

```bash
curl -X POST http://localhost:3001/api/usuarios/$USER_ID/accept-terms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo_documento": "privacy"}'
```

**Resultado esperado:**
- Confirmación de aceptación
- ID, versión y fecha de aceptación

### 4. Test de Checkout Bloqueado

```bash
# Crear documento de términos activo si no existe
# Luego intentar checkout sin haber aceptado

curl -X POST http://localhost:3001/api/checkout/crear-sesion \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "items": [{"id_paquete": 1, "cantidad": 1, ...}],
    ...
  }'
```

**Resultado esperado si no ha aceptado:**
```json
{
  "success": false,
  "message": "Debe aceptar los términos y condiciones antes de realizar una compra",
  "error": "TERMS_NOT_ACCEPTED"
}
```

## 📊 Flujos de Usuario

### Flujo 1: Nuevo Usuario (Signup)

```
1. Usuario rellena formulario de registro
2. Frontend valida que checkbox "acepto_terminos" esté marcado
3. POST /api/usuarios con acepto_terminos: true
4. Backend:
   ✓ Crea usuario en tabla usuarios
   ✓ Automáticamente registra aceptación en aceptaciones_terminos
   ✓ Guarda versión actual, IP y User-Agent
5. Usuario puede proceder al checkout sin problemas
```

### Flujo 2: Usuario Existente que Necesita Re-Aceptar

```
1. Usuario loguea exitosamente
2. Frontend consulta GET /api/usuarios/:id/terms-status
3. Backend retorna: requiere_aceptacion: true
4. Frontend muestra modal con nuevos términos
5. Usuario acepta → POST /api/usuarios/:id/accept-terms
6. Backend registra nueva aceptación con nueva versión
7. Usuario puede proceder al checkout
```

### Flujo 3: Checkout con Validación

```
1. Usuario agrega items al carrito
2. Usuario va al checkout
3. Frontend envía POST /api/checkout/crear-sesion
4. Backend valida:
   ✓ Usuario existe
   ✓ Términos aceptados → ✅ SI
   ✓ Validaciones de paquetes, precios, etc.
5. Backend crea sesión de Stripe
6. Usuario es redirigido a Stripe para pago
```

### Flujo 4: Checkout Bloqueado

```
1. Usuario agrega items al carrito
2. Usuario va al checkout
3. Frontend envía POST /api/checkout/crear-sesion
4. Backend valida:
   ✓ Usuario existe
   ✗ Términos aceptados → ❌ NO
5. Backend retorna error TERMS_NOT_ACCEPTED
6. Frontend muestra modal con términos
7. Usuario acepta → POST /api/usuarios/:id/accept-terms
8. Usuario intenta checkout nuevamente
9. Backend valida y permite continuar
```

## 🔄 Versionado de Documentos Legales

### Cómo Funciona

1. **Documento Activo**: Solo un documento de cada tipo puede estar activo
2. **Versión**: Cada documento tiene un campo `version` (ej: "1.0.0", "2.0.0")
3. **Validación**: Sistema compara versión aceptada vs versión activa

### Crear Nueva Versión de Términos

```bash
# 1. Crear nuevo documento con nueva versión
POST /api/documentos-legales
{
  "tipo": "terms",
  "titulo": "Términos y Condiciones",
  "contenido": "...",
  "version": "2.0.0",
  "activo": false
}

# 2. Activar nueva versión (desactiva automáticamente la anterior)
POST /api/documentos-legales/:id/activar
```

**Efecto:**
- Todos los usuarios que aceptaron v1.0.0 ahora necesitan re-aceptar
- `GET /api/usuarios/:id/terms-status` retornará `requiere_aceptacion: true`
- Checkout será bloqueado hasta que acepten nueva versión

## 📁 Archivos Modificados/Creados

### Nuevos Archivos (15)

1. `src/domain/entities/aceptacion-terminos.entity.ts`
2. `src/domain/ports/aceptacion-terminos.repository.port.ts`
3. `src/infrastructure/repositories/prisma-aceptacion-terminos.repository.ts`
4. `src/application/use-cases/obtener-estado-terminos.use-case.ts`
5. `src/application/use-cases/aceptar-terminos.use-case.ts`
6. `src/infrastructure/controllers/aceptacion-terminos.controller.ts`
7. `src/infrastructure/routes/aceptacion-terminos.routes.ts`

### Archivos Modificados (7)

1. `prisma/schema.prisma` - Agregado modelo `aceptaciones_terminos`
2. `src/infrastructure/middlewares/auth.middleware.ts` - Agregado `requireTermsAcceptance`
3. `src/infrastructure/controllers/usuario.controller.ts` - Auto-registro de términos en signup
4. `src/infrastructure/routes/usuario.routes.ts` - Inyección de dependencias
5. `src/infrastructure/routes/index.ts` - Registro de nuevas rutas
6. `src/application/use-cases/crear-sesion-checkout.use-case.ts` - Validación de términos
7. `src/infrastructure/routes/checkout.routes.ts` - Inyección de dependencias

## 🚨 Importante para Deploy

### 1. Aplicar Migración de Base de Datos

```bash
# En Railway o donde esté la BD
bunx prisma db push
```

**O ejecutar SQL manualmente:**
```sql
CREATE TABLE aceptaciones_terminos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  documento_legal_id INT NOT NULL,
  version VARCHAR(50) NOT NULL,
  fecha_aceptacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (documento_legal_id) REFERENCES documentos_legales(id) ON DELETE CASCADE,
  INDEX idx_usuario_documento (usuario_id, documento_legal_id)
);
```

### 2. Crear Documento de Términos Activo

```bash
POST /api/documentos-legales
{
  "tipo": "terms",
  "titulo": "Términos y Condiciones",
  "contenido": "Tu contenido legal aquí...",
  "version": "1.0.0",
  "activo": true
}
```

### 3. Build y Deploy

```bash
bun run build
git add .
git commit -m "feat: implement versioned terms acceptance system"
git push origin main
```

## 🎯 Próximos Pasos (Opcional)

1. **Frontend Integration**:
   - Mostrar modal de términos durante signup
   - Validar estado de términos al cargar app
   - Mostrar modal cuando requiere nueva aceptación

2. **Admin Panel**:
   - Crear/editar documentos legales
   - Ver historial de aceptaciones por usuario
   - Activar/desactivar versiones

3. **Auditoría**:
   - Dashboard de aceptaciones por versión
   - Reportes de usuarios que necesitan re-aceptar
   - Logs de cambios de versión

4. **Emails**:
   - Notificar usuarios cuando hay nueva versión
   - Recordatorios si no han aceptado términos

## ✅ Checklist de Verificación

- [x] Migración de base de datos aplicada
- [x] Schema Prisma actualizado
- [x] Entidades de dominio creadas
- [x] Repository ports creados
- [x] Repository implementations creadas
- [x] Use cases creados
- [x] Controllers creados
- [x] Rutas creadas y registradas
- [x] Middleware de validación creado
- [x] Signup actualizado para auto-registro
- [x] Checkout actualizado para validación
- [x] Build exitoso
- [ ] Migración aplicada en producción
- [ ] Documento de términos activo creado
- [ ] Testing en ambiente de desarrollo
- [ ] Testing en ambiente de producción

---

**Implementado por:** Claude Code
**Fecha:** 2024-02-02
**Estado:** ✅ Completado - Listo para Deploy
