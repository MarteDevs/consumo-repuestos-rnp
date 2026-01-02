import { Request, Response } from 'express';
import { createOrderService } from '../services/order.service';
import { CreateOrderSchema } from '../schemas/order.schema';
import { z } from 'zod';
import { prisma } from '../config/db';

export const createOrderController = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validamos los datos que llegan (Si fallan, Zod lanza error aquí mismo)
    const validatedData = CreateOrderSchema.parse(req.body);

    // 2. Llamamos al servicio (Lógica de negocio)
    const newOrder = await createOrderService(validatedData);

    // 3. Respuesta Exitosa
    res.status(201).json({
      success: true,
      message: 'Orden de consumo creada exitosamente 🚀',
      data: newOrder
    });

  } catch (error: any) {
    // Manejo de errores profesional
    
    // A. Si es error de validación (Zod)
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Error de validación en los datos',
        errors: error.issues // Devuelve detalle exacto de qué campo falló
      });
      return; // Importante: detener la ejecución
    }

    // B. Si es error de negocio (lo que lanzamos en el Service con "throw new Error")
    res.status(400).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.maintenance_orders.findMany({
      orderBy: { created_at: 'desc' }, // Las más nuevas primero
      include: {
        equipment: true, // Traemos datos del equipo
        personnel_maintenance_orders_mechanic_idTopersonnel: true,  // Traemos datos del mecánico
        personnel_maintenance_orders_supervisor_idTopersonnel: true,// Traemos datos del supervisor
        consumption_details: true // Traemos los detalles para calcular el costo
      }
    });

    // Procesamos para calcular el TOTAL de cada orden
    const formattedOrders = orders.map(order => {
      // Sumamos el costo de todos los repuestos de esta orden
      const totalCost = order.consumption_details.reduce((sum, item) => {
        return sum + Number(item.total_line_cost);
      }, 0);

      return {
        ...order,
        total_cost: totalCost, // Campo calculado extra
        items_count: order.consumption_details.length,

        mechanic: order.personnel_maintenance_orders_mechanic_idTopersonnel,
        supervisor: order.personnel_maintenance_orders_supervisor_idTopersonnel
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial de órdenes' });
  }
};