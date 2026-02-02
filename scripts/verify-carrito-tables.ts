import prisma from '../src/infrastructure/database/prisma.client';

async function verifyCarritoTables() {
  try {
    console.log('🔍 Verificando tablas de carrito temporal en producción...\n');

    // Verificar tabla carritos_temporales
    try {
      const carritosCount = await prisma.carritos_temporales.count();
      console.log(`✅ carritos_temporales: tabla existe (${carritosCount} registros)`);
    } catch (error) {
      console.log('❌ carritos_temporales: tabla NO existe');
    }

    // Verificar tabla customizaciones_temporales
    try {
      const customizacionesCount = await prisma.customizaciones_temporales.count();
      console.log(`✅ customizaciones_temporales: tabla existe (${customizacionesCount} registros)`);
    } catch (error) {
      console.log('❌ customizaciones_temporales: tabla NO existe');
    }

    // Verificar tabla imagenes_temporales
    try {
      const imagenesCount = await prisma.imagenes_temporales.count();
      console.log(`✅ imagenes_temporales: tabla existe (${imagenesCount} registros)`);
    } catch (error) {
      console.log('❌ imagenes_temporales: tabla NO existe');
    }

    console.log('\n✨ Verificación completada');
  } catch (error: any) {
    console.error('❌ Error al verificar tablas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCarritoTables();
