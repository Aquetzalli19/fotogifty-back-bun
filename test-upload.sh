#!/bin/bash

# Script de prueba para subir una foto
# Uso: ./test-upload.sh /ruta/a/tu/imagen.jpg

if [ -z "$1" ]; then
  echo "Uso: ./test-upload.sh /ruta/a/tu/imagen.jpg"
  exit 1
fi

IMAGE_PATH="$1"

if [ ! -f "$IMAGE_PATH" ]; then
  echo "Error: El archivo $IMAGE_PATH no existe"
  exit 1
fi

echo "Subiendo archivo: $IMAGE_PATH"
echo "----------------------------------------"

curl -X POST http://localhost:3001/api/fotos/upload \
  -F "foto=@$IMAGE_PATH" \
  -F "usuarioId=1" \
  -F "pedidoId=1" \
  -F "itemPedidoId=1" \
  -v

echo ""
echo "----------------------------------------"
echo "Prueba completada"
