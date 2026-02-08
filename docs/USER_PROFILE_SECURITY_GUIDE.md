# Guía de Endpoints de Seguridad - Perfil de Usuario

## ✅ Resumen de Implementación

Se han implementado exitosamente los endpoints de seguridad para el perfil de usuario que requería el equipo de frontend.

---

## 🎯 Problema Resuelto

**Antes:**
- La verificación de contraseña en el frontend era falsa (solo verificaba campo no vacío)
- El cambio de email no funcionaba (no se enviaba contraseña para verificar identidad)

**Ahora:**
- Verificación real de contraseña contra la base de datos
- Actualización de email con verificación obligatoria de contraseña
- Endpoint de cambio de contraseña ya existía y está verificado ✅

---

## 📡 API Endpoints Implementados

### 1. POST /api/usuarios/:id/verify-password (NUEVO) ✅

Verifica si la contraseña proporcionada es correcta para el usuario.

```bash
POST /api/usuarios/{id}/verify-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "password": "password123"
}
```

**Respuestas:**

```json
// Contraseña correcta
{
  "success": true,
  "valid": true
}

// Contraseña incorrecta
{
  "success": true,
  "valid": false
}

// Usuario no encontrado
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

**Códigos de estado:**
- `200`: Verificación exitosa
- `400`: Datos de entrada inválidos
- `401`: Acceso no autorizado
- `403`: Acceso denegado (intentando verificar contraseña de otro usuario)
- `404`: Usuario no encontrado
- `500`: Error interno del servidor

---

### 2. PUT /api/usuarios/:id/email (NUEVO) ✅

Actualiza el email del usuario con verificación de contraseña.

```bash
PUT /api/usuarios/{id}/email
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "nuevoemail@ejemplo.com",
  "currentPassword": "password123"
}
```

**Respuestas:**

```json
// Email actualizado exitosamente
{
  "success": true,
  "data": {
    "id": 1,
    "email": "nuevoemail@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "+34612345678",
    "fecha_registro": "2024-01-15T10:30:00.000Z",
    "activo": true,
    "tipo": "cliente"
  },
  "message": "Email actualizado exitosamente"
}

// Contraseña incorrecta
{
  "success": false,
  "message": "Contraseña incorrecta"
}

// Email ya en uso
{
  "success": false,
  "message": "El email ya está en uso por otro usuario"
}
```

**Códigos de estado:**
- `200`: Email actualizado exitosamente
- `400`: Formato de email inválido o datos faltantes
- `401`: Contraseña incorrecta
- `403`: Acceso denegado (intentando actualizar email de otro usuario)
- `404`: Usuario no encontrado
- `409`: El email ya está en uso por otro usuario
- `500`: Error interno del servidor

---

### 3. PUT /api/usuarios/:id/password (VERIFICADO) ✅

Este endpoint **YA EXISTÍA** y funciona correctamente. Valida la contraseña actual antes de cambiarla.

```bash
PUT /api/usuarios/{id}/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Respuestas:**

```json
// Contraseña actualizada exitosamente
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "+34612345678",
    "fecha_registro": "2024-01-15T10:30:00.000Z",
    "activo": true,
    "tipo": "cliente"
  },
  "message": "Contraseña actualizada exitosamente"
}

// Contraseña actual incorrecta
{
  "success": false,
  "message": "Contraseña actual incorrecta"
}
```

**Códigos de estado:**
- `200`: Contraseña actualizada exitosamente
- `400`: Datos de entrada inválidos (contraseña nueva muy corta)
- `401`: Contraseña actual incorrecta o acceso no autorizado
- `403`: Acceso denegado (intentando cambiar contraseña de otro usuario)
- `404`: Usuario no encontrado
- `500`: Error interno del servidor

---

## 🔐 Seguridad Implementada

### Validación de Propiedad

**CRÍTICO:** Todos los endpoints validan que el usuario autenticado solo pueda modificar su propio perfil (a menos que sea administrador).

```typescript
// Verificación en todos los endpoints
const tokenUserId = req.user?.id;
const esAdmin = req.user?.tipo === 'admin' || req.user?.tipo === 'super_admin';

if (tokenUserId !== usuarioId && !esAdmin) {
  res.status(403).json({
    success: false,
    message: 'Acceso denegado. Solo puedes modificar tu propio perfil.'
  });
  return;
}
```

### Validación de Contraseña

- **Verificación real:** Usa bcrypt a través de `PasswordService.verifyPassword()`
- **Timing attack protection:** bcrypt previene ataques de temporización
- **No expone información:** Respuesta es solo `valid: true/false`

### Validación de Email

- **Formato:** Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Unicidad:** Verifica que el email no esté en uso por otro usuario
- **Case sensitive:** Los emails son case-sensitive en la DB

---

## 🧪 Testing con cURL

### 1. Login para obtener token

```bash
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"
```

### 2. Verificar contraseña

```bash
# Contraseña correcta
curl -X POST http://localhost:3001/api/usuarios/1/verify-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"password123"}'

# Contraseña incorrecta
curl -X POST http://localhost:3001/api/usuarios/1/verify-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"wrongpassword"}'
```

### 3. Actualizar email

```bash
curl -X PUT http://localhost:3001/api/usuarios/1/email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"nuevoemail@ejemplo.com",
    "currentPassword":"password123"
  }'
```

### 4. Cambiar contraseña

```bash
curl -X PUT http://localhost:3001/api/usuarios/1/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword":"password123",
    "newPassword":"newpassword456"
  }'
```

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

**Use Cases:**
- `src/application/use-cases/verificar-password-usuario.use-case.ts` - Verifica si la contraseña es correcta
- `src/application/use-cases/actualizar-email-usuario.use-case.ts` - Actualiza email con verificación de contraseña

