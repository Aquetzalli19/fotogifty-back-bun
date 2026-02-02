# 🚂 Guía de Deploy en Railway - Express Bun API

## 🔴 Problema Identificado

El deploy fallaba con el error:
```
Container failed to start
```

**Causa**: Sharp (librería de procesamiento de imágenes) requiere dependencias nativas del sistema que no estaban disponibles.

## ✅ Solución Implementada

Se han creado los siguientes archivos para solucionar el problema:

### 1. `nixpacks.toml` - Configuración de Dependencias

Especifica las dependencias del sistema necesarias para Sharp:
- `vips` - Librería principal para procesamiento de imágenes
- `pkg-config` - Configuración de paquetes
- `glib`, `cairo`, `pango` - Dependencias de rendering

### 2. `package.json` - Scripts Actualizados

- **build**: Ahora genera el Prisma Client antes de compilar
- **start**: Ejecuta el archivo compilado en `dist/index.js`

### 3. `Dockerfile` - Deploy Alternativo

Dockerfile optimizado para Bun + Sharp con Alpine Linux.

### 4. `.dockerignore` - Optimización

Excluye archivos innecesarios del build.

## 📋 Pasos para Deploy

### Opción 1: Push a Git (Recomendado)

```bash
# 1. Commit todos los cambios
git add .
git commit -m "fix: add Railway deploy configuration with Sharp dependencies"

# 2. Push al repositorio
git push origin main
```

Railway detectará automáticamente los cambios y redesplegará usando `nixpacks.toml`.

### Opción 2: Deploy Manual desde Railway CLI

```bash
# 1. Instalar Railway CLI (si no lo tienes)
npm i -g @railway/cli

# 2. Login
railway login

# 3. Link al proyecto
railway link

# 4. Deploy
railway up
```

### Opción 3: Forzar uso del Dockerfile

Si nixpacks sigue fallando, puedes forzar que Railway use el Dockerfile:

1. Ve al dashboard de Railway
2. Settings → Deploy
3. En "Build Configuration":
   - Build Command: `bun run build`
   - Start Command: `bun run start`
4. En "Advanced":
   - Builder: `DOCKERFILE`

## 🔍 Verificar Variables de Entorno

Asegúrate de que Railway tenga todas las variables configuradas:

```bash
# Variables requeridas
DATABASE_URL=mysql://...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=fotogifty
JWT_SECRET=...
JWT_EXPIRES_IN=24h
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
PORT=3001
```

## 🐛 Troubleshooting

### Error: "Container failed to start"

**Solución 1**: Verificar que nixpacks.toml esté en la raíz del proyecto
```bash
ls -la nixpacks.toml
```

**Solución 2**: Ver logs completos en Railway
1. Dashboard → Deployments
2. Click en el deployment fallido
3. Ver "Build Logs" y "Deploy Logs"

**Solución 3**: Forzar rebuild
```bash
# En Railway dashboard
Settings → Redeploy
```

### Error: "Sharp installation failed"

Si nixpacks no funciona, usa el Dockerfile:
```bash
# En Railway dashboard
Settings → Deploy → Builder: DOCKERFILE
```

### Error: "Cannot find module '@prisma/client'"

Verifica que el build ejecute `prisma generate`:
```bash
# Local test
bun run build
# Debe mostrar: "Generated Prisma Client"
```

### Error: "Port already in use"

Railway asigna el puerto automáticamente. Asegúrate de que tu código use:
```typescript
const PORT = process.env.PORT || 3001;
```

## 🔄 Después del Deploy

### 1. Verificar que el servidor inició correctamente

Logs en Railway deben mostrar:
```
🚀 Servidor escuchando en puerto 3001
📚 Swagger docs disponibles en http://localhost:3001/api-docs
```

### 2. Probar el endpoint de salud

```bash
curl https://tu-app.up.railway.app/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-02-02T..."
}
```

### 3. Probar el endpoint del ZIP (con token)

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://tu-app.up.railway.app/api/pedidos/31/fotos/download-zip \
  -o test.zip
```

### 4. Obtener la URL pública

Railway te asignará una URL automáticamente:
```
https://express-bun-api-production.up.railway.app
```

Copia esta URL y úsala en el frontend.

## 🔐 Seguridad

### Variables Sensibles

NUNCA commits estos valores al repositorio:
- ❌ `DATABASE_URL`
- ❌ `AWS_SECRET_ACCESS_KEY`
- ❌ `JWT_SECRET`
- ❌ `STRIPE_SECRET_KEY`

✅ Configúralos solo en Railway Dashboard → Variables

### CORS Configuration

Actualiza el frontend URL permitido en Railway:
```bash
# Railway Dashboard → Variables
FRONTEND_URL=https://tu-frontend.vercel.app
```

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# CLI
railway logs

# O en Dashboard
Deployments → [Latest] → Logs
```

### Métricas

Railway dashboard muestra:
- CPU usage
- Memory usage
- Request count
- Response times

## 🚀 Performance

### Configuración Recomendada para Producción

**Railway Plan**: Hobby ($5/month) o Pro
- 512MB RAM mínimo (Sharp consume memoria)
- 1 vCPU recomendado

**Optimizaciones**:
- El bundle es de ~5.3MB (optimizado)
- Sharp usa streaming (bajo uso de memoria)
- Archiver usa compresión nivel 9

## 📝 Checklist Final

Antes de considerar el deploy exitoso:

- [ ] Build completa sin errores
- [ ] Container inicia correctamente
- [ ] Health check responde 200
- [ ] Swagger docs accesibles
- [ ] Prisma Client generado
- [ ] Sharp funciona (probar subida de foto)
- [ ] Archiver funciona (probar descarga de ZIP)
- [ ] Todas las variables de entorno configuradas
- [ ] CORS permite el frontend
- [ ] Base de datos accesible
- [ ] S3 accesible

## 🎯 Resultado Esperado

Una vez deployado correctamente:

```bash
# Frontend puede llamar a:
GET https://tu-api.up.railway.app/api/pedidos/31/fotos/download-zip

# Y recibir un ZIP con:
✅ Fotos procesadas con Sharp (DPI 300, sRGB)
✅ Metadatos EXIF embebidos
✅ Archivo metadata.txt
✅ Compresión óptima
```

## 📞 Soporte

Si sigues teniendo problemas:

1. **Revisa logs**: `railway logs --tail 100`
2. **Verifica variables**: Railway Dashboard → Variables
3. **Prueba local**: `bun run build && bun run start`
4. **Rollback**: Railway permite volver a deploys anteriores

---

**Fecha**: 2024-02-02
**Versión**: 1.0
**Estado**: ✅ Listo para deploy
