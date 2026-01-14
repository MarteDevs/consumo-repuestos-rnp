"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderSchema = void 0;
const zod_1 = require("zod");
// Validamos que los items del detalle sean correctos
const OrderItemSchema = zod_1.z.object({
    variant_id: zod_1.z.number().int().positive("El ID del repuesto es obligatorio"),
    quantity: zod_1.z.number().positive("La cantidad debe ser mayor a 0")
});
// Este es el esquema principal que usaremos en la Ruta
exports.CreateOrderSchema = zod_1.z.object({
    // Agregamos validación de fecha (string porque viene del input date)
    order_date: zod_1.z.string()
        .min(1, "La fecha es obligatoria")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (debe ser YYYY-MM-DD)"),
    // Validamos el POOT (Número de orden física)
    poot_number: zod_1.z.string().min(1, "El N° POOT es obligatorio"),
    // IDs de las relaciones (Deben ser números enteros)
    equipment_id: zod_1.z.number("El ID de equipo debe ser un número").int(),
    location_id: zod_1.z.number().int().optional(),
    mechanic_id: zod_1.z.number().int().optional(),
    supervisor_id: zod_1.z.number().int().optional(),
    maintenance_type: zod_1.z.enum(['PREVENTIVO', 'CORRECTIVO', 'RELLENADO']).optional(),
    // Validamos horómetros (No pueden ser negativos)
    meter_reading_previous: zod_1.z.number().nonnegative(),
    meter_reading_current: zod_1.z.number().nonnegative(),
    // Validamos que haya al menos 1 repuesto
    items: zod_1.z.array(OrderItemSchema).nonempty("Debes agregar al menos un repuesto a la orden")
});
