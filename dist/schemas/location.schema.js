"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationSchema = void 0;
const zod_1 = require("zod");
exports.LocationSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "El nombre debe tener al menos 3 letras"),
    // Puedes restringir los tipos si quieres, o dejarlo abierto
    type: zod_1.z.enum(['MINA', 'TALLER', 'ALMACEN', 'SUPERFICIE', 'OFICINA', 'OTRO'])
});
