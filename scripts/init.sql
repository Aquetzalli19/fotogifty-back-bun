-- Crear usuario específico para la aplicación (si no existe)
CREATE USER IF NOT EXISTS 'foto_pack_user'@'%' IDENTIFIED BY 'userpassword';
GRANT ALL PRIVILEGES ON foto_pack_db.* TO 'foto_pack_user'@'%';
FLUSH PRIVILEGES;

-- Crear tablas de estados iniciales (Prisma hará las migraciones, pero esto es por si acaso)
CREATE TABLE IF NOT EXISTS estados_pedido (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS tipo_paquete (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Insertar datos iniciales
INSERT IGNORE INTO estados_pedido (id, nombre, descripcion) VALUES
(1, 'Pendiente', 'Pedido recibido, en espera de procesamiento'),
(2, 'Confirmado', 'Pedido confirmado y en preparación'),
(3, 'En Proceso', 'Pedido en proceso de elaboración'),
(4, 'Completado', 'Pedido completado y listo'),
(5, 'Cancelado', 'Pedido cancelado');

INSERT IGNORE INTO tipo_paquete (id, nombre, descripcion) VALUES
(1, 'Básico', 'Paquetes básicos de fotos'),
(2, 'Premium', 'Paquetes premium con más fotos'),
(3, 'Personalizado', 'Paquetes personalizados'),
(4, 'Expansión', 'Expansiones para paquetes existentes'),
(5, 'Calendario', 'Paquetes de calendario');