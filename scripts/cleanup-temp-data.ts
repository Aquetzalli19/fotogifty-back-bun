import prisma from '../src/infrastructure/database/prisma.client';
import { PrismaCarritoTemporalRepository } from '../src/infrastructure/repositories/prisma-carrito-temporal.repository';
import { PrismaCustomizacionTemporalRepository } from '../src/infrastructure/repositories/prisma-customizacion-temporal.repository';
import { PrismaImagenTemporalRepository } from '../src/infrastructure/repositories/prisma-imagen-temporal.repository';

/**
 * Script de limpieza automática para datos temporales expirados
 * Debe ejecutarse periódicamente con un CRON job
 */
async function cleanupTempData() {
  try {
    console.log('🧹 Iniciando limpieza de datos temporales...\n');

    const carritoRepo = new PrismaCarritoTemporalRepository();
    const customizacionRepo = new PrismaCustomizacionTemporalRepository();
    const imagenRepo = new PrismaImagenTemporalRepository();

    // Limpiar carritos temporales de más de 30 días
    console.log('🛒 Limpiando carritos temporales antiguos (>30 días)...');
    const carritosEliminados = await carritoRepo.deleteOlderThan(30);
    console.log(`  ✅ ${carritosEliminados} carritos eliminados`);

    // Limpiar customizaciones temporales de más de 30 días
    console.log('🎨 Limpiando customizaciones temporales antiguas (>30 días)...');
    const customizacionesEliminadas = await customizacionRepo.deleteOlderThan(30);
    console.log(`  ✅ ${customizacionesEliminadas} customizaciones eliminadas`);

    // Limpiar imágenes temporales expiradas
    console.log('🖼️  Limpiando imágenes temporales expiradas...');
    const imagenesEliminadas = await imagenRepo.deleteExpired();
    console.log(`  ✅ ${imagenesEliminadas} imágenes eliminadas`);

    // Resumen
    console.log('\n📊 Resumen de limpieza:');
    console.log(`  - Carritos: ${carritosEliminados}`);
    console.log(`  - Customizaciones: ${customizacionesEliminadas}`);
    console.log(`  - Imágenes: ${imagenesEliminadas}`);
    console.log(`  - Total: ${carritosEliminados + customizacionesEliminadas + imagenesEliminadas} registros eliminados`);

    console.log('\n✨ Limpieza completada exitosamente!');
  } catch (error: any) {
    console.error('❌ Error al ejecutar la limpieza:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTempData();
