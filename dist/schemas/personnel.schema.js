"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonnelSchema = void 0;
const zod_1 = require("zod");
// Esquema para Crear/Actualizar Personal
exports.PersonnelSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(3, "El nombre debe tener al menos 3 letras"),
    // Limitamos los cargos a los que tu sistema soporta
    job_title: zod_1.z.enum(['MECANICO', 'SUPERVISOR', 'OPERADOR', 'ADMINISTRADOR'], {
        message: "El cargo debe ser: MECANICO, SUPERVISOR, OPERADOR o ADMINISTRADOR"
    })
});
