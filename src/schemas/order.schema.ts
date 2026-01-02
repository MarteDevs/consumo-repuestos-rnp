import { z } from 'zod';

// Validamos que los items del detalle sean correctos
const OrderItemSchema = z.object({
  variant_id: z.number().int().positive("El ID del repuesto es obligatorio"),
  quantity: z.number().positive("La cantidad debe ser mayor a 0")
});

// Este es el esquema principal que usaremos en la Ruta
export const CreateOrderSchema = z.object({
  // Validamos el POOT (Número de orden física)
  poot_number: z.string().min(1, "El N° POOT es obligatorio"),
  
  // IDs de las relaciones (Deben ser números enteros)
  equipment_id: z.number("El ID de equipo debe ser un número").int(),
  location_id: z.number().int().optional(),
  mechanic_id: z.number().int().optional(),
  supervisor_id: z.number().int().optional(),
  
  maintenance_type: z.enum(['PREVENTIVO', 'CORRECTIVO', 'RELLENADO']).optional(),
  
  // Validamos horómetros (No pueden ser negativos)
  meter_reading_previous: z.number().nonnegative(),
  meter_reading_current: z.number().nonnegative(),
  
  // Validamos que haya al menos 1 repuesto
  items: z.array(OrderItemSchema).nonempty("Debes agregar al menos un repuesto a la orden")
});

// Tipos de TypeScript inferidos automáticamente (¡Magia!)
export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;