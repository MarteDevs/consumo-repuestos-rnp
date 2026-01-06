import { Request, Response } from 'express';
import prisma from '../config/db';
import { PersonnelSchema } from '../schemas/personnel.schema';

export const getPersonnel = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;

    const personnel = await prisma.personnel.findMany({
      where: {
        is_active: true, // Solo activos
        ...(role ? { job_title: String(role) } : {}),
        ...(search ? { full_name: { contains: String(search) } } : {}) // Búsqueda por nombre
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

// 2. CREAR PERSONAL
export const createPersonnel = async (req: Request, res: Response) => {
  try {
    // Validamos datos con Zod
    const data = PersonnelSchema.parse(req.body);

    // Creamos en BD
    const newPerson = await prisma.personnel.create({
      data: {
        full_name: data.full_name.toUpperCase(), // Guardamos en mayúsculas por orden
        job_title: data.job_title,
        is_active: true
      }
    });

    res.status(201).json(newPerson);
  } catch (error: any) {
    // Si Zod falla, enviamos el mensaje bonito
    res.status(400).json({ message: error.errors?.[0]?.message || 'Error al crear personal' });
  }
};

// 3. ACTUALIZAR PERSONAL
export const updatePersonnel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = PersonnelSchema.parse(req.body);

    const updatedPerson = await prisma.personnel.update({
      where: { id: Number(id) },
      data: {
        full_name: data.full_name.toUpperCase(),
        job_title: data.job_title
      }
    });

    res.json(updatedPerson);
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || 'Error al actualizar' });
  }
};

// 4. ELIMINAR PERSONAL (Soft Delete)
export const deletePersonnel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // No borramos el registro físicamente para no romper historiales de órdenes pasadas.
    // Solo lo marcamos como inactivo.
    await prisma.personnel.update({
      where: { id: Number(id) },
      data: { is_active: false }
    });

    res.json({ message: 'Personal desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar personal' });
  }
};