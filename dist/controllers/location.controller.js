"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocation = exports.updateLocation = exports.createLocation = exports.getLocations = void 0;
const db_1 = __importDefault(require("../config/db"));
const location_schema_1 = require("../schemas/location.schema");
const getLocations = async (req, res) => {
    try {
        const { search, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;
        const where = search ? {
            name: { contains: String(search) }
        } : {};
        // Contar total de registros
        const total = await db_1.default.locations.count({ where });
        // Obtener registros paginados
        const locations = await db_1.default.locations.findMany({
            where,
            select: {
                id: true,
                name: true,
                type: true
            },
            orderBy: { name: 'asc' },
            skip,
            take: limitNum
        });
        res.json({
            data: locations,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener ubicaciones' });
    }
};
exports.getLocations = getLocations;
// 2. CREAR
const createLocation = async (req, res) => {
    try {
        const data = location_schema_1.LocationSchema.parse(req.body);
        const newLocation = await db_1.default.locations.create({
            data: {
                name: data.name.toUpperCase(),
                type: data.type
            }
        });
        res.status(201).json(newLocation);
    }
    catch (error) {
        res.status(400).json({ message: error.errors?.[0]?.message || 'Error creando ubicación' });
    }
};
exports.createLocation = createLocation;
// 3. ACTUALIZAR
const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const data = location_schema_1.LocationSchema.parse(req.body);
        const updated = await db_1.default.locations.update({
            where: { id: Number(id) },
            data: {
                name: data.name.toUpperCase(),
                type: data.type
            }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: 'Error actualizando ubicación' });
    }
};
exports.updateLocation = updateLocation;
// 4. ELIMINAR
const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        // Intentamos borrar. Si falla es porque hay datos vinculados.
        await db_1.default.locations.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Ubicación eliminada correctamente' });
    }
    catch (error) {
        // Código P2003 de Prisma significa violación de llave foránea (Foreign Key)
        // Es decir, intentas borrar una ubicación que ya tiene órdenes o equipos.
        res.status(400).json({ message: 'No se puede eliminar: Esta ubicación tiene historial asociado.' });
    }
};
exports.deleteLocation = deleteLocation;
