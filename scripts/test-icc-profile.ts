import sharp from 'sharp';
import { ImageValidationService } from '../src/infrastructure/services/image-validation.service';

async function testICCEmbedding() {
  console.log('🧪 Test de Embebimiento de Perfil ICC sRGB\n');

  try {
    // Crear imagen de prueba
    console.log('📸 Creando imagen de prueba (1200x1800px, naranja)...');
    const testImage = await sharp({
      create: {
        width: 1200,
        height: 1800,
        channels: 3,
        background: { r: 255, g: 100, b: 50 }
      }
    })
    .jpeg()
    .toBuffer();

    console.log('✅ Imagen de prueba creada\n');

    // Verificar imagen original (sin perfil ICC)
    console.log('🔍 Verificando imagen original...');
    const originalVerification = await ImageValidationService.verifyICCProfile(testImage);
    console.log('   Resultados imagen original:');
    console.log(`   - Tiene ICC: ${originalVerification.hasICC}`);
    console.log(`   - Perfil: ${originalVerification.profileName || 'N/A'}`);
    console.log(`   - DPI: ${originalVerification.dpi || 'N/A'}\n`);

    // Procesar con el nuevo método
    console.log('⚙️  Procesando con processImageForPrint(300 DPI)...');
    const processed = await ImageValidationService.processImageForPrint(testImage, 300);
    console.log('✅ Procesamiento completado\n');

    // Verificar resultado
    console.log('🔍 Verificando imagen procesada...');
    const verification = await ImageValidationService.verifyICCProfile(processed.buffer);
    console.log('   Resultados imagen procesada:');
    console.log(`   - Tiene ICC: ${verification.hasICC}`);
    console.log(`   - Perfil: ${verification.profileName}`);
    console.log(`   - DPI: ${verification.dpi}\n`);

    // Guardar para inspección manual
    const outputPath = './test-output-with-icc.jpg';
    await sharp(processed.buffer).toFile(outputPath);
    console.log(`💾 Archivo guardado: ${outputPath}`);
    console.log(`📊 Tamaño: ${(processed.buffer.length / 1024).toFixed(2)} KB`);
    console.log(`📐 Formato: ${processed.format}\n`);

    // Validación de resultados
    console.log('✅ VALIDACIÓN DE RESULTADOS:');
    if (verification.hasICC) {
      console.log('   ✓ Perfil ICC embebido correctamente');
    } else {
      console.log('   ✗ ERROR: No se embebió el perfil ICC');
    }

    if (verification.profileName === 'srgb') {
      console.log('   ✓ Espacio de color sRGB confirmado');
    } else {
      console.log(`   ✗ ERROR: Espacio de color incorrecto: ${verification.profileName}`);
    }

    if (verification.dpi === 300) {
      console.log('   ✓ DPI embebidos correctamente (300)');
    } else {
      console.log(`   ✗ ERROR: DPI incorrectos: ${verification.dpi}`);
    }

    console.log('\n🔍 Para verificación manual con ExifTool, ejecuta:');
    console.log(`   exiftool -ICC_Profile:ProfileDescription ${outputPath}`);
    console.log(`   exiftool -ICC_Profile:all ${outputPath}`);
    console.log('\n📖 Salida esperada:');
    console.log('   ICC Profile Description: sRGB IEC61966-2.1');

    // Resultado final
    const allTestsPassed = verification.hasICC &&
                          verification.profileName === 'srgb' &&
                          verification.dpi === 300;

    if (allTestsPassed) {
      console.log('\n✅ TODOS LOS TESTS PASARON');
      process.exit(0);
    } else {
      console.log('\n❌ ALGUNOS TESTS FALLARON');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ ERROR durante el test:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar test
testICCEmbedding();
