import { Router } from 'express';
import { ConfiguracionTiendaController } from '@infrastructure/controllers/configuracion-tienda.controller';
import { ObtenerConfiguracionTiendaUseCase } from '@application/use-cases/obtener-configuracion-tienda.use-case';
import { ActualizarConfiguracionTiendaUseCase } from '@application/use-cases/actualizar-configuracion-tienda.use-case';
import { PrismaConfiguracionTiendaRepository } from '@infrastructure/repositories/prisma-configuracion-tienda.repository';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Configuración de Tienda
 *   description: Gestión de la ubicación y datos de la tienda física
 */

const configuracionTiendaRoutes = (router: Router): void => {
  const configuracionTiendaRepository = new PrismaConfiguracionTiendaRepository();
  const obtenerConfiguracionTiendaUseCase = new ObtenerConfiguracionTiendaUseCase(configuracionTiendaRepository);
  const actualizarConfiguracionTiendaUseCase = new ActualizarConfiguracionTiendaUseCase(configuracionTiendaRepository);

  const configuracionTiendaController = new ConfiguracionTiendaController(
    obtenerConfiguracionTiendaUseCase,
    actualizarConfiguracionTiendaUseCase
  );

  /**
   * @swagger
   * /api/configuracion-tienda:
   *   get:
   *     summary: Obtener la configuración actual de la tienda (público)
   *     tags: [Configuración de Tienda]
   *     description: Retorna información de la tienda física como dirección, coordenadas, horarios, etc. Este endpoint es público y no requiere autenticación.
   *     responses:
   *       200:
   *         description: Configuración obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     nombre:
   *                       type: string
   *                       example: "FotoGifty - Tienda Principal"
   *                     direccion:
   *                       type: string
   *                       example: "Av. Principal #123, Col. Centro"
   *                     ciudad:
   *                       type: string
   *                       example: "Ciudad de México"
   *                     estado:
   *                       type: string
   *                       example: "CDMX"
   *                     codigo_postal:
   *                       type: string
   *                       example: "01000"
   *                     pais:
   *                       type: string
   *                       example: "México"
   *                     telefono:
   *                       type: string
   *                       example: "55-1234-5678"
   *                     email:
   *                       type: string
   *                       example: "contacto@fotogifty.com"
   *                     latitud:
   *                       type: number
   *                       format: double
   *                       example: 19.432608
   *                     longitud:
   *                       type: number
   *                       format: double
   *                       example: -99.133209
   *                     horario_lunes_viernes:
   *                       type: string
   *                       example: "Lunes a Viernes: 9:00 AM - 7:00 PM"
   *                     horario_sabado:
   *                       type: string
   *                       example: "Sábado: 10:00 AM - 3:00 PM"
   *                     horario_domingo:
   *                       type: string
   *                       example: "Domingo: Cerrado"
   *                     descripcion:
   *                       type: string
   *                       example: "Nuestra tienda principal en el centro de la ciudad"
   *                     instrucciones_llegada:
   *                       type: string
   *                       example: "Estamos frente al parque central, edificio azul"
   *                     fecha_actualizacion:
   *                       type: string
   *                       format: date-time
   *       404:
   *         description: Configuración no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/configuracion-tienda', (req, res) =>
    configuracionTiendaController.obtener(req, res)
  );

  /**
   * @swagger
   * /api/configuracion-tienda:
   *   put:
   *     summary: Actualizar la configuración de la tienda (solo administradores)
   *     tags: [Configuración de Tienda]
   *     security:
   *       - bearerAuth: []
   *     description: Permite actualizar la información de la tienda física. Solo accesible para usuarios administradores.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre
   *               - direccion
   *               - ciudad
   *               - estado
   *               - codigo_postal
   *               - pais
   *               - telefono
   *               - latitud
   *               - longitud
   *             properties:
   *               nombre:
   *                 type: string
   *                 example: "FotoGifty - Tienda Principal"
   *               direccion:
   *                 type: string
   *                 example: "Av. Principal #123, Col. Centro"
   *               ciudad:
   *                 type: string
   *                 example: "Ciudad de México"
   *               estado:
   *                 type: string
   *                 example: "CDMX"
   *               codigo_postal:
   *                 type: string
   *                 example: "01000"
   *               pais:
   *                 type: string
   *                 example: "México"
   *               telefono:
   *                 type: string
   *                 example: "55-1234-5678"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "contacto@fotogifty.com"
   *               latitud:
   *                 type: number
   *                 format: double
   *                 example: 19.432608
   *                 description: "Debe estar entre -90 y 90"
   *               longitud:
   *                 type: number
   *                 format: double
   *                 example: -99.133209
   *                 description: "Debe estar entre -180 y 180"
   *               horario_lunes_viernes:
   *                 type: string
   *                 example: "Lunes a Viernes: 9:00 AM - 7:00 PM"
   *               horario_sabado:
   *                 type: string
   *                 example: "Sábado: 10:00 AM - 3:00 PM"
   *               horario_domingo:
   *                 type: string
   *                 example: "Domingo: Cerrado"
   *               descripcion:
   *                 type: string
   *                 example: "Nuestra tienda principal en el centro de la ciudad"
   *               instrucciones_llegada:
   *                 type: string
   *                 example: "Estamos frente al parque central, edificio azul"
   *     responses:
   *       200:
   *         description: Configuración actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Configuración de tienda actualizada correctamente"
   *                 data:
   *                   type: object
   *       400:
   *         description: Datos inválidos (coordenadas fuera de rango, campos faltantes)
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (requiere rol de administrador)
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/configuracion-tienda', authenticateToken, requireAdmin, (req, res) =>
    configuracionTiendaController.actualizar(req, res)
  );
};

export default configuracionTiendaRoutes;
