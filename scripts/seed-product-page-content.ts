import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding product page content...');

  // Limpiar datos existentes
  await prisma.product_page_options.deleteMany();
  await prisma.product_page_slides.deleteMany();
  await prisma.product_page_sections.deleteMany();

  // ============================================
  // SECCIONES
  // ============================================
  await prisma.product_page_sections.createMany({
    data: [
      { section_key: 'gallery', titulo: 'Imprime Tus Mejores Momentos', subtitulo: 'Cada foto cuenta una historia. Nosotros la imprimimos con la calidad que merece.', orden: 1, activo: true },
      { section_key: 'why_choose', titulo: 'Por Qué Elegir FotoGifty', subtitulo: 'Nos dedicamos a transformar tus recuerdos digitales en impresiones de la más alta calidad.', orden: 2, activo: true },
      { section_key: 'paper_types', titulo: 'Tipos de Papel', subtitulo: 'Elige el acabado perfecto para cada ocasión. Todos nuestros papeles son de grado profesional.', orden: 3, activo: true },
      { section_key: 'print_services', titulo: 'Nuestros Servicios de Impresión', subtitulo: 'Ofrecemos una variedad de productos para que tus recuerdos cobren vida.', orden: 4, activo: true },
      { section_key: 'product_types', titulo: 'Nuestros Productos', subtitulo: 'Tres estilos únicos para dar vida a tus fotos favoritas.', orden: 5, activo: true },
      { section_key: 'sizes_table', titulo: 'Tamaños y Opciones', subtitulo: 'Encuentra el tamaño perfecto para cada momento. Todos con impresión a 300 DPI.', orden: 6, activo: true },
    ]
  });
  console.log('✓ Secciones creadas');

  // ============================================
  // GALLERY SLIDES
  // ============================================
  await prisma.product_page_slides.createMany({
    data: [
      { section_key: 'gallery', tipo: 'gallery_image', titulo: 'Impresión de foto profesional', descripcion: 'col-span-2 row-span-2', imagen_url: '/slide1.jpg', orden: 1 },
      { section_key: 'gallery', tipo: 'gallery_image', titulo: 'Foto impresa de alta calidad', descripcion: '', imagen_url: '/slide2.jpg', orden: 2 },
      { section_key: 'gallery', tipo: 'gallery_image', titulo: 'Detalle de impresión fotográfica', descripcion: '', imagen_url: '/slide3.jpg', orden: 3 },
      { section_key: 'gallery', tipo: 'gallery_image', titulo: 'Colección de fotos impresas', descripcion: '', imagen_url: '/slide4.jpg', orden: 4 },
      { section_key: 'gallery', tipo: 'gallery_image', titulo: 'Producto de impresión', descripcion: '', imagen_url: '/SingleProduct.jpg', orden: 5 },
      { section_key: 'gallery', tipo: 'gallery_image', titulo: 'Ejemplo de foto impresa', descripcion: 'col-span-2', imagen_url: '/product-slider/slide1.jpg', orden: 6 },
    ]
  });
  console.log('✓ Gallery slides creados');

  // ============================================
  // WHY CHOOSE SLIDES
  // ============================================
  await prisma.product_page_slides.createMany({
    data: [
      { section_key: 'why_choose', tipo: 'value_card', titulo: 'Calidad Profesional', descripcion: 'Impresiones en papel fotográfico premium con tecnología de última generación para colores vibrantes y detalles nítidos.', icono: 'Award', orden: 1 },
      { section_key: 'why_choose', tipo: 'value_card', titulo: 'Personalización Total', descripcion: 'Editor integrado con filtros, ajustes y efectos para que cada foto quede exactamente como la imaginas.', icono: 'Palette', orden: 2 },
      { section_key: 'why_choose', tipo: 'value_card', titulo: 'Envío a Todo México', descripcion: 'Recibe tus impresiones en la puerta de tu casa con envío seguro y rastreable a cualquier parte del país.', icono: 'Truck', orden: 3 },
      { section_key: 'why_choose', tipo: 'value_card', titulo: 'Pago 100% Seguro', descripcion: 'Transacciones protegidas con Stripe. Tu información financiera siempre está segura con nosotros.', icono: 'Shield', orden: 4 },
      { section_key: 'why_choose', tipo: 'value_card', titulo: 'Entrega Rápida', descripcion: 'Procesamos tu pedido en tiempo récord para que disfrutes tus fotos impresas lo antes posible.', icono: 'Clock', orden: 5 },
      { section_key: 'why_choose', tipo: 'value_card', titulo: 'Garantía de Satisfacción', descripcion: 'Si no estás satisfecho con la calidad de impresión, te reimprimimos sin costo adicional.', icono: 'HeartHandshake', orden: 6 },
    ]
  });
  console.log('✓ Why choose slides creados');

  // ============================================
  // PAPER TYPES SLIDES + OPTIONS
  // ============================================
  const lustre = await prisma.product_page_slides.create({
    data: { section_key: 'paper_types', tipo: 'paper_type', titulo: 'Lustre', descripcion: 'El acabado preferido por fotógrafos profesionales. Ofrece una textura suave con un brillo sutil que reduce reflejos y resalta los detalles de la imagen.', imagen_url: '/slide1.jpg', orden: 1 }
  });
  const mate = await prisma.product_page_slides.create({
    data: { section_key: 'paper_types', tipo: 'paper_type', titulo: 'Mate', descripcion: 'Acabado sin brillo que ofrece una apariencia sofisticada y artística. Perfecto para fotos en blanco y negro y fotografía artística.', imagen_url: '/slide2.jpg', orden: 2 }
  });
  const brillante = await prisma.product_page_slides.create({
    data: { section_key: 'paper_types', tipo: 'paper_type', titulo: 'Brillante', descripcion: 'El acabado clásico con brillo intenso que hace que los colores resalten al máximo. Ideal para fotos coloridas y vibrantes.', imagen_url: '/slide3.jpg', orden: 3 }
  });

  await prisma.product_page_options.createMany({
    data: [
      // Lustre
      { section_key: 'paper_types', slide_id: lustre.id, texto: 'Textura semi-mate elegante', orden: 1 },
      { section_key: 'paper_types', slide_id: lustre.id, texto: 'Reduce reflejos y huellas', orden: 2 },
      { section_key: 'paper_types', slide_id: lustre.id, texto: 'Ideal para retratos y paisajes', orden: 3 },
      { section_key: 'paper_types', slide_id: lustre.id, texto: 'Colores ricos y naturales', orden: 4 },
      { section_key: 'paper_types', slide_id: lustre.id, texto: 'Resistente al desgaste', orden: 5 },
      // Mate
      { section_key: 'paper_types', slide_id: mate.id, texto: 'Sin reflejos ni brillos', orden: 1 },
      { section_key: 'paper_types', slide_id: mate.id, texto: 'Apariencia artística y elegante', orden: 2 },
      { section_key: 'paper_types', slide_id: mate.id, texto: 'Perfecto para fotos B&N', orden: 3 },
      { section_key: 'paper_types', slide_id: mate.id, texto: 'Fácil de enmarcar', orden: 4 },
      { section_key: 'paper_types', slide_id: mate.id, texto: 'Textura suave al tacto', orden: 5 },
      // Brillante
      { section_key: 'paper_types', slide_id: brillante.id, texto: 'Colores ultra vibrantes', orden: 1 },
      { section_key: 'paper_types', slide_id: brillante.id, texto: 'Brillo intenso y llamativo', orden: 2 },
      { section_key: 'paper_types', slide_id: brillante.id, texto: 'Contraste máximo', orden: 3 },
      { section_key: 'paper_types', slide_id: brillante.id, texto: 'Ideal para fotos a color', orden: 4 },
      { section_key: 'paper_types', slide_id: brillante.id, texto: 'El clásico favorito', orden: 5 },
    ]
  });
  console.log('✓ Paper types slides y opciones creados');

  // ============================================
  // PRINT SERVICES SLIDES
  // ============================================
  await prisma.product_page_slides.createMany({
    data: [
      { section_key: 'print_services', tipo: 'service_card', titulo: 'Impresiones Estándar', descripcion: 'Fotos impresas en múltiples tamaños con la calidad que tus recuerdos merecen.', imagen_url: '/slide1.jpg', orden: 1 },
      { section_key: 'print_services', tipo: 'service_card', titulo: 'Calendarios Personalizados', descripcion: 'Crea calendarios únicos con tus fotos favoritas para cada mes del año.', imagen_url: '/slide2.jpg', orden: 2 },
      { section_key: 'print_services', tipo: 'service_card', titulo: 'Fotos Estilo Polaroid', descripcion: 'El encanto retro de las polaroid con la calidad de impresión moderna.', imagen_url: '/slide3.jpg', orden: 3 },
      { section_key: 'print_services', tipo: 'service_card', titulo: 'Paquetes Especiales', descripcion: 'Combina diferentes tamaños y estilos en un solo pedido con descuentos exclusivos.', imagen_url: '/slide4.jpg', orden: 4 },
    ]
  });
  console.log('✓ Print services slides creados');

  // ============================================
  // PRODUCT TYPES SLIDES
  // ============================================
  await prisma.product_page_slides.createMany({
    data: [
      { section_key: 'product_types', tipo: 'product_type', titulo: 'Impresiones Estándar', descripcion: 'Disponibles en múltiples tamaños, desde 4×6 hasta 8×10. Perfectas para enmarcar o regalar.', imagen_url: '/slide1.jpg', orden: 1 },
      { section_key: 'product_types', tipo: 'product_type', titulo: 'Calendarios', descripcion: '12 meses con tus fotos favoritas. Personaliza cada mes con tu editor integrado.', imagen_url: '/Calendar.png', orden: 2 },
      { section_key: 'product_types', tipo: 'product_type', titulo: 'Polaroid', descripcion: 'El estilo retro que nunca pasa de moda. Marco blanco clásico con espacio para texto.', imagen_url: '/polaroid/Polaroid.png', orden: 3 },
    ]
  });
  console.log('✓ Product types slides creados');

  // ============================================
  // SIZES TABLE OPTIONS
  // ============================================
  await prisma.product_page_options.createMany({
    data: [
      { section_key: 'sizes_table', slide_id: null, texto: '4×6"', texto_secundario: '10 × 15 cm', texto_terciario: '300 DPI', texto_cuarto: 'Estándar', texto_quinto: '$15.00', orden: 1 },
      { section_key: 'sizes_table', slide_id: null, texto: '5×7"', texto_secundario: '13 × 18 cm', texto_terciario: '300 DPI', texto_cuarto: 'Estándar', texto_quinto: '$25.00', orden: 2 },
      { section_key: 'sizes_table', slide_id: null, texto: '8×10"', texto_secundario: '20 × 25 cm', texto_terciario: '300 DPI', texto_cuarto: 'Estándar', texto_quinto: '$45.00', orden: 3 },
      { section_key: 'sizes_table', slide_id: null, texto: 'Polaroid', texto_secundario: '7.6 × 7.6 cm', texto_terciario: '300 DPI', texto_cuarto: 'Polaroid', texto_quinto: '$12.00', orden: 4 },
      { section_key: 'sizes_table', slide_id: null, texto: 'Calendario', texto_secundario: '21.6 × 28 cm', texto_terciario: '300 DPI', texto_cuarto: 'Calendario', texto_quinto: '$99.00', orden: 5 },
    ]
  });
  console.log('✓ Sizes table opciones creadas');

  console.log('\n✅ Seed completado exitosamente');
}

seed()
  .catch(e => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
