-- AlterTable
ALTER TABLE `fotos` ADD COLUMN `alto_foto` DECIMAL(5, 2) NULL,
    ADD COLUMN `ancho_foto` DECIMAL(5, 2) NULL,
    ADD COLUMN `resolucion_foto` INTEGER NULL;
