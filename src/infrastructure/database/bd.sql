-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS foto_calendario_db;
USE foto_calendario_db;

-- Tabla de usuarios/clientes
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de direcciones de envío
CREATE TABLE direcciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    alias VARCHAR(50) NOT NULL,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    pais VARCHAR(100) DEFAULT 'España',
    predeterminada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de tipos de paquete
CREATE TABLE tipo_paquete (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Tabla de paquetes predefinidos
CREATE TABLE paquetes_predefinidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_paquete_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    cantidad_fotos INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (tipo_paquete_id) REFERENCES tipo_paquete(id)
);

-- Tabla de estados de pedido
CREATE TABLE estados_pedido (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Tabla de pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    direccion_id INT NOT NULL,
    estado_id INT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    notas TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (direccion_id) REFERENCES direcciones(id),
    FOREIGN KEY (estado_id) REFERENCES estados_pedido(id)
);

-- Tabla de items de pedido (paquetes/expansiones)
CREATE TABLE items_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    tipo_item VARCHAR(20) NOT NULL,
    paquete_predefinido_id INT,
    cantidad_fotos INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (paquete_predefinido_id) REFERENCES paquetes_predefinidos(id)
);

-- Tabla de fotos subidas
CREATE TABLE fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    pedido_id INT NOT NULL,
    item_pedido_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_almacenamiento VARCHAR(500) NOT NULL,
    tamaño_archivo INT NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    procesada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (item_pedido_id) REFERENCES items_pedido(id)
);

-- Tabla de calendarios (fotos por mes)
CREATE TABLE calendario_fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    item_pedido_id INT NOT NULL,
    mes INT NOT NULL,
    foto_id INT NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (item_pedido_id) REFERENCES items_pedido(id),
    FOREIGN KEY (foto_id) REFERENCES fotos(id)
);

-- Tabla de administradores
CREATE TABLE administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    nivel_acceso INT DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Insertar datos iniciales para estados de pedido
INSERT INTO estados_pedido (id, nombre, descripcion) VALUES
(1, 'Pendiente', 'Pedido recibido, pendiente de procesar'),
(2, 'En Proceso', 'Pedido en proceso de producción'),
(3, 'Completado', 'Pedido completado y listo para envío'),
(4, 'Enviado', 'Pedido enviado al cliente'),
(5, 'Entregado', 'Pedido entregado al cliente'),
(6, 'Cancelado', 'Pedido cancelado');

-- Insertar datos iniciales para tipos de paquete
INSERT INTO tipo_paquete (id, nombre, descripcion) VALUES
(1, 'Básico', 'Paquetes básicos para calendarios simples'),
(2, 'Premium', 'Paquetes premium con más fotos y características'),
(3, 'Personalizado', 'Paquetes personalizados según necesidades del cliente'),
(4, 'Expansión', 'Expansiones para añadir más fotos a paquetes existentes'),
(5, 'Calendario', 'Paquetes específicos para calendarios');

-- Insertar algunos paquetes predefinidos de ejemplo
INSERT INTO paquetes_predefinidos (tipo_paquete_id, nombre, cantidad_fotos, precio, activo) VALUES
(1, 'Calendario Básico 12 Fotos', 12, 19.99, TRUE),
(1, 'Calendario Básico 24 Fotos', 24, 29.99, TRUE),
(2, 'Calendario Premium 36 Fotos', 36, 49.99, TRUE),
(2, 'Calendario Premium 48 Fotos', 48, 69.99, TRUE),
(4, 'Expansión +12 Fotos', 12, 9.99, TRUE),
(4, 'Expansión +24 Fotos', 24, 19.99, TRUE);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_direcciones_usuario ON direcciones(usuario_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado_id);
CREATE INDEX idx_fotos_usuario ON fotos(usuario_id);
CREATE INDEX idx_fotos_pedido ON fotos(pedido_id);
CREATE INDEX idx_fotos_item_pedido ON fotos(item_pedido_id);
CREATE INDEX idx_items_pedido_pedido ON items_pedido(pedido_id);
CREATE INDEX idx_calendario_fotos_pedido ON calendario_fotos(pedido_id);
CREATE INDEX idx_calendario_fotos_foto ON calendario_fotos(foto_id);

-- Mostrar mensaje de confirmación
SELECT 'Base de datos y tablas creadas exitosamente!' as Status;