"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentSchema = void 0;
const zod_1 = require("zod");
exports.EquipmentSchema = zod_1.z.object({
    internal_code: zod_1.z.string().min(2, "El código interno es obligatorio (Ej: 1011-23)"),
    serial_number: zod_1.z.string().optional(), // Puede ser opcional al inicio
    model: zod_1.z.string().min(1, "El modelo es obligatorio"),
    brand_id: zod_1.z.number({ message: "La marca es obligatoria" }).int(),
    // Ubicación inicial (Opcional, si no se pone, queda null)
    current_location_id: zod_1.z.number().int().optional(),
    // Horómetro inicial (Opcional, por defecto 0)
    accumulated_feet: zod_1.z.number().nonnegative().optional().default(0),
    // Estado inicial
    status: zod_1.z.enum(['OPERATIVO', 'EN_MANTENIMIENTO', 'BAJA']).optional().default('OPERATIVO')
});
