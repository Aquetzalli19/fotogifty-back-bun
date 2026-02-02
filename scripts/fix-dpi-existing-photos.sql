-- Script para corregir los DPI de fotos existentes en la base de datos
--
-- Problema: Las fotos tienen guardado el DPI original de la imagen subida (ej: 72)
--          en lugar del DPI del paquete (ej: 300)
--
-- Solución: Actualizar resolucion_foto con el DPI del paquete correspondiente

-- 1. Ver estado actual (antes de la corrección)
SELECT
    f.id,
    f.nombre_archivo,
    f.resolucion_foto AS dpi_actual,
    p.resolucion_foto AS dpi_del_paquete,
    CASE
        WHEN f.resolucion_foto != p.resolucion_foto THEN '❌ Necesita corrección'
        ELSE '✅ Correcto'
    END AS estado
FROM fotos f
INNER JOIN items_pedido ip ON f.item_pedido_id = ip.id
INNER JOIN paquetes_predefinidos p ON ip.paquete_id = p.id
WHERE p.resolucion_foto IS NOT NULL
ORDER BY f.id DESC
LIMIT 20;

-- 2. Actualizar DPI de las fotos con el DPI del paquete
UPDATE fotos f
INNER JOIN items_pedido ip ON f.item_pedido_id = ip.id
INNER JOIN paquetes_predefinidos p ON ip.paquete_id = p.id
SET
    f.resolucion_foto = p.resolucion_foto,
    -- También recalcular dimensiones físicas con el DPI correcto
    f.ancho_foto = ROUND((f.ancho_foto * f.resolucion_foto) / p.resolucion_foto, 2),
    f.alto_foto = ROUND((f.alto_foto * f.resolucion_foto) / p.resolucion_foto, 2)
WHERE
    p.resolucion_foto IS NOT NULL
    AND f.resolucion_foto != p.resolucion_foto;

-- 3. Verificar resultado (después de la corrección)
SELECT
    f.id,
    f.nombre_archivo,
    f.resolucion_foto AS dpi_actualizado,
    p.resolucion_foto AS dpi_del_paquete,
    CASE
        WHEN f.resolucion_foto = p.resolucion_foto THEN '✅ Correcto'
        ELSE '❌ Aún incorrecto'
    END AS estado
FROM fotos f
INNER JOIN items_pedido ip ON f.item_pedido_id = ip.id
INNER JOIN paquetes_predefinidos p ON ip.paquete_id = p.id
WHERE p.resolucion_foto IS NOT NULL
ORDER BY f.id DESC
LIMIT 20;

-- 4. Estadísticas
SELECT
    COUNT(*) AS total_fotos_corregidas,
    AVG(f.resolucion_foto) AS promedio_dpi
FROM fotos f
INNER JOIN items_pedido ip ON f.item_pedido_id = ip.id
INNER JOIN paquetes_predefinidos p ON ip.paquete_id = p.id
WHERE p.resolucion_foto IS NOT NULL;
