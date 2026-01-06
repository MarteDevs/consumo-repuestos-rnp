import { Request, Response } from 'express';
import prisma from '../config/db';
import { EquipmentSchema } from '../schemas/equipment.schema';

export const getEquipments = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;

    const equipments = await prisma.equipment.findMany({
      where: {
        // Filtro por Estado (Si no envían nada, traemos todo menos las BAJAS para no ensuciar la lista)
        status: status ? String(status) : { not: 'BAJA' },
        
        // Buscador Inteligente
        ...(search ? {
          OR: [
            { internal_code: { contains: String(search) } },
            { model: { contains: String(search) } },
            { serial_number: { contains: String(search) } }
          ]
        } : {})
      },
      include: {
        brands: true,      // Traer nombre de la Marca
        locations: true    // Traer nombre de la Ubicación actual
      },
      orderBy: { internal_code: 'asc' }
    });

    res.json(equipments);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener equipos' });
  }
};


// 2. CREAR EQUIPO
export const createEquipment = async (req: Request, res: Response) => {
  try {
    const data = EquipmentSchema.parse(req.body);

    // Validar duplicados
    const existing = await prisma.equipment.findFirst({
      where: { internal_code: data.internal_code }
    });

    if (existing) {
      res.status(400).json({ message: 'Ya existe un equipo con ese Código Interno' });
      return;
    }

    const newEquipment = await prisma.equipment.create({
      data: {
        internal_code: data.internal_code,
        serial_number: data.serial_number || '',
        model: data.model.toUpperCase(),
        brand_id: data.brand_id,
        current_location_id: data.current_location_id,
        accumulated_feet: data.accumulated_feet,
        status: 'OPERATIVO'
      }
    });

    res.status(201).json(newEquipment);
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || 'Error creando equipo' });
  }
};

// 3. ACTUALIZAR EQUIPO
export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Usamos partial() para permitir actualizar solo 1 campo si queremos
    const data = EquipmentSchema.partial().parse(req.body);

    const updated = await prisma.equipment.update({
      where: { id: Number(id) },
      data: {
        internal_code: data.internal_code,
        serial_number: data.serial_number,
        model: data.model ? data.model.toUpperCase() : undefined,
        brand_id: data.brand_id,
        current_location_id: data.current_location_id,
        status: data.status,
        // No permitimos editar accumulated_feet directamente aquí para evitar fraudes,
        // eso se actualiza solo mediante Órdenes de Trabajo.
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.errors?.[0]?.message || 'Error actualizando' });
  }
};

// 4. ELIMINAR (DAR DE BAJA)
export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft Delete: Lo pasamos a estado BAJA
    await prisma.equipment.update({
      where: { id: Number(id) },
      data: { status: 'BAJA' }
    });

    res.json({ message: 'Equipo dado de baja correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar equipo' });
  }
};