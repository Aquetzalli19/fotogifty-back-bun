import { Router } from 'express';
import multer from 'multer';
import { ConfiguracionPaginaProductoController } from '@infrastructure/controllers/configuracion-pagina-producto.controller';
import { PrismaConfiguracionPaginaProductoRepository } from '@infrastructure/repositories/prisma-configuracion-pagina-producto.repository';
import { PrismaSeccionPaginaProductoRepository } from '@infrastructure/repositories/prisma-seccion-pagina-producto.repository';
import { PrismaPestanaContenidoRepository } from '@infrastructure/repositories/prisma-pestana-contenido.repository';
import { PrismaCaracteristicaRepository } from '@infrastructure/repositories/prisma-caracteristica.repository';
import { ListarConfiguracionesPaginaProductoUseCase } from '@application/use-cases/listar-configuraciones-pagina-producto.use-case';
import { ObtenerConfiguracionPaginaProductoUseCase } from '@application/use-cases/obtener-configuracion-pagina-producto.use-case';
import { ResolverConfiguracionPaginaProductoUseCase } from '@application/use-cases/resolver-configuracion-pagina-producto.use-case';
import { CrearConfiguracionPaginaProductoUseCase } from '@application/use-cases/crear-configuracion-pagina-producto.use-case';
import { ActualizarConfiguracionPaginaProductoUseCase } from '@application/use-cases/actualizar-configuracion-pagina-producto.use-case';
import { EliminarConfiguracionPaginaProductoUseCase } from '@application/use-cases/eliminar-configuracion-pagina-producto.use-case';
import { CrearSeccionPaginaProductoUseCase } from '@application/use-cases/crear-seccion-pagina-producto.use-case';
import { ActualizarSeccionPaginaProductoUseCase } from '@application/use-cases/actualizar-seccion-pagina-producto.use-case';
import { EliminarSeccionPaginaProductoUseCase } from '@application/use-cases/eliminar-seccion-pagina-producto.use-case';
import { ReordenarSeccionesPaginaProductoUseCase } from '@application/use-cases/reordenar-secciones-pagina-producto.use-case';
import { ToggleSeccionPaginaProductoUseCase } from '@application/use-cases/toggle-seccion-pagina-producto.use-case';
import { CrearPestanaContenidoUseCase } from '@application/use-cases/crear-pestana-contenido.use-case';
import { ActualizarPestanaContenidoUseCase } from '@application/use-cases/actualizar-pestana-contenido.use-case';
import { EliminarPestanaContenidoUseCase } from '@application/use-cases/eliminar-pestana-contenido.use-case';
import { ReordenarPestanasContenidoUseCase } from '@application/use-cases/reordenar-pestanas-contenido.use-case';
import { CrearCaracteristicaUseCase } from '@application/use-cases/crear-caracteristica.use-case';
import { ActualizarCaracteristicaUseCase } from '@application/use-cases/actualizar-caracteristica.use-case';
import { EliminarCaracteristicaUseCase } from '@application/use-cases/eliminar-caracteristica.use-case';
import { ReordenarCaracteristicasUseCase } from '@application/use-cases/reordenar-caracteristicas.use-case';
import { S3Service } from '@infrastructure/services/s3.service';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
});

const BASE = '/configuracion-pagina-producto';

