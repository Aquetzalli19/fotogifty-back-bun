#!/bin/bash

# Script para deployar en Railway con verificaciones

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Deploy a Railway - Express Bun API              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Verificar que estamos en la rama correcta
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}📍 Rama actual: $CURRENT_BRANCH${NC}"

if [ "$CURRENT_BRANCH" != "main" ]; then
  read -p "⚠️  No estás en la rama 'main'. ¿Continuar de todas formas? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deploy cancelado${NC}"
    exit 1
  fi
fi

# 2. Verificar archivos críticos
echo ""
echo -e "${YELLOW}🔍 Verificando archivos de configuración...${NC}"

FILES_TO_CHECK=(
  "nixpacks.toml"
  "Dockerfile"
  ".dockerignore"
  "package.json"
  "prisma/schema.prisma"
)

ALL_FILES_EXIST=true
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}  ✓ $file${NC}"
  else
    echo -e "${RED}  ✗ $file (faltante)${NC}"
    ALL_FILES_EXIST=false
  fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
  echo -e "${RED}❌ Faltan archivos críticos. Deploy cancelado.${NC}"
  exit 1
fi

# 3. Verificar que el build funciona localmente
echo ""
echo -e "${YELLOW}🔨 Probando build local...${NC}"

if bun run build; then
  echo -e "${GREEN}✅ Build exitoso${NC}"
else
  echo -e "${RED}❌ Error en build local. Corrige los errores antes de deployar.${NC}"
  exit 1
fi

# 4. Verificar que dist/index.js existe
if [ ! -f "dist/index.js" ]; then
  echo -e "${RED}❌ dist/index.js no existe. Build falló.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ dist/index.js creado correctamente${NC}"

# 5. Verificar cambios pendientes
echo ""
echo -e "${YELLOW}📝 Verificando cambios...${NC}"

if [[ -z $(git status -s) ]]; then
  echo -e "${YELLOW}⚠️  No hay cambios para commitear${NC}"
  read -p "¿Deseas forzar redeploy en Railway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deploy cancelado${NC}"
    exit 0
  fi
else
  git status -s
fi

# 6. Commit y push
if [[ ! -z $(git status -s) ]]; then
  echo ""
  echo -e "${YELLOW}💾 Commiteando cambios...${NC}"

  # Pedir mensaje de commit
  read -p "Mensaje de commit (Enter para usar default): " COMMIT_MSG

  if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="fix: add Railway deploy configuration with Sharp dependencies"
  fi

  git add .
  git commit -m "$COMMIT_MSG"

  echo -e "${GREEN}✅ Commit creado${NC}"
fi

# 7. Push
echo ""
echo -e "${YELLOW}🚀 Pusheando a GitHub...${NC}"

if git push origin "$CURRENT_BRANCH"; then
  echo -e "${GREEN}✅ Push exitoso${NC}"
else
  echo -e "${RED}❌ Error al pushear. Verifica tu conexión y permisos.${NC}"
  exit 1
fi

# 8. Información post-deploy
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Deploy Iniciado                          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Código pusheado exitosamente${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo ""
echo "  1. Ve al dashboard de Railway:"
echo "     https://railway.app/dashboard"
echo ""
echo "  2. Monitorea el deploy en tiempo real:"
echo "     Deployments → [Latest] → Logs"
echo ""
echo "  3. Verifica que el build incluya:"
echo "     ✓ 'Generated Prisma Client'"
echo "     ✓ 'Bundled XXXX modules'"
echo "     ✓ 'Container started successfully'"
echo ""
echo "  4. Una vez deployado, prueba el health check:"
echo "     curl https://tu-app.up.railway.app/health"
echo ""
echo "  5. Prueba el endpoint del ZIP:"
echo "     curl -H \"Authorization: Bearer \$TOKEN\" \\"
echo "       https://tu-app.up.railway.app/api/pedidos/31/fotos/download-zip \\"
echo "       -o test.zip"
echo ""
echo -e "${YELLOW}⏱️  Tiempo estimado de deploy: 2-3 minutos${NC}"
echo ""
echo -e "${GREEN}🎉 ¡Deploy completado!${NC}"
