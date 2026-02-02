# Dockerfile para Express Bun API con Sharp
# Optimizado para Railway

FROM oven/bun:1.3.8-alpine AS base

# Instalar dependencias del sistema necesarias para Sharp
RUN apk add --no-cache \
    vips-dev \
    vips-tools \
    build-base \
    python3 \
    cairo-dev \
    pango-dev \
    giflib-dev \
    libexif-dev

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lock* ./
COPY prisma ./prisma

# Instalar dependencias
FROM base AS install
RUN bun install --frozen-lockfile

# Generar Prisma Client
RUN bunx prisma generate

# Build stage
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Build de la aplicación
RUN bun run build

# Production stage
FROM oven/bun:1.3.8-alpine AS release

# Instalar solo dependencias runtime necesarias para Sharp
RUN apk add --no-cache \
    vips \
    cairo \
    pango \
    giflib \
    libexif

WORKDIR /app

# Copiar dependencias y build
COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["bun", "run", "start"]
