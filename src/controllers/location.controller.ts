import { Request, Response } from 'express';
import prisma from '../config/db';
import { LocationSchema } from '../schemas/location.schema';

export const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await prisma.locations.findMany({
      select: {
        id: true,
        name: true,
        type: true // 'MINA', 'TALLER', etc.
      },
      orderBy: { name: 'asc' }
    });

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ubicaciones' });
  }
};


// 2. CREAR
export const createLocation = async (req: Request, res: Response) => {
  try {
    const data = LocationSchema.parse(req.body);

    const newLocation = await prisma.locations.create({
      data: {
        name: data.name.toUpperCase(),
        type: data.type
      }
    });

    res.status(201).json(newLocation);
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || 'Error creando ubicación' });
  }
};

// 3. ACTUALIZAR
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = LocationSchema.parse(req.body);

    const updated = await prisma.locations.update({
      where: { id: Number(id) },
      data: {
        name: data.name.toUpperCase(),
        type: data.type
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: 'Error actualizando ubicación' });
  }
};

// 4. ELIMINAR
export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Intentamos borrar. Si falla es porque hay datos vinculados.
    await prisma.locations.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Ubicación eliminada correctamente' });
  } catch (error) {
    // Código P2003 de Prisma significa violación de llave foránea (Foreign Key)
    // Es decir, intentas borrar una ubicación que ya tiene órdenes o equipos.
    res.status(400).json({ message: 'No se puede eliminar: Esta ubicación tiene historial asociado.' });
  }
};