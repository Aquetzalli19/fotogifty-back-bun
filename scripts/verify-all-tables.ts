import prisma from '../src/infrastructure/database/prisma.client';

async function verifyAllTables() {
  try {
    console.log('🔍 Verificando TODAS las tablas en base de datos de producción Railway\n');
    console.log('📊 Base de datos: gondola.proxy.rlwy.net:42206/railway\n');
    console.log('=' .repeat(70));

    // Landing CMS
    console.log('\n📄 LANDING CMS:');
    const sectionsCount = await prisma.landing_sections.count();
    const slidesCount = await prisma.landing_slides.count();
    const optionsCount = await prisma.landing_options.count();
    console.log(`  ✅ landing_sections: ${sectionsCount} registros`);
    console.log(`  ✅ landing_slides: ${slidesCount} registros`);
    console.log(`  ✅ landing_options: ${optionsCount} registros`);

    // Carrito Temporal
    console.log('\n🛒 CARRITO TEMPORAL:');
    const carritosCount = await prisma.carritos_temporales.count();
    const customizacionesCount = await prisma.customizaciones_temporales.count();
    const imagenesCount = await prisma.imagenes_temporales.count();
    console.log(`  ✅ carritos_temporales: ${carritosCount} registros`);
    console.log(`  ✅ customizaciones_temporales: ${customizacionesCount} registros`);
    console.log(`  ✅ imagenes_temporales: ${imagenesCount} registros`);

    // Tablas principales
    console.log('\n👥 TABLAS PRINCIPALES:');
    const usuariosCount = await prisma.usuarios.count();
    const pedidosCount = await prisma.pedidos.count();
    const fotosCount = await prisma.fotos.count();
    console.log(`  ✅ usuarios: ${usuariosCount} registros`);
    console.log(`  ✅ pedidos: ${pedidosCount} registros`);
    console.log(`  ✅ fotos: ${fotosCount} registros`);

    console.log('\n' + '='.repeat(70));
    console.log('\n✨ RESUMEN:');
    console.log(`  - Landing CMS: ACTIVO (${sectionsCount + slidesCount + optionsCount} registros totales)`);
    console.log(`  - Carrito Temporal: ACTIVO (${carritosCount + customizacionesCount + imagenesCount} registros totales)`);
    console.log(`  - Sistema principal: ACTIVO (${usuariosCount + pedidosCount + fotosCount} registros totales)`);
    console.log('\n🎉 Todas las tablas están creadas y funcionando correctamente!');
  } catch (error: any) {
    console.error('❌ Error al verificar tablas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllTables();
