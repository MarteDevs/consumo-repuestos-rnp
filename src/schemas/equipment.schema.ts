import { z } from 'zod';

export const EquipmentSchema = z.object({
  internal_code: z.string().min(2, "El código interno es obligatorio (Ej: 1011-23)"),
  serial_number: z.string().optional(), // Puede ser opcional al inicio
  model: z.string().min(1, "El modelo es obligatorio"),
  
  brand_id: z.number({ message: "La marca es obligatoria" }).int(),
  
  // Ubicación inicial (Opcional, si no se pone, queda null)
  current_location_id: z.number().int().optional(),
  
  // Horómetro inicial (Opcional, por defecto 0)
  accumulated_feet: z.number().nonnegative().optional().default(0),
  
  // Estado inicial
  status: z.enum(['OPERATIVO', 'EN_MANTENIMIENTO', 'BAJA']).optional().default('OPERATIVO')
});

export type EquipmentDTO = z.infer<typeof EquipmentSchema>;