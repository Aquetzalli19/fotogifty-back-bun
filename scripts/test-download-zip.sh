#!/bin/bash

# Script de prueba para el endpoint de descarga de ZIP de fotos
# Uso: ./scripts/test-download-zip.sh <pedido_id> <token_admin>

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
API_URL="${API_URL:-http://localhost:3001}"
PEDIDO_ID="${1:-31}"  # Default pedido 31
TOKEN="${2}"

echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║     Test de Descarga de ZIP de Fotos de Pedido           ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validar que se proporcionó el token
if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Error: Debes proporcionar el token de administrador${NC}"
  echo ""
  echo "Uso:"
  echo "  $0 <pedido_id> <token_admin>"
  echo ""
  echo "Ejemplo:"
  echo "  $0 31 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  exit 1
fi

echo -e "${GREEN}📋 Configuración:${NC}"
echo "  - API URL: $API_URL"
echo "  - Pedido ID: $PEDIDO_ID"
echo "  - Token: ${TOKEN:0:20}..."
echo ""

# Crear directorio temporal
TEMP_DIR="$(mktemp -d)"
OUTPUT_FILE="$TEMP_DIR/pedido-${PEDIDO_ID}.zip"

echo -e "${YELLOW}📥 Descargando ZIP...${NC}"
echo ""

HTTP_CODE=$(curl -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -o "$OUTPUT_FILE" \
  -s \
  "$API_URL/api/pedidos/$PEDIDO_ID/fotos/download-zip")

echo "HTTP Status Code: $HTTP_CODE"
echo ""

# Verificar status code
if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Descarga exitosa${NC}"
  echo ""

  # Verificar que es un archivo ZIP válido
  if file "$OUTPUT_FILE" | grep -q "Zip archive"; then
    echo -e "${GREEN}✅ Archivo ZIP válido${NC}"

    # Mostrar información del ZIP
    echo ""
    echo -e "${YELLOW}📊 Información del archivo:${NC}"
    echo "  - Tamaño: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo "  - Ubicación: $OUTPUT_FILE"

    # Listar contenido del ZIP
    echo ""
    echo -e "${YELLOW}📂 Contenido del ZIP:${NC}"
    unzip -l "$OUTPUT_FILE"

    # Preguntar si descomprimir
    echo ""
    read -p "¿Deseas descomprimir el archivo para inspección? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      EXTRACT_DIR="$TEMP_DIR/extracted"
      mkdir -p "$EXTRACT_DIR"
      unzip -q "$OUTPUT_FILE" -d "$EXTRACT_DIR"

      echo -e "${GREEN}✅ Archivos descomprimidos en: $EXTRACT_DIR${NC}"
      echo ""

      # Verificar metadatos EXIF de una foto
      FIRST_PHOTO=$(find "$EXTRACT_DIR" -name "*.jpg" -o -name "*.jpeg" | head -1)
      if [ ! -z "$FIRST_PHOTO" ]; then
        echo -e "${YELLOW}🔍 Verificando metadatos EXIF de la primera foto:${NC}"

        if command -v exiftool &> /dev/null; then
          echo ""
          exiftool -ICC_Profile:ProfileDescription -XResolution -YResolution -Copyright -Artist "$FIRST_PHOTO"
        else
          echo -e "${YELLOW}⚠️  exiftool no está instalado. Instálalo para verificar metadatos EXIF:${NC}"
          echo "  brew install exiftool"
        fi
      fi

      # Mostrar contenido de metadata.txt
      if [ -f "$EXTRACT_DIR/metadata.txt" ]; then
        echo ""
        echo -e "${YELLOW}📄 Contenido de metadata.txt:${NC}"
        echo "════════════════════════════════════════════════════════════"
        cat "$EXTRACT_DIR/metadata.txt"
        echo "════════════════════════════════════════════════════════════"
      fi

      echo ""
      echo -e "${GREEN}Los archivos permanecerán en: $EXTRACT_DIR${NC}"
    else
      # Limpiar archivos temporales
      rm -rf "$TEMP_DIR"
      echo -e "${YELLOW}Archivos temporales eliminados${NC}"
    fi

  else
    echo -e "${RED}❌ El archivo descargado no es un ZIP válido${NC}"
    echo ""
    echo "Contenido del archivo:"
    cat "$OUTPUT_FILE"
    exit 1
  fi

elif [ "$HTTP_CODE" -eq 403 ]; then
  echo -e "${RED}❌ Error 403: Sin permisos${NC}"
  echo "Solo usuarios admin, super_admin o store pueden descargar fotos"
  cat "$OUTPUT_FILE"
  exit 1

elif [ "$HTTP_CODE" -eq 404 ]; then
  echo -e "${RED}❌ Error 404: Pedido no encontrado o sin fotos${NC}"
  cat "$OUTPUT_FILE"
  exit 1

elif [ "$HTTP_CODE" -eq 401 ]; then
  echo -e "${RED}❌ Error 401: Token inválido o expirado${NC}"
  cat "$OUTPUT_FILE"
  exit 1

else
  echo -e "${RED}❌ Error HTTP $HTTP_CODE${NC}"
  cat "$OUTPUT_FILE"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Test completado exitosamente${NC}"
