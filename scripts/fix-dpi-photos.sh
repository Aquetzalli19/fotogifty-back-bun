#!/bin/bash

# Script para corregir DPI de fotos existentes en la BD

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración de BD desde variables de entorno o usar Railway
DB_HOST="${DB_HOST:-gondola.proxy.rlwy.net}"
DB_PORT="${DB_PORT:-42206}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-nmpMaYAgOoCkQTiXgnCXmyTIEUZIBQtc}"
DB_NAME="${DB_NAME:-railway}"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Corrección de DPI en Fotos Existentes              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 Conexión a base de datos:${NC}"
echo "  Host: $DB_HOST"
echo "  Puerto: $DB_PORT"
echo "  Base de datos: $DB_NAME"
echo ""

# Función para ejecutar query
execute_query() {
    local query="$1"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "$query" 2>&1 | grep -v "Warning"
}

# 1. Mostrar estado actual
echo -e "${YELLOW}🔍 Verificando estado actual de las fotos...${NC}"
echo ""

QUERY_CHECK="
SELECT
    COUNT(*) AS total_fotos,
    SUM(CASE WHEN f.resolucion_foto != p.resolucion_foto THEN 1 ELSE 0 END) AS fotos_con_dpi_incorrecto,
    SUM(CASE WHEN f.resolucion_foto = p.resolucion_foto THEN 1 ELSE 0 END) AS fotos_correctas
FROM fotos f
INNER JOIN items_pedido ip ON f.item_pedido_id = ip.id
INNER JOIN paquetes_predefinidos p ON ip.paquete_id = p.id
WHERE p.resolucion_foto IS NOT NULL;
"

execute_query "$QUERY_CHECK"

echo ""
echo -e "${YELLOW}📊 Muestra de fotos con DPI incorrecto:${NC}"
echo ""

QUERY_SAMPLE="
SELECT
    f.id,
    f.nombre_archivo,
    f.resolucion_foto AS dpi_actual,
    p.resolucion_foto AS dpi_correcto
FROM fotos f
INNER JOIN items_pedido ip ON f.item_pedido_id = ip.id
INNER JOIN paquetes_predefinidos p ON ip.paquete_id = p.id
WHERE p.resolucion_foto IS NOT NULL
  AND f.resolucion_foto != p.resolucion_foto
LIMIT 5;
"

execute_query "$QUERY_SAMPLE"

echo ""
echo -e "${RED}⚠️  ATENCIÓN: Esta operación actualizará los DPI en la base de datos${NC}"
echo ""
read -p "¿Deseas continuar con la corrección? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Operación cancelada${NC}"
    exit 0
fi

# 2. Ejecutar corrección
echo ""
echo -e "${YELLOW}🔧 Corrigiendo DPI de las fotos...${NC}"

QUERY_UPDATE="
UPDATE fotos f
INNER JOIN items_pedido ip ON f.item_pedido_id = ip.id
INNER JOIN paquetes_predefinidos p ON ip.paquete_id = p.id
SET
    f.resolucion_foto = p.resolucion_foto,
    f.ancho_foto = ROUND((f.ancho_foto * f.resolucion_foto) / p.resolucion_foto, 2),
    f.alto_foto = ROUND((f.alto_foto * f.resolucion_foto) / p.resolucion_foto, 2)
WHERE
    p.resolucion_foto IS NOT NULL
    AND f.resolucion_foto != p.resolucion_foto;
"

if execute_query "$QUERY_UPDATE"; then
    echo -e "${GREEN}✅ DPI corregidos exitosamente${NC}"
else
    echo -e "${RED}❌ Error al corregir DPI${NC}"
    exit 1
fi

# 3. Verificar resultado
echo ""
echo -e "${YELLOW}🔍 Verificando resultado...${NC}"
echo ""

execute_query "$QUERY_CHECK"

echo ""
echo -e "${GREEN}✅ Operación completada${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo "  1. Las nuevas fotos que se suban usarán automáticamente el DPI correcto"
echo "  2. Las fotos existentes en S3 ya tienen los DPI correctos embebidos"
echo "  3. Al descargar el ZIP, ahora usará el DPI correcto de la BD"
echo ""