const configuracionPaginaProductoRoutes = (router: Router): void => {
  // Repositories
  const configRepo = new PrismaConfiguracionPaginaProductoRepository();
  const seccionRepo = new PrismaSeccionPaginaProductoRepository();
  const pestanaRepo = new PrismaPestanaContenidoRepository();
  const caracteristicaRepo = new PrismaCaracteristicaRepository();

  // Services
  const s3Service = new S3Service();

  // Use Cases
  const listarUseCase = new ListarConfiguracionesPaginaProductoUseCase(configRepo);
  const obtenerUseCase = new ObtenerConfiguracionPaginaProductoUseCase(configRepo);
  const resolverUseCase = new ResolverConfiguracionPaginaProductoUseCase(configRepo);
  const crearUseCase = new CrearConfiguracionPaginaProductoUseCase(configRepo);
  const actualizarUseCase = new ActualizarConfiguracionPaginaProductoUseCase(configRepo);
  const eliminarUseCase = new EliminarConfiguracionPaginaProductoUseCase(configRepo);
  const crearSeccionUseCase = new CrearSeccionPaginaProductoUseCase(configRepo, seccionRepo);
  const actualizarSeccionUseCase = new ActualizarSeccionPaginaProductoUseCase(seccionRepo);
  const eliminarSeccionUseCase = new EliminarSeccionPaginaProductoUseCase(seccionRepo);
  const reordenarSeccionesUseCase = new ReordenarSeccionesPaginaProductoUseCase(seccionRepo);
  const toggleSeccionUseCase = new ToggleSeccionPaginaProductoUseCase(seccionRepo);
  const crearPestanaUseCase = new CrearPestanaContenidoUseCase(seccionRepo, pestanaRepo);
  const actualizarPestanaUseCase = new ActualizarPestanaContenidoUseCase(seccionRepo, pestanaRepo);
  const eliminarPestanaUseCase = new EliminarPestanaContenidoUseCase(seccionRepo, pestanaRepo);
  const reordenarPestanasUseCase = new ReordenarPestanasContenidoUseCase(seccionRepo, pestanaRepo);
  const crearCaracteristicaUseCase = new CrearCaracteristicaUseCase(seccionRepo, caracteristicaRepo);
  const actualizarCaracteristicaUseCase = new ActualizarCaracteristicaUseCase(seccionRepo, caracteristicaRepo);
  const eliminarCaracteristicaUseCase = new EliminarCaracteristicaUseCase(seccionRepo, caracteristicaRepo);
  const reordenarCaracteristicasUseCase = new ReordenarCaracteristicasUseCase(seccionRepo, caracteristicaRepo);

  // Controller
  const controller = new ConfiguracionPaginaProductoController(
    listarUseCase,
    obtenerUseCase,
    resolverUseCase,
    crearUseCase,
    actualizarUseCase,
    eliminarUseCase,
    crearSeccionUseCase,
    actualizarSeccionUseCase,
    eliminarSeccionUseCase,
    reordenarSeccionesUseCase,
    toggleSeccionUseCase,
    crearPestanaUseCase,
    actualizarPestanaUseCase,
    eliminarPestanaUseCase,
    reordenarPestanasUseCase,
    crearCaracteristicaUseCase,
    actualizarCaracteristicaUseCase,
    eliminarCaracteristicaUseCase,
    reordenarCaracteristicasUseCase,
    s3Service
  );

  // ============================================
  // CONFIGURACIONES  (critical order: static before :id)
  // ============================================
  router.get(BASE, (req, res) => controller.listar(req, res));
  router.get(`${BASE}/resuelta`, (req, res) => controller.resolver(req, res));
  router.post(`${BASE}/upload`, authenticateToken, requireAdmin, upload.single('imagen'), (req, res) =>
    controller.subirImagen(req, res)
  );
  router.get(`${BASE}/:id`, (req, res) => controller.obtener(req, res));
  router.post(BASE, authenticateToken, requireAdmin, (req, res) => controller.crear(req, res));
  router.put(`${BASE}/:id`, authenticateToken, requireAdmin, (req, res) => controller.actualizar(req, res));
  router.delete(`${BASE}/:id`, authenticateToken, requireAdmin, (req, res) => controller.eliminar(req, res));

  // ============================================
  // SECCIONES (critical order: reorder before :sectionId)
  // ============================================
  router.post(
    `${BASE}/:configId/secciones`,
    authenticateToken, requireAdmin,
    (req, res) => controller.crearSeccion(req, res)
  );
  router.put(
    `${BASE}/:configId/secciones/reorder`,
    authenticateToken, requireAdmin,
    (req, res) => controller.reordenarSecciones(req, res)
  );
  router.put(
    `${BASE}/:configId/secciones/:sectionId`,
    authenticateToken, requireAdmin,
    (req, res) => controller.actualizarSeccion(req, res)
  );
  router.delete(
    `${BASE}/:configId/secciones/:sectionId`,
    authenticateToken, requireAdmin,
    (req, res) => controller.eliminarSeccion(req, res)
  );
  router.patch(
    `${BASE}/:configId/secciones/:sectionId/toggle`,
    authenticateToken, requireAdmin,
    (req, res) => controller.toggleSeccion(req, res)
  );

  // ============================================
  // PESTAÑAS (critical order: reorder before :pestanaId)
  // ============================================
  router.post(
    `${BASE}/:configId/secciones/:sectionId/pestanas`,
    authenticateToken, requireAdmin,
    (req, res) => controller.crearPestana(req, res)
  );
  router.put(
    `${BASE}/:configId/secciones/:sectionId/pestanas/reorder`,
    authenticateToken, requireAdmin,
    (req, res) => controller.reordenarPestanas(req, res)
  );
  router.put(
    `${BASE}/:configId/secciones/:sectionId/pestanas/:pestanaId`,
    authenticateToken, requireAdmin,
    (req, res) => controller.actualizarPestana(req, res)
  );
  router.delete(
    `${BASE}/:configId/secciones/:sectionId/pestanas/:pestanaId`,
    authenticateToken, requireAdmin,
    (req, res) => controller.eliminarPestana(req, res)
  );

  // ============================================
  // CARACTERÍSTICAS (critical order: reorder before :caracteristicaId)
  // ============================================
  router.post(
    `${BASE}/:configId/secciones/:sectionId/caracteristicas`,
    authenticateToken, requireAdmin,
    (req, res) => controller.crearCaracteristica(req, res)
  );
  router.put(
    `${BASE}/:configId/secciones/:sectionId/caracteristicas/reorder`,
    authenticateToken, requireAdmin,
    (req, res) => controller.reordenarCaracteristicas(req, res)
  );
  router.put(
    `${BASE}/:configId/secciones/:sectionId/caracteristicas/:caracteristicaId`,
    authenticateToken, requireAdmin,
    (req, res) => controller.actualizarCaracteristica(req, res)
  );
  router.delete(
    `${BASE}/:configId/secciones/:sectionId/caracteristicas/:caracteristicaId`,
    authenticateToken, requireAdmin,
    (req, res) => controller.eliminarCaracteristica(req, res)
  );
};

export default configuracionPaginaProductoRoutes;
