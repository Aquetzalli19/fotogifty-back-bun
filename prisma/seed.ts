import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales...');

  // Insertar estados de pedido
  console.log('📦 Insertando estados de pedido...');
  const estadosPedido = [
    { id: 1, nombre: 'Pendiente', descripcion: 'Pedido recibido, en espera de procesamiento', color: '#FFC107', orden: 1, activo: true },
    { id: 2, nombre: 'Imprimiendo', descripcion: 'Las fotos están siendo impresas', color: '#2196F3', orden: 2, activo: true },
    { id: 3, nombre: 'Empaquetado', descripcion: 'El pedido está siendo empaquetado', color: '#9C27B0', orden: 3, activo: true },
    { id: 4, nombre: 'Enviado', descripcion: 'Pedido enviado al cliente', color: '#FF9800', orden: 4, activo: true },
    { id: 5, nombre: 'En reparto', descripcion: 'El pedido está en camino al cliente', color: '#03A9F4', orden: 5, activo: true },
    { id: 6, nombre: 'Entregado', descripcion: 'Pedido entregado al cliente', color: '#4CAF50', orden: 6, activo: true },
    { id: 7, nombre: 'Archivado', descripcion: 'Pedido archivado', color: '#9E9E9E', orden: 7, activo: true },
  ];

  for (const estado of estadosPedido) {
    await prisma.estados_pedido.upsert({
      where: { id: estado.id },
      update: { color: estado.color, orden: estado.orden, activo: estado.activo },
      create: estado,
    });
  }
  console.log('✅ Estados de pedido insertados');

  // Insertar tipos de paquete
  console.log('📦 Insertando tipos de paquete...');
  const tiposPaquete = [
    { id: 1, nombre: 'Básico', descripcion: 'Paquetes básicos de fotos' },
    { id: 2, nombre: 'Premium', descripcion: 'Paquetes premium con más fotos' },
    { id: 3, nombre: 'Personalizado', descripcion: 'Paquetes personalizados' },
    { id: 4, nombre: 'Expansión', descripcion: 'Expansiones para paquetes existentes' },
    { id: 5, nombre: 'Calendario', descripcion: 'Paquetes de calendario' },
  ];

  for (const tipo of tiposPaquete) {
    await prisma.tipo_paquete.upsert({
      where: { id: tipo.id },
      update: {},
      create: tipo,
    });
  }
  console.log('✅ Tipos de paquete insertados');

  // Insertar configuración del footer (singleton)
  console.log('🦶 Insertando configuración del footer...');
  const footerConfig = await prisma.footer_config.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      descripcion: null,
      email: null,
      telefono: null,
    },
  });
  console.log('✅ Configuración del footer insertada');

  // Insertar enlaces sociales de ejemplo
  console.log('🔗 Insertando enlaces sociales de ejemplo...');
  const socialLinks = [
    { plataforma: 'instagram', url: 'https://instagram.com/fotogifty', orden: 0, activo: true },
    { plataforma: 'facebook', url: 'https://facebook.com/fotogifty', orden: 1, activo: true },
    { plataforma: 'whatsapp', url: 'https://wa.me/5512345678', orden: 2, activo: true },
  ];

  for (const link of socialLinks) {
    await prisma.social_links.upsert({
      where: {
        footer_config_id_plataforma: {
          footer_config_id: footerConfig.id,
          plataforma: link.plataforma as any,
        },
      },
      update: {},
      create: {
        footer_config_id: footerConfig.id,
        plataforma: link.plataforma as any,
        url: link.url,
        orden: link.orden,
        activo: link.activo,
      },
    });
  }
  console.log('✅ Enlaces sociales insertados');

  console.log('🎉 ¡Datos iniciales sembrados exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error sembrando datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
