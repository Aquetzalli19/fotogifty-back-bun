import { Router } from 'express';
import generalRoutes from './general.routes';
import messageRoutes from './message.routes';
import usuarioRoutes from './usuario.routes';
import fotoRoutes from './foto.routes';
import paqueteRoutes from './paquete.routes';
import administradorRoutes from './administrador.routes';
import authRoutes from './auth.routes';
import categoriaRoutes from './categoria.routes';
import storeRoutes from './store.routes';
import pedidoRoutes from './pedido.routes';
import direccionRoutes from './direccion.routes';
import checkoutRoutes from './checkout.routes';
import webhookRoutes from './webhook.routes';
import storeAuthRoutes from './store-auth.routes';
import imageValidationRoutes from './image-validation.routes';
import analyticsRoutes from './analytics.routes';
import documentoLegalRoutes from './documento-legal.routes';
import aceptacionTerminosRoutes from './aceptacion-terminos.routes';
import configuracionTiendaRoutes from './configuracion-tienda.routes';
import landingContentRoutes from './landing-content.routes';
import carritoTemporalRoutes from './carrito-temporal.routes';
import estadoPedidoRoutes from './estado-pedido.routes';
import footerRoutes from './footer.routes';
import configuracionPaginaProductoRoutes from './configuracion-pagina-producto.routes';

const configureRoutes = (): Router => {
  const router = Router();

  // Configurar rutas generales en la raíz
  generalRoutes(router);

  // Configurar rutas bajo /api
  const apiRouter = Router();
  messageRoutes(apiRouter);
  usuarioRoutes(apiRouter);
  fotoRoutes(apiRouter);
  paqueteRoutes(apiRouter);
  administradorRoutes(apiRouter);
  authRoutes(apiRouter);
  categoriaRoutes(apiRouter);
  storeRoutes(apiRouter);
  pedidoRoutes(apiRouter);
  direccionRoutes(apiRouter);
  checkoutRoutes(apiRouter);
  webhookRoutes(apiRouter);
  storeAuthRoutes(apiRouter);
  imageValidationRoutes(apiRouter);
  analyticsRoutes(apiRouter);
  documentoLegalRoutes(apiRouter);
  aceptacionTerminosRoutes(apiRouter);
  configuracionTiendaRoutes(apiRouter);
  landingContentRoutes(apiRouter);
  carritoTemporalRoutes(apiRouter);
  estadoPedidoRoutes(apiRouter);
  footerRoutes(apiRouter);
  configuracionPaginaProductoRoutes(apiRouter);
  router.use('/api', apiRouter);

  return router;
};

export default configureRoutes;