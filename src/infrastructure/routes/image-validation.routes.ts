import { Router } from 'express';
import multer from 'multer';
import { ImageValidationController } from '../controllers/image-validation.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * @swagger
 * tags:
   *   name: Image Validation
 *   description: Validación de calidad de imágenes para impresión
 */

const imageValidationRoutes = (router: Router): void => {
  const imageValidationController = new ImageValidationController();

  /**
   * @swagger
   * /api/images/validate:
   *   post:
   *     summary: Validar calidad de imagen antes de subir
   *     tags: [Image Validation]
   *     description: |
   *       Valida que una imagen cumpla con los requisitos de calidad para impresión.
   *       Verifica DPI, dimensiones físicas, formato y tamaño de archivo.
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - image
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: Archivo de imagen a validar
   *               expectedWidthCm:
   *                 type: number
   *                 description: Ancho esperado en centímetros
   *                 example: 10
   *               expectedHeightCm:
   *                 type: number
   *                 description: Alto esperado en centímetros
   *                 example: 15
   *               minDPI:
   *                 type: number
   *                 description: DPI mínimo requerido
   *                 default: 300
   *               toleranceCm:
   *                 type: number
   *                 description: Tolerancia en centímetros
   *                 default: 0.5
   *     responses:
   *       200:
   *         description: Resultado de la validación
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 isValid:
   *                   type: boolean
   *                 metadata:
   *                   type: object
   *                   properties:
   *                     width:
   *                       type: number
   *                       description: Ancho en píxeles
   *                     height:
   *                       type: number
   *                       description: Alto en píxeles
   *                     format:
   *                       type: string
   *                       description: Formato de imagen
   *                     dpi:
   *                       type: number
   *                       description: DPI de la imagen
   *                     physicalWidthCm:
   *                       type: string
   *                       description: Ancho físico en cm
   *                     physicalHeightCm:
   *                       type: string
   *                       description: Alto físico en cm
   *                     sizeInMB:
   *                       type: string
   *                       description: Tamaño del archivo en MB
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: string
   *                 warnings:
   *                   type: array
   *                   items:
   *                     type: string
   *                 recommendedPixels:
   *                   type: object
   *                   properties:
   *                     width:
   *                       type: number
   *                     height:
   *                       type: number
   *                 message:
   *                   type: string
   *       400:
   *         description: No se proporcionó archivo
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/images/validate', upload.single('image'), (req, res) =>
    imageValidationController.validateImage(req, res)
  );

  /**
   * @swagger
   * /api/images/calculate-requirements:
   *   post:
   *     summary: Calcular requisitos de píxeles para impresión
   *     tags: [Image Validation]
   *     description: Calcula cuántos píxeles necesita una imagen para imprimirse a cierto tamaño y DPI
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - widthCm
   *               - heightCm
   *             properties:
   *               widthCm:
   *                 type: number
   *                 description: Ancho deseado en centímetros
   *                 example: 10
   *               heightCm:
   *                 type: number
   *                 description: Alto deseado en centímetros
   *                 example: 15
   *               dpi:
   *                 type: number
   *                 description: DPI deseado (default 300)
   *                 default: 300
   *     responses:
   *       200:
   *         description: Requisitos calculados exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     widthCm:
   *                       type: number
   *                     heightCm:
   *                       type: number
   *                     dpi:
   *                       type: number
   *                     requiredPixels:
   *                       type: object
   *                       properties:
   *                         width:
   *                           type: number
   *                         height:
   *                           type: number
   *                     megapixels:
   *                       type: string
   *                     recommendation:
   *                       type: string
   *       400:
   *         description: Parámetros faltantes
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/images/calculate-requirements', (req, res) =>
    imageValidationController.calculateRequirements(req, res)
  );
};

export default imageValidationRoutes;
