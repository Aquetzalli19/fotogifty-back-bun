-- Script para crear documento de términos y condiciones inicial
-- Ejecutar este script después de aplicar la migración de aceptaciones_terminos

-- Verificar si ya existe un documento activo de términos
SELECT
    id,
    tipo,
    version,
    activo,
    titulo
FROM documentos_legales
WHERE tipo = 'terms';

-- Si no existe, insertar documento de términos inicial
INSERT INTO documentos_legales (tipo, titulo, contenido, version, activo, fecha_creacion, fecha_actualizacion)
VALUES (
    'terms',
    'Términos y Condiciones de Servicio',
    'TÉRMINOS Y CONDICIONES DE USO

Última actualización: 2 de febrero de 2024
Versión: 1.0.0

1. ACEPTACIÓN DE LOS TÉRMINOS

Al registrarse y utilizar los servicios de FotoGifty, usted acepta estar legalmente vinculado por estos Términos y Condiciones de Servicio.

2. DESCRIPCIÓN DEL SERVICIO

FotoGifty es una plataforma que permite a los usuarios crear paquetes personalizados de impresión fotográfica, incluyendo:
- Fotografías impresas en diversos tamaños
- Calendarios fotográficos personalizados
- Imanes decorativos con fotografías
- Polaroids personalizadas

3. REGISTRO DE USUARIO

3.1. Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y completa.
3.2. Usted es responsable de mantener la confidencialidad de su contraseña.
3.3. Debe notificarnos inmediatamente cualquier uso no autorizado de su cuenta.

4. SUBIDA Y USO DE FOTOGRAFÍAS

4.1. Al subir fotografías a nuestra plataforma, usted garantiza que:
   - Posee los derechos de las imágenes o tiene autorización para usarlas
   - Las imágenes no infringen derechos de terceros
   - Las imágenes no contienen contenido ilegal, ofensivo o inapropiado

4.2. FotoGifty se reserva el derecho de rechazar o eliminar cualquier fotografía que viole estos términos.

5. CALIDAD Y ESPECIFICACIONES TÉCNICAS

5.1. Todas las fotografías subidas son procesadas automáticamente para cumplir con estándares de impresión:
   - Resolución: 300 DPI (dots per inch)
   - Perfil de color: sRGB IEC61966-2.1
   - Metadatos EXIF embebidos

5.2. Las dimensiones físicas finales dependerán del paquete seleccionado.

6. PEDIDOS Y PAGOS

6.1. Los precios mostrados incluyen IVA (16% en México).
6.2. Los pagos se procesan de forma segura a través de Stripe.
6.3. Al confirmar un pedido, usted autoriza el cargo a su método de pago.

7. MÉTODOS DE ENTREGA

7.1. Ofrecemos dos métodos de entrega:
   - Envío a domicilio: Se requiere dirección de envío válida
   - Recogida en tienda: Disponible en puntos de venta autorizados

7.2. Los tiempos de entrega varían según el método seleccionado y volumen del pedido.

8. POLÍTICA DE PRIVACIDAD

8.1. Sus datos personales serán tratados conforme a nuestra Política de Privacidad.
8.2. No compartimos sus fotografías ni información personal con terceros sin su consentimiento.

9. PROPIEDAD INTELECTUAL

9.1. Todos los derechos de propiedad intelectual de la plataforma FotoGifty pertenecen a la empresa.
9.2. Usted conserva todos los derechos sobre sus fotografías originales.

10. LIMITACIÓN DE RESPONSABILIDAD

10.1. FotoGifty no se hace responsable por:
   - Pérdida de calidad de imagen debido a baja resolución del archivo original
   - Retrasos causados por servicios de mensajería externos
   - Daños en el envío imputables a terceros

11. MODIFICACIONES A LOS TÉRMINOS

11.1. Nos reservamos el derecho de modificar estos términos en cualquier momento.
11.2. Los cambios sustanciales requerirán su aceptación explícita para continuar usando el servicio.

12. CANCELACIÓN Y DEVOLUCIONES

12.1. Puede cancelar su pedido antes de que sea procesado.
12.2. Una vez iniciada la producción, no se aceptan cancelaciones.
12.3. Aceptamos devoluciones por defectos de fabricación en un plazo de 7 días.

13. CONTACTO

Para cualquier consulta sobre estos términos, puede contactarnos en:
Email: soporte@fotogifty.com
Teléfono: [AGREGAR TELÉFONO]

14. LEY APLICABLE

Estos términos se rigen por las leyes de México. Cualquier disputa será sometida a los tribunales competentes de [CIUDAD].

---

Al hacer clic en "Acepto los Términos y Condiciones", usted reconoce haber leído, comprendido y aceptado estar legalmente vinculado por estos términos.',
    '1.0.0',
    true,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    titulo = VALUES(titulo),
    contenido = VALUES(contenido),
    activo = VALUES(activo),
    fecha_actualizacion = NOW();

-- Verificar que se creó correctamente
SELECT
    id,
    tipo,
    version,
    activo,
    titulo,
    fecha_creacion
FROM documentos_legales
WHERE tipo = 'terms' AND activo = true;
