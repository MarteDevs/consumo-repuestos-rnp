import { z } from 'zod';

export const LocationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 letras"),
  // Puedes restringir los tipos si quieres, o dejarlo abierto
  type: z.enum(['MINA', 'TALLER', 'ALMACEN', 'SUPERFICIE', 'OFICINA', 'OTRO'])
});

export type LocationDTO = z.infer<typeof LocationSchema>;