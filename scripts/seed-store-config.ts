import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding store configuration...');

  // Verificar si ya existe una configuración
  const existingConfig = await prisma.configuracion_tienda.findFirst();

  if (existingConfig) {
    console.log('✅ Store configuration already exists');
    console.log(existingConfig);
    return;
  }

  // Crear configuración inicial
  const config = await prisma.configuracion_tienda.create({
    data: {
      nombre: 'FotoGifty - Tienda Principal',
      direccion: 'Av. Principal #123, Col. Centro',
      ciudad: 'Ciudad de México',
      estado: 'CDMX',
      codigo_postal: '01000',
      pais: 'México',
      telefono: '55-1234-5678',
      email: 'contacto@fotogifty.com',
      latitud: 19.432608,
      longitud: -99.133209,
      horario_lunes_viernes: 'Lunes a Viernes: 9:00 AM - 7:00 PM',
      horario_sabado: 'Sábado: 10:00 AM - 3:00 PM',
      horario_domingo: 'Domingo: Cerrado',
      descripcion: 'Nuestra tienda principal en el centro de la ciudad',
      instrucciones_llegada: 'Estamos frente al parque central, edificio azul'
    }
  });

  console.log('✅ Store configuration created:', config);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding store configuration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
