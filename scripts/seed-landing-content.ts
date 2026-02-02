import prisma from '../src/infrastructure/database/prisma.client';

async function seedLandingContent() {
  try {
    console.log('🌱 Iniciando seed de contenido de landing page...');

    // ============================================
    // SECCIONES
    // ============================================

    console.log('📄 Creando secciones...');

    const sections = [
      {
        section_key: 'hero',
        titulo: 'Imprime y recibe tus fotos',
        subtitulo: 'en pocos clics',
        boton_texto: 'Imprime prints',
        boton_color: '#F5A524',
        boton_enlace: '/login',
        configuracion_extra: {
          autoplay: true,
          autoplaySpeed: 3000,
          transitionSpeed: 3000,
          infinite: true
        },
        orden: 1,
        activo: true
      },
      {
        section_key: 'extensions',
        titulo: 'Ampliaciones',
        subtitulo: 'Perfectas para enmarcar, regalar o conservar en álbumes.',
        imagen_principal_url: '/slide3.jpg',
        boton_color: '#E04F8B',
        orden: 2,
        activo: true
      },
      {
        section_key: 'product_slider',
        texto_primario: 'papel lustre profesional',
        texto_secundario: ', que realza los colores y los detalles con un acabado elegante y duradero.',
        color_primario: '#E04F8B',
        configuracion_extra: {
          autoplay: true,
          autoplaySpeed: 3000,
          transitionSpeed: 500,
          infinite: true
        },
        orden: 3,
        activo: true
      },
      {
        section_key: 'legend',
        texto_primario: 'Imprime tus recuerdos',
        texto_secundario: '¡Regala sus mejores momentos!',
        imagen_fondo_url: '/slide3.jpg',
        color_gradiente_inicio: '#FCD34D00',
        color_gradiente_medio: '#38BDF880',
        color_gradiente_fin: '#EC489980',
        orden: 4,
        activo: true
      },
      {
        section_key: 'calendars',
        titulo: 'Calendarios',
        subtitulo: 'Perfectas para enmarcar, regalar o conservar en álbumes.',
        descripcion: 'Nuestras photo prints transforman tus recuerdos digitales en piezas tangibles que perduran en el tiempo.',
        color_secundario: '#F5A524',
        orden: 5,
        activo: true
      },
      {
        section_key: 'single_product',
        titulo: 'Pack de 100 fotografías tamaño 4x6',
        imagen_fondo_url: '/SingleProduct.jpg',
        boton_texto: 'Ordenar',
        boton_color: '#E04F8B',
        boton_enlace: '#',
        orden: 6,
        activo: true
      },
      {
        section_key: 'prints',
        titulo: 'Prints',
        subtitulo: 'Perfectas para enmarcar, regalar o conservar en álbumes.',
        descripcion: 'Nuestras photo prints transforman tus recuerdos digitales en piezas tangibles que perduran en el tiempo.',
        imagen_principal_url: '/slide1.jpg',
        color_primario: '#E04F8B',
        orden: 7,
        activo: true
      },
      {
        section_key: 'polaroids_banner',
        texto_primario: 'papel lustre profesional',
        texto_secundario: ', que realza los colores y los detalles con un acabado elegante y duradero.',
        color_primario: '#F5A524',
        orden: 8,
        activo: true
      },
      {
        section_key: 'polaroids_single',
        titulo: 'Imprime tus recuerdos,',
        subtitulo: 'Pack 50 fotos polaroid',
        descripcion: 'consérvalos para siempre.',
        imagen_principal_url: '/slide3.jpg',
        boton_color: '#47BEE5',
        orden: 9,
        activo: true
      },
      {
        section_key: 'polaroids_collage',
        titulo: 'Polaroid Prints',
        subtitulo: 'Perfectas para decorar tus espacios, crear murales, álbumes creativos o regalar recuerdos con un estilo único y atemporal.',
        orden: 10,
        activo: true
      },
      {
        section_key: 'platform_showcase',
        texto_primario: 'Edita, envía y recibe tu pedido.',
        texto_secundario: 'Todo desde la comodidad de tu casa.',
        imagen_principal_url: '/MainUser.png',
        imagen_fondo_url: '/MainUser.png',
        color_primario: '#E04F8B',
        color_gradiente_inicio: '#0891B2B3',
        color_gradiente_medio: '#FCD34DB3',
        color_gradiente_fin: '#EC4899B3',
        orden: 11,
        activo: true
      }
    ];

    for (const section of sections) {
      await prisma.landing_sections.upsert({
        where: { section_key: section.section_key },
        update: section,
        create: section
      });
      console.log(`  ✅ Sección "${section.section_key}" creada/actualizada`);
    }

    // ============================================
    // SLIDES
    // ============================================

    console.log('🖼️  Creando slides...');

    const slides = [
      // Hero Slides
      { section_key: 'hero', tipo: 'hero_slide', imagen_url: '/slide1.jpg', orden: 1, activo: true },
      { section_key: 'hero', tipo: 'hero_slide', imagen_url: '/slide2.jpg', orden: 2, activo: true },
      { section_key: 'hero', tipo: 'hero_slide', imagen_url: '/slide3.jpg', orden: 3, activo: true },
      { section_key: 'hero', tipo: 'hero_slide', imagen_url: '/slide4.jpg', orden: 4, activo: true },

      // Product Slider Slides
      {
        section_key: 'product_slider',
        tipo: 'product_slide',
        titulo: 'Pack 50 5x7',
        descripcion: 'Impresas en papel lustre profesional con revelado tradicional.',
        imagen_url: '/product-slider/slide1.jpg',
        orden: 1,
        activo: true
      },
      {
        section_key: 'product_slider',
        tipo: 'product_slide',
        titulo: 'Pack 50 5x7',
        descripcion: 'Impresas en papel lustre profesional con revelado tradicional.',
        imagen_url: '/product-slider/slide1.jpg',
        orden: 2,
        activo: true
      },
      {
        section_key: 'product_slider',
        tipo: 'product_slide',
        titulo: 'Pack 50 5x7',
        descripcion: 'Impresas en papel lustre profesional con revelado tradicional.',
        imagen_url: '/product-slider/slide1.jpg',
        orden: 3,
        activo: true
      },
      {
        section_key: 'product_slider',
        tipo: 'product_slide',
        titulo: 'Pack 50 5x7',
        descripcion: 'Impresas en papel lustre profesional con revelado tradicional.',
        imagen_url: '/product-slider/slide1.jpg',
        orden: 4,
        activo: true
      },

      // Calendars Collage Images
      { section_key: 'calendars', tipo: 'collage_image', imagen_url: '/slide3.jpg', orden: 1, activo: true },
      { section_key: 'calendars', tipo: 'collage_image', imagen_url: '/slide3.jpg', orden: 2, activo: true },
      { section_key: 'calendars', tipo: 'collage_image', imagen_url: '/slide3.jpg', orden: 3, activo: true },
      { section_key: 'calendars', tipo: 'collage_image', imagen_url: '/slide3.jpg', orden: 4, activo: true },

      // Polaroids Collage Images
      { section_key: 'polaroids_collage', tipo: 'collage_image', imagen_url: '/slide3.jpg', orden: 1, activo: true },
      { section_key: 'polaroids_collage', tipo: 'collage_image', imagen_url: '/slide3.jpg', orden: 2, activo: true },
      { section_key: 'polaroids_collage', tipo: 'collage_image', imagen_url: '/slide3.jpg', orden: 3, activo: true },
      { section_key: 'polaroids_collage', tipo: 'collage_image', imagen_url: '/slide3.jpg', orden: 4, activo: true }
    ];

    for (const slide of slides) {
      await prisma.landing_slides.create({
        data: slide
      });
    }
    console.log(`  ✅ ${slides.length} slides creados`);

    // ============================================
    // OPTIONS
    // ============================================

    console.log('📋 Creando opciones...');

    const options = [
      // Extensions Options
      { section_key: 'extensions', texto: 'Pack 50 Prints 4x6', orden: 1, activo: true },
      { section_key: 'extensions', texto: 'Pack 50 Prints 5x7', orden: 2, activo: true },
      { section_key: 'extensions', texto: 'Pack 100 Prints 4x6', orden: 3, activo: true },

      // Calendars Options
      { section_key: 'calendars', texto: 'Calendario 12 meses', orden: 1, activo: true },
      { section_key: 'calendars', texto: 'Calendario personalizado', orden: 2, activo: true },
      { section_key: 'calendars', texto: 'Calendario familiar', orden: 3, activo: true },

      // Prints Options
      { section_key: 'prints', texto: 'Pack 50 Prints 4x6', orden: 1, activo: true },
      { section_key: 'prints', texto: 'Pack 100 Prints 4x6', orden: 2, activo: true },
      { section_key: 'prints', texto: 'Pack 50 Prints 5x7', orden: 3, activo: true },

      // Polaroids Collage Options
      { section_key: 'polaroids_collage', texto: 'Pack 50 Polaroids', orden: 1, activo: true },
      { section_key: 'polaroids_collage', texto: 'Pack 100 Polaroids', orden: 2, activo: true },
      { section_key: 'polaroids_collage', texto: 'Pack 25 Polaroids', orden: 3, activo: true }
    ];

    for (const option of options) {
      await prisma.landing_options.create({
        data: option
      });
    }
    console.log(`  ✅ ${options.length} opciones creadas`);

    console.log('✨ Seed de contenido de landing page completado exitosamente!');
  } catch (error) {
    console.error('❌ Error al ejecutar el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedLandingContent();
