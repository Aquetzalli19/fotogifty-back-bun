import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import swaggerOptions from './swagger.config';

export const setupSwagger = (app: Express, port: number): void => {
  const options = { ...swaggerOptions };
  // Actualizar la URL del servidor con el puerto dinámico
  if (options.definition && (options.definition as any).servers) {
    (options.definition as any).servers[0].url = `http://localhost:${port}`;
  }
  
  const specs = swaggerJsdoc(options);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Express Bun API Documentation'
  }));

  console.log(`📚 Swagger documentation available at http://localhost:${port}/api-docs`);
};