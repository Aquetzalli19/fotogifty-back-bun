# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photo printing e-commerce API built with Express.js on Bun runtime. Handles user accounts, photo packages, orders with Stripe payments, photo uploads to AWS S3, landing page CMS, and temporary cart management.

**Runtime**: Bun v1.2.21 | **Database**: MySQL via Prisma ORM | **Port**: 3001

## Essential Commands

```bash
bun install                    # Install dependencies
bun run dev                    # Dev server with watch mode (--watch)
bun run build                  # Prisma generate + bun build to dist/
bun run start                  # Production (runs dist/index.js)
bun run test                   # Run tests (bun test)
bun run db:seed                # Seed database
bunx prisma db push            # Push schema changes (dev)
bunx prisma migrate deploy     # Deploy migrations (prod)
bunx prisma generate           # Regenerate Prisma client
bunx prisma studio             # Database GUI
docker compose up -d           # Start MySQL + phpMyAdmin (port 8080)
```

## Architecture — Hexagonal (Ports & Adapters)

```
src/
├── domain/entities/       # Pure business models (Usuario, Pedido, Paquete, etc.)
├── domain/ports/          # Repository interfaces (*.repository.port.ts)
├── application/use-cases/ # Business logic — one class per operation (73+ use cases)
├── infrastructure/
│   ├── repositories/      # Prisma implementations (prisma-*.repository.ts)
│   ├── controllers/       # HTTP request handlers
│   ├── routes/            # Express route definitions (22 modules, all under /api)
│   ├── services/          # External integrations (S3, Stripe, bcrypt, JWT, ImageValidation)
│   ├── middlewares/       # Auth middleware (JWT + role-based)
│   ├── config/            # Swagger config
│   ├── database/          # Prisma client singleton
│   └── server/            # Express app bootstrap
└── shared/                # Shared utilities
```

**Dependency flow**: Routes → Controllers → Use Cases → Repository Ports ← Prisma Repositories

**Path aliases** (tsconfig.json): `@domain/*`, `@application/*`, `@infrastructure/*`, `@shared/*`

### Key Patterns

- **Repository ports**: Interfaces in `domain/ports/`, Prisma implementations in `infrastructure/repositories/`
- **Entity mapping**: Repositories use `toDomain()` and `toPrisma()` methods for conversion
- **Use cases**: Each business operation is a standalone class (e.g., `crear-pedido.use-case.ts`)
- **Route registration**: All routes wired in `infrastructure/routes/index.ts`

## User Type System

Base `usuarios` table extended through relationships:

| Type | Role String | Related Table | Notes |
|------|------------|---------------|-------|
| Cliente | `cliente` | — | Default user |
| Admin | `admin` | `administradores` (nivel_acceso: 1) | |
| Super Admin | `super_admin` | `administradores` (nivel_acceso: 2) | |
| Store/Vendedor | `store` | `stores` (codigo_empleado) | |

User type is determined by checking related tables during reads. Creating admin/store users auto-creates the related record.

## Authentication

- JWT-based with separate login endpoints: `/api/auth/login/cliente`, `/api/auth/login/admin`, `/api/auth/login/store`
- Token payload: `{ id, email, tipo }`
- Middleware chain: `authenticateToken` → `requireRole(...)` or shortcuts (`requireAdmin`, `requireCliente`, `requireSuperAdmin`, `requireVendedor`)
- `requireTermsAcceptance` middleware blocks users who haven't accepted current terms version
- Services: `PasswordService` (bcrypt), `TokenService` (JWT) in `infrastructure/services/`

## Payments

- Stripe Checkout Sessions — amounts in MXN, converted to centavos (×100)
- `StripeService` in `infrastructure/services/stripe.service.ts`
- Webhook verification via `constructWebhookEventAsync()`

## File Uploads

- Multer with memory storage (5MB limit) → Sharp for image processing → S3Service for storage
- Temporary images support expiration dates

## Environment Variables

Required: `DATABASE_URL`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
Optional: `PORT` (3001), `JWT_SECRET`, `JWT_EXPIRES_IN` (24h)

## Adding a New Feature

1. Domain entity in `domain/entities/`
2. Port interface in `domain/ports/`
3. Prisma repository in `infrastructure/repositories/`
4. Use case in `application/use-cases/`
5. Controller in `infrastructure/controllers/`
6. Routes in `infrastructure/routes/` + register in `routes/index.ts`

For database changes: modify `prisma/schema.prisma` → `bunx prisma db push` → update domain entities + repository mappers.

## API Docs

Swagger UI at `http://localhost:3001/api-docs`. Routes use JSDoc annotations for Swagger generation.

## Deployment

Railway.app with Docker (multi-stage Bun Alpine build). See `docs/RAILWAY_DEPLOYMENT*.md`.
