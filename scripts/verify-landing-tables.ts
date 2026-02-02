import prisma from '../src/infrastructure/database/prisma.client';

async function verifyLandingTables() {
  try {
    console.log('🔍 Verificando tablas del CMS de Landing...\n');

    const sectionsCount = await prisma.landing_sections.count();
    const slidesCount = await prisma.landing_slides.count();
    const optionsCount = await prisma.landing_options.count();

    console.log('📊 Resultados:');
    console.log(`  ✅ landing_sections: ${sectionsCount} registros`);
    console.log(`  ✅ landing_slides: ${slidesCount} registros`);
    console.log(`  ✅ landing_options: ${optionsCount} registros`);
    console.log('');

    if (sectionsCount === 11 && slidesCount === 16 && optionsCount === 12) {
      console.log('✨ ¡Perfecto! Todos los datos están correctamente poblados.');
    } else if (sectionsCount === 0 && slidesCount === 0 && optionsCount === 0) {
      console.log('⚠️  Las tablas existen pero están vacías. Ejecuta el seed:');
      console.log('   bun run scripts/seed-landing-content.ts');
    } else {
      console.log('⚠️  Algunos datos faltan o están incompletos.');
      console.log('   Esperado: 11 secciones, 16 slides, 12 opciones');
    }

    // Mostrar algunas secciones de ejemplo
    if (sectionsCount > 0) {
      console.log('\n📄 Secciones existentes:');
      const sections = await prisma.landing_sections.findMany({
        select: { section_key: true, titulo: true, activo: true },
        orderBy: { orden: 'asc' }
      });
      sections.forEach(s => {
        console.log(`  - ${s.section_key}: "${s.titulo}" (${s.activo ? 'activo' : 'inactivo'})`);
      });
    }
  } catch (error: any) {
    console.error('❌ Error al verificar tablas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyLandingTables();
