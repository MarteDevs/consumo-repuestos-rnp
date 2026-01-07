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
    const { page = '1', limit = '10', search } = req.query;

    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const where = search ? {
      OR: [
        { poot_number: { contains: String(search) } },
        { equipment: { internal_code: { contains: String(search) } } }
      ]
    } : undefined;

    // Contar total de registros
    const total = await prisma.maintenance_orders.count({ where });

    // Obtener registros paginados
    const orders = await prisma.maintenance_orders.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        equipment: true,
        personnel_maintenance_orders_mechanic_idTopersonnel: true,
        personnel_maintenance_orders_supervisor_idTopersonnel: true,
        consumption_details: true
      },
      skip,
      take: limitNum
    });

    // Procesamos para calcular el TOTAL de cada orden
    const formattedOrders = orders.map(order => {
      const totalCost = order.consumption_details.reduce((sum, item) => {
        return sum + Number(item.total_line_cost);
      }, 0);

      return {
        ...order,
        total_cost: totalCost,
        items_count: order.consumption_details.length,
        mechanic: order.personnel_maintenance_orders_mechanic_idTopersonnel,
        supervisor: order.personnel_maintenance_orders_supervisor_idTopersonnel
      };
    });

    res.json({
      data: formattedOrders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial de órdenes' });
  }
};


export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.maintenance_orders.findUnique({
      where: { id: Number(id) },
      include: {
        // 1. Traemos Equipo + Su Ubicación Actual
        equipment: {
          include: {
            locations: true // Para saber dónde está el equipo físicamente
          }
        },
        // 2. Traemos la Ubicación de Destino del Pedido
        locations: true, 
        
        // 3. Personal
        personnel_maintenance_orders_mechanic_idTopersonnel: true,
        personnel_maintenance_orders_supervisor_idTopersonnel: true,
        
        // 4. Detalles + Nombres Correctos (Usando los nombres de Prisma)
        consumption_details: {
          include: {
            product_variants: { // <--- Así se llama en tu BD
              include: {
                product_catalog: true, // <--- Así se llama en tu BD
                brands: true           // <--- Así se llama en tu BD
              }
            }
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' });
      return;
    }

    // --- LIMPIEZA DE DATOS (MAPPING) ---
    // Convertimos la estructura fea de Prisma a la bonita que espera Vue
    const formattedOrder = {
      ...order,
      // Nombres de cabecera
      location: order.locations, // "Area Destino"
      mechanic: order.personnel_maintenance_orders_mechanic_idTopersonnel,
      supervisor: order.personnel_maintenance_orders_supervisor_idTopersonnel,
      
      // Limpieza de los detalles (Aquí arreglamos el "Item desconocido")
      consumption_details: order.consumption_details.map(detail => ({
        ...detail,
        variant: {
          ...detail.product_variants,
          // Mapeamos 'product_catalog' a 'catalog' para que el front lo entienda
          catalog: detail.product_variants?.product_catalog, 
          // Mapeamos 'brands' a 'brand'
          brand: detail.product_variants?.brands
        }
      })),

      // Calculamos total
      total_cost: order.consumption_details.reduce((sum, item) => sum + Number(item.total_line_cost), 0)
    };

    res.json(formattedOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el detalle' });
  }
};