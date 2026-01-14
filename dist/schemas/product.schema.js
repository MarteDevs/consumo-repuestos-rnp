"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantSchema = exports.CreateProductSchema = void 0;
const zod_1 = require("zod");
// 1. Esquema para crear un Producto Nuevo (Solo nombre y código)
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "El nombre debe tener al menos 3 letras"),
    part_number: zod_1.z.string().min(1, "El número de parte es obligatorio"),
    unit_of_measure: zod_1.z.enum(['UND', 'JGO', 'GLN', 'LTR', 'MTR', 'KG']), // Agrega las que uses
});
// 2. Esquema para Asignar/Actualizar Precio a una Marca
exports.ProductVariantSchema = zod_1.z.object({
    catalog_id: zod_1.z.number().int("ID de producto inválido"),
    brand_id: zod_1.z.number().int("ID de marca inválido"),
    unit_price: zod_1.z.number().positive("El precio debe ser mayor a 0"),
    currency: zod_1.z.enum(['PEN', 'USD'])
});
