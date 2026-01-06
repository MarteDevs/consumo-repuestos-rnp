import { z } from 'zod';

// Esquema para Crear/Actualizar Personal
export const PersonnelSchema = z.object({
  full_name: z.string().min(3, "El nombre debe tener al menos 3 letras"),
  // Limitamos los cargos a los que tu sistema soporta
  job_title: z.enum(['MECANICO', 'SUPERVISOR', 'OPERADOR', 'ADMINISTRADOR'], {
    message: "El cargo debe ser: MECANICO, SUPERVISOR, OPERADOR o ADMINISTRADOR"
  })
});

export type PersonnelDTO = z.infer<typeof PersonnelSchema>;