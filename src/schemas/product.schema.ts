import { z } from 'zod';

// 1. Esquema para crear un Producto Nuevo (Solo nombre y código)
export const CreateProductSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 letras"),
  part_number: z.string().min(1, "El número de parte es obligatorio"),
  unit_of_measure: z.enum(['UND', 'JGO', 'GLN', 'LTR', 'MTR', 'KG']), // Agrega las que uses
});

// 2. Esquema para Asignar/Actualizar Precio a una Marca
export const ProductVariantSchema = z.object({
  catalog_id: z.number().int("ID de producto inválido"),
  brand_id: z.number().int("ID de marca inválido"),
  unit_price: z.number().positive("El precio debe ser mayor a 0"),
  currency: z.enum(['PEN', 'USD'])
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
export type ProductVariantDTO = z.infer<typeof ProductVariantSchema>;