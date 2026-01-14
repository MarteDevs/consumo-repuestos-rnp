"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePersonnel = exports.updatePersonnel = exports.createPersonnel = exports.getPersonnel = void 0;
const db_1 = __importDefault(require("../config/db"));
const personnel_schema_1 = require("../schemas/personnel.schema");
const getPersonnel = async (req, res) => {
    try {
        const { role, search, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;
        const where = {
            is_active: true,
            ...(role ? { job_title: String(role) } : {}),
            ...(search ? { full_name: { contains: String(search) } } : {})
        };
        // Contar total de registros
        const total = await db_1.default.personnel.count({ where });
        // Obtener registros paginados
        const personnel = await db_1.default.personnel.findMany({
            where,
            select: {
                id: true,
                full_name: true,
                job_title: true
            },
            orderBy: { full_name: 'asc' },
            skip,
            take: limitNum
        });
        res.json({
            data: personnel,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener personal' });
    }
};
exports.getPersonnel = getPersonnel;
// 2. CREAR PERSONAL
const createPersonnel = async (req, res) => {
    try {
        // Validamos datos con Zod
        const data = personnel_schema_1.PersonnelSchema.parse(req.body);
        // Creamos en BD
        const newPerson = await db_1.default.personnel.create({
            data: {
                full_name: data.full_name.toUpperCase(), // Guardamos en mayúsculas por orden
                job_title: data.job_title,
                is_active: true
            }
        });
        res.status(201).json(newPerson);
    }
    catch (error) {
        // Si Zod falla, enviamos el mensaje bonito
        res.status(400).json({ message: error.errors?.[0]?.message || 'Error al crear personal' });
    }
};
exports.createPersonnel = createPersonnel;
// 3. ACTUALIZAR PERSONAL
const updatePersonnel = async (req, res) => {
    try {
        const { id } = req.params;
        const data = personnel_schema_1.PersonnelSchema.parse(req.body);
        const updatedPerson = await db_1.default.personnel.update({
            where: { id: Number(id) },
            data: {
                full_name: data.full_name.toUpperCase(),
                job_title: data.job_title
            }
        });
        res.json(updatedPerson);
    }
    catch (error) {
        res.status(400).json({ message: error.errors?.[0]?.message || 'Error al actualizar' });
    }
};
exports.updatePersonnel = updatePersonnel;
// 4. ELIMINAR PERSONAL (Soft Delete)
const deletePersonnel = async (req, res) => {
    try {
        const { id } = req.params;
        // No borramos el registro físicamente para no romper historiales de órdenes pasadas.
        // Solo lo marcamos como inactivo.
        await db_1.default.personnel.update({
            where: { id: Number(id) },
            data: { is_active: false }
        });
        res.json({ message: 'Personal desactivado correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar personal' });
    }
};
exports.deletePersonnel = deletePersonnel;
