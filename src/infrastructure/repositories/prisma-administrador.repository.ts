import { PrismaClient } from '@prisma/client';
import { AdministradorRepository } from '../../domain/ports/administrador.repository';
import { Administrador } from '../../domain/entities/administrador.entity';

const prisma = new PrismaClient();

export class PrismaAdministradorRepository implements AdministradorRepository {
  async crearAdministrador(data: Omit<Administrador, 'id'>): Promise<Administrador> {
    const administrador = await prisma.administradores.create({
      data: {
        usuario_id: data.usuario_id,
        nivel_acceso: data.nivel_acceso,
        activo: data.activo
      }
    });
    
    return administrador;
  }

  async obtenerAdministradorPorId(id: number): Promise<Administrador | null> {
    return await prisma.administradores.findUnique({
      where: {
        id
      }
    });
  }

  async obtenerAdministradorPorUsuarioId(usuarioId: number): Promise<Administrador | null> {
    return await prisma.administradores.findUnique({
      where: {
        usuario_id: usuarioId
      }
    });
  }

  async actualizarAdministrador(id: number, data: Partial<Omit<Administrador, 'id'>>): Promise<Administrador> {
    return await prisma.administradores.update({
      where: {
        id
      },
      data
    });
  }

  async eliminarAdministrador(id: number): Promise<boolean> {
    const result = await prisma.administradores.update({
      where: {
        id
      },
      data: {
        activo: false
      }
    });
    
    return !!result;
  }
}