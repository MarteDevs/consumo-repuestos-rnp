import { Request, Response } from 'express';
import prisma from '../config/db';

export const getEquipments = async (req: Request, res: Response) => {
  try {
    const equipments = await prisma.equipment.findMany({
      where: { status: 'OPERATIVO' }, // Solo traemos los activos
      select: {
        id: true,
        internal_code: true, // Ej: 1011-84
        accumulated_feet: true, // ¡DATO CLAVE! Para validar horómetros
        current_location_id: true
      },
      orderBy: { internal_code: 'asc' }
    });

    res.json(equipments);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener equipos' });
  }
};