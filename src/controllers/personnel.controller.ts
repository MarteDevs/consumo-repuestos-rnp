import { Request, Response } from 'express';
import prisma from '../config/db';

export const getPersonnel = async (req: Request, res: Response) => {
  try {
    // Podemos filtrar por rol si mandan ?role=MECANICO en la URL
    const { role } = req.query;

    const personnel = await prisma.personnel.findMany({
      where: {
        is_active: true,
        ...(role ? { job_title: String(role) } : {}) // Filtro opcional
      },
      select: {
        id: true,
        full_name: true,
        job_title: true
      },
      orderBy: { full_name: 'asc' }
    });

    res.json(personnel);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener personal' });
  }
};