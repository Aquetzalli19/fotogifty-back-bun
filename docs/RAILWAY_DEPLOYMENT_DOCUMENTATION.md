# Documentación para desplegar Express Bun API en Railway

## Índice
1. [Requisitos previos y consideraciones](#requisitos-previos-y-consideraciones)
2. [Configuración inicial en Railway](#configuración-inicial-en-railway)
3. [Configuración de variables de entorno](#configuración-de-variables-de-entorno)
4. [Pasos para el despliegue](#pasos-para-el-despliegue)
5. [Configuración de base de datos](#configuración-de-base-de-datos)
6. [Consideraciones de seguridad](#consideraciones-de-seguridad)

---

## Requisitos previos y consideraciones

Antes de desplegar tu API Express Bun en Railway, asegúrate de cumplir con los siguientes requisitos:

### Requisitos del sistema
- Cuenta activa en [Railway](https://railway.app/)
- Proyecto en GitHub (Railway despliega directamente desde GitHub)
- Cuenta de AWS S3 (para el almacenamiento de imágenes)
- Cuenta de Stripe (para pagos - opcional si usas el sistema de pedidos)

### Preparación del proyecto
1. Asegúrate de tener un archivo `package.json` con todas las dependencias especificadas
2. Verifica que tu archivo `package.json` contenga los scripts necesarios:
   ```json
   {
     "scripts": {
       "dev": "bun run src/index.ts",
       "start": "bun run src/index.ts",
       "build": "bun build --outfile dist/index.js src/index.ts"
     }
   }
   ```

3. Tu aplicación debe escuchar en el puerto proporcionado por Railway:
   ```typescript
   const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
   ```

4. Asegúrate de que tu archivo `.env` contenga todas las variables de entorno necesarias (sin valores sensibles)
5. Verifica que tu archivo `.gitignore` incluya:
   ```
   .env
   node_modules
   dist
   ```

---

## Configuración inicial en Railway

### Paso 1: Crear una cuenta en Railway
1. Visita [railway.app](https://railway.app) y crea una cuenta
2. Verifica tu correo electrónico
3. Inicia sesión en tu cuenta

### Paso 2: Conectar tu repositorio de GitHub
1. Haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca y selecciona tu repositorio de Express Bun API
4. Haz clic en "Continue"

### Paso 3: Configurar el proyecto en Railway
1. En la página de proyecto, verás la vista de "Railway Up" que despliega automáticamente tu proyecto
2. Puedes personalizar el nombre del proyecto si lo deseas
3. En la pestaña "Settings", puedes ver y modificar la configuración del proyecto

### Paso 4: Verificar la configuración de despliegue
1. En la pestaña "Deployments", puedes ver el historial de despliegues
2. Cada push a tu repositorio de GitHub desencadenará automáticamente un nuevo despliegue
3. Puedes ver los logs de despliegue para verificar que todo esté funcionando correctamente

---

## Configuración de variables de entorno

Para que tu API funcione correctamente en Railway, necesitas configurar las siguientes variables de entorno en la pestaña "Variables" de tu proyecto:

### Variables de base de datos
```
DATABASE_URL = [cadena de conexión a la base de datos en Railway]
```

### Variables de AWS S3 (para almacenamiento de imágenes)
```
AWS_REGION = [tu región de AWS, por ejemplo: us-east-1]
AWS_ACCESS_KEY_ID = [tu clave de acceso de AWS]
AWS_SECRET_ACCESS_KEY = [tu clave secreta de AWS]
S3_BUCKET_NAME = [nombre de tu bucket S3]
```

### Variables de Stripe (si usas el sistema de pedidos)
```
STRIPE_SECRET_KEY = [clave secreta de Stripe]
STRIPE_WEBHOOK_SECRET = [clave de webhook de Stripe]
```

### Variables del servidor
```
PORT = 8080 (Railway proporciona esto automáticamente, pero puedes especificarlo)
BACKEND_API_URL = [URL de tu API en Railway]
```

### Cómo configurar las variables de entorno:
1. Ve a la pestaña "Variables" en tu proyecto de Railway
2. Haz clic en "New Variable"
3. Ingresa el nombre y valor de la variable
4. Haz clic en "Add"
5. Repite para todas las variables necesarias
6. Haz clic en "Deploy" para aplicar los cambios

### Variables sensibles:
No incluyas valores sensibles en tu archivo `.env` del repositorio. Usa Railway para gestionar todas las credenciales y claves sensibles.

---

## Pasos para el despliegue

### Paso 1: Preparar tu código
1. Asegúrate de que tu código esté en un repositorio de GitHub
2. Verifica que tu archivo `package.json` tenga los scripts correctos:
   ```json
   {
     "scripts": {
       "dev": "bun run src/index.ts",
       "start": "bun run src/index.ts",
       "build": "bun build --outfile dist/index.js src/index.ts"
     }
   }
   ```
3. Confirma que tu aplicación use el puerto proporcionado por Railway:
   ```typescript
   const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
   ```

### Paso 2: Conectar Railway con GitHub
1. Accede a [Railway](https://railway.app) y crea una cuenta
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Busca y selecciona tu repositorio de Express Bun API

### Paso 3: Configurar variables de entorno
1. En tu proyecto de Railway, haz clic en la pestaña "Variables"
2. Agrega todas las variables de entorno necesarias (ver sección anterior)
3. Asegúrate de incluir DATABASE_URL, credenciales de AWS S3, y cualquier otra variable sensible

### Paso 4: Configurar el entorno de Railway
1. En la pestaña "Settings", puedes configurar el nombre del proyecto
2. En la pestaña "Deployments", puedes ver el historial y los logs de despliegue

### Paso 5: Desplegar tu aplicación
1. El primer despliegue comienza automáticamente después de conectar el repositorio
2. Verifica los logs de despliegue para asegurarte de que no haya errores
3. Una vez completado, recibirás una URL para acceder a tu API

### Paso 6: Verificar el despliegue
1. En la pestaña "Overview", puedes ver la URL de tu aplicación
2. Puedes usar esta URL para probar tu API
3. En la pestaña "Logs", puedes ver el estado en tiempo real de tu aplicación

### Paso 7: Configurar el dominio (opcional)
1. En la pestaña "Settings", haz clic en "Change Domain"
2. Puedes usar un subdominio de Railway o conectar un dominio personalizado

---

## Configuración de base de datos

Railway ofrece una forma sencilla de configurar y gestionar tu base de datos MySQL para tu API Express Bun.

### Paso 1: Crear un servicio de base de datos en Railway
1. En tu proyecto de Railway, haz clic en "New" en el panel izquierdo
2. Selecciona "Database"
3. Elige "MySQL" como tipo de base de datos
4. Selecciona la opción "Provision PostgreSQL/MySQL" o "Deploy from Template" dependiendo de la interfaz

### Paso 2: Conectar tu base de datos a tu aplicación
1. Una vez creada la base de datos, Railway generará automáticamente la cadena de conexión
2. Esta cadena de conexión estará disponible como variable de entorno `DATABASE_URL`
3. Tu aplicación usará esta variable para conectarse a la base de datos

### Paso 3: Configurar Prisma para Railway
1. Asegúrate de que tu archivo `schema.prisma` esté correctamente configurado:
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
2. En Railway, Prisma se encargará de ejecutar las migraciones automáticamente si tienes el plugin de Prisma instalado

### Paso 4: Ejecutar migraciones
Opción A - Automático (recomendado):
1. Railway puede ejecutar migraciones automáticamente si configuras un hook de despliegue
2. En la pestaña "Deployments", puedes agregar un hook de pre-deploy o post-deploy
3. Ejecuta `bunx prisma db push` o `bunx prisma migrate deploy` como comando de pre-despliegue

Opción B - Manual:
1. Puedes usar el terminal integrado de Railway para ejecutar migraciones manualmente
2. Accede al terminal desde la pestaña "Deployments" o usando `railway console`
3. Ejecuta comandos como:
   ```bash
   bunx prisma db push
   ```

### Paso 5: Verificar la conexión
1. En la pestaña "Overview" de tu base de datos, puedes ver estadísticas y conexión
2. Puedes usar la pestaña "Connect" para ver detalles de conexión y credenciales
3. Verifica que tu aplicación pueda conectarse a la base de datos revisando los logs

### Paso 6: Gestionar datos y esquema
1. Railway proporciona una interfaz web para ver y editar tus datos
2. También puedes usar herramientas como Prisma Studio para explorar tu base de datos
3. Recuerda que cualquier cambio en el esquema debe reflejarse en tu archivo Prisma y aplicarse como migración

---

## Consideraciones de seguridad

### Gestión de credenciales
1. **Nunca** incluyas credenciales en tu código fuente
2. Usa variables de entorno para todas las credenciales sensibles
3. Configura todas las variables sensibles en Railway, no en archivos locales
4. Usa claves de API con el mínimo de permisos necesario

### Variables de entorno sensibles
- No expongas `DATABASE_URL`, `AWS_SECRET_ACCESS_KEY`, `STRIPE_SECRET_KEY` en el frontend
- Asegúrate de que las variables de entorno sensibles estén cifradas en Railway

### API Keys y tokens
- Usa tokens con caducidad cuando sea posible
- Rotar regularmente las claves de acceso
- Usa diferentes claves de API para entornos de desarrollo y producción

### Control de acceso
- Limita el acceso a tu repositorio de GitHub
- Configura propietarios y colaboradores apropiados en Railway
- Usa autenticación y autorización en tu API

### Registro de auditoría
- Implementa logs para eventos de seguridad
- No registres información sensible en los logs
- Usa herramientas de monitoreo para detectar accesos sospechosos
