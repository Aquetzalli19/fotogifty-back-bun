-- Insertar configuración inicial de la tienda
INSERT INTO configuracion_tienda (
  nombre,
  direccion,
  ciudad,
  estado,
  codigo_postal,
  pais,
  telefono,
  email,
  latitud,
  longitud,
  horario_lunes_viernes,
  horario_sabado,
  horario_domingo,
  descripcion,
  instrucciones_llegada
) VALUES (
  'FotoGifty - Tienda Principal',
  'Av. Principal #123, Col. Centro',
  'Ciudad de México',
  'CDMX',
  '01000',
  'México',
  '55-1234-5678',
  'contacto@fotogifty.com',
  19.432608,
  -99.133209,
  'Lunes a Viernes: 9:00 AM - 7:00 PM',
  'Sábado: 10:00 AM - 3:00 PM',
  'Domingo: Cerrado',
  'Nuestra tienda principal en el centro de la ciudad',
  'Estamos frente al parque central, edificio azul'
) ON DUPLICATE KEY UPDATE id = id;
