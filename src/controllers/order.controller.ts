import { Request, Response } from 'express';
import { createOrderService } from '../services/order.service';
import { CreateOrderSchema } from '../schemas/order.schema';
import { z } from 'zod';

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