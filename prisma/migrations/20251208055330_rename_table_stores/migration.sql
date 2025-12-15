/*
  Warnings:

  - You are about to drop the column `activo` on the `paquetes_predefinidos` table. All the data in the column will be lost.
  - Added the required column `email_cliente` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iva` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_cliente` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `fotos` DROP FOREIGN KEY `fotos_pedido_id_fkey`;

-- DropForeignKey
ALTER TABLE `paquetes_predefinidos` DROP FOREIGN KEY `paquetes_predefinidos_tipo_paquete_id_fkey`;

-- AlterTable
ALTER TABLE `fotos` MODIFY `pedido_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `items_pedido` ADD COLUMN `cantidad` INTEGER NULL DEFAULT 1,
    ADD COLUMN `categoria_paquete` VARCHAR(100) NULL,
    ADD COLUMN `nombre_paquete` VARCHAR(255) NULL,
    ADD COLUMN `num_fotos_requeridas` INTEGER NULL,
    ADD COLUMN `paquete_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `paquetes_predefinidos` DROP COLUMN `activo`,
    ADD COLUMN `alto_foto` DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
    ADD COLUMN `ancho_foto` DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    ADD COLUMN `categoria_id` INTEGER NULL,
    ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `estado` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `resolucion_foto` INTEGER NOT NULL DEFAULT 300,
    MODIFY `tipo_paquete_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `pedidos` ADD COLUMN `email_cliente` VARCHAR(255) NOT NULL,
    ADD COLUMN `estado_pago` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `estado_personalizado` VARCHAR(191) NOT NULL DEFAULT 'Pendiente',
    ADD COLUMN `fecha_pedido` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id_pago_stripe` VARCHAR(255) NULL,
    ADD COLUMN `id_sesion_stripe` VARCHAR(255) NULL,
    ADD COLUMN `iva` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `nombre_cliente` VARCHAR(255) NOT NULL,
    ADD COLUMN `subtotal` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `telefono_cliente` VARCHAR(50) NULL;

-- CreateTable
CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `codigo_empleado` VARCHAR(50) NOT NULL,
    `fecha_contratacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `stores_usuario_id_key`(`usuario_id`),
    UNIQUE INDEX `stores_codigo_empleado_key`(`codigo_empleado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `items_pedido_paquete_id_fkey` ON `items_pedido`(`paquete_id`);

-- CreateIndex
CREATE INDEX `paquetes_predefinidos_categoria_id_fkey` ON `paquetes_predefinidos`(`categoria_id`);

-- AddForeignKey
ALTER TABLE `paquetes_predefinidos` ADD CONSTRAINT `paquetes_predefinidos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paquetes_predefinidos` ADD CONSTRAINT `paquetes_predefinidos_tipo_paquete_id_fkey` FOREIGN KEY (`tipo_paquete_id`) REFERENCES `tipo_paquete`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items_pedido` ADD CONSTRAINT `items_pedido_paquete_id_fkey` FOREIGN KEY (`paquete_id`) REFERENCES `paquetes_predefinidos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fotos` ADD CONSTRAINT `fotos_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
