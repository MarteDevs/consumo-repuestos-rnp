import { Request, Response } from 'express';
import prisma from '../config/db';

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