### Archivos Modificados

**Controllers:**
- `src/infrastructure/controllers/usuario.controller.ts`
  - Añadido método `verifyPassword()`
  - Añadido método `updateEmail()`
  - Añadidas dependencias de use cases en constructor

**Routes:**
- `src/infrastructure/routes/usuario.routes.ts`
  - Añadida ruta `POST /usuarios/:id/verify-password`
  - Añadida ruta `PUT /usuarios/:id/email`
  - Documentación Swagger completa para ambos endpoints
  - Instanciación de nuevos use cases

---

## 🔄 Integración con Frontend

### Verificación de Contraseña

```typescript
// Antes (INCORRECTO - solo verificaba campo no vacío)
const handleVerifyPassword = async (password: string) => {
  if (!password) {
    setIsPasswordValid(false);
    return;
  }
  setIsPasswordValid(true);
};

// Ahora (CORRECTO - verifica con backend)
const handleVerifyPassword = async (password: string) => {
  try {
    const response = await fetch(`/api/usuarios/${user.id}/verify-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    const result = await response.json();

    if (result.success) {
      setIsPasswordValid(result.valid);
    } else {
      setIsPasswordValid(false);
      setError(result.message);
    }
  } catch (error) {
    setIsPasswordValid(false);
    setError('Error al verificar contraseña');
  }
};
```

### Actualización de Email

```typescript
// Antes (INCORRECTO - no enviaba contraseña)
const handleEmailChange = async (newEmail: string) => {
  const response = await fetch(`/api/usuarios/${user.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: newEmail })
  });
  // ...
};

// Ahora (CORRECTO - requiere verificación de contraseña)
const handleEmailChange = async (newEmail: string, currentPassword: string) => {
  try {
    const response = await fetch(`/api/usuarios/${user.id}/email`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: newEmail,
        currentPassword
      })
    });

    const result = await response.json();

    if (result.success) {
      setUser(result.data);
      setMessage('Email actualizado exitosamente');
    } else {
      if (result.error === 'INVALID_PASSWORD') {
        setError('Contraseña incorrecta');
      } else if (result.error === 'EMAIL_IN_USE') {
        setError('El email ya está en uso');
      } else {
        setError(result.message);
      }
    }
  } catch (error) {
    setError('Error al actualizar email');
  }
};
```

---

## ⚠️ Consideraciones Importantes

### Manejo de Errores

El frontend debe manejar específicamente estos casos:

1. **Verificación de Contraseña:**
   - `valid: true` - Contraseña correcta, permitir continuar
   - `valid: false` - Contraseña incorrecta, mostrar error

2. **Actualización de Email:**
   - `error: 'INVALID_PASSWORD'` - Contraseña incorrecta
   - `error: 'EMAIL_IN_USE'` - Email ya registrado
   - `error: 'INVALID_EMAIL_FORMAT'` - Formato inválido
   - `error: 'USER_NOT_FOUND'` - Usuario no existe

3. **Cambio de Contraseña:**
   - `401` - Contraseña actual incorrecta
   - `400` - Nueva contraseña muy corta (< 6 caracteres)

### Validaciones del Frontend

Aunque el backend valida todo, el frontend debe validar antes de enviar para mejor UX:

```typescript
// Validación de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError('Formato de email inválido');
  return;
}

// Validación de contraseña
if (newPassword.length < 6) {
  setError('La contraseña debe tener al menos 6 caracteres');
  return;
}
```

---

## 📖 Documentación

- **Swagger UI**: http://localhost:3001/api-docs
- **Tag**: "Usuarios"
- **Rutas nuevas:**
  - POST `/api/usuarios/{id}/verify-password`
  - PUT `/api/usuarios/{id}/email`

---

## ✅ Verificación de Implementación

```bash
# 1. Compilar proyecto
bun run build

# 2. Iniciar servidor
bun run dev

# 3. Probar endpoints en Swagger
curl http://localhost:3001/api-docs

# 4. Hacer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 5. Verificar contraseña con token obtenido
# 6. Actualizar email con token obtenido
```

---

## 🎉 Resumen de Estado

| Endpoint | Estado | Validación de Contraseña | Notas |
|----------|--------|--------------------------|-------|
| POST `/api/usuarios/:id/verify-password` | ✅ NUEVO | Sí | Verifica contraseña contra DB |
| PUT `/api/usuarios/:id/email` | ✅ NUEVO | Sí | Requiere contraseña actual |
| PUT `/api/usuarios/:id/password` | ✅ VERIFICADO | Sí | Ya existía y funciona correctamente |

**Beneficios principales:**
- ✅ Seguridad: Validación real de contraseña con bcrypt
- ✅ Protección: Solo el usuario puede modificar su propio perfil
- ✅ Integridad: Email único en la base de datos
- ✅ Documentación: Swagger completa para todos los endpoints
- ✅ Compatibilidad: Listo para integración con frontend

---

## 📋 Checklist de Integración Frontend

- [ ] Actualizar llamada de `handleVerifyPassword` para usar POST `/api/usuarios/:id/verify-password`
- [ ] Actualizar llamada de cambio de email para usar PUT `/api/usuarios/:id/email`
- [ ] Agregar manejo de errores específicos (INVALID_PASSWORD, EMAIL_IN_USE, etc.)
- [ ] Verificar que el cambio de contraseña usa PUT `/api/usuarios/:id/password` correctamente
- [ ] Testing end-to-end de los tres flujos
- [ ] Actualizar mensajes de error para el usuario final

---

**Estado:** ✅ Backend completamente implementado y listo para integración
