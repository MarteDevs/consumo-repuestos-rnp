"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportStats = exports.searchByEquipo = exports.searchByPoot = exports.importExcelData = exports.upload = void 0;
const XLSX = __importStar(require("xlsx"));
const db_1 = require("../config/db");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
// Configurar multer para subida de archivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../temp');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'POOT-2025-ACTUAL.xlsx');
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
        }
    }
});
// Importar datos desde Excel a tabla Query1
const importExcelData = async (req, res) => {
    try {
        const filePath = path_1.default.join(__dirname, '../../temp/POOT-2025-ACTUAL.xlsx');
        // Verificar que el archivo existe
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ message: 'Archivo Excel no encontrado en temp/' });
            return;
        }
        // Leer el archivo Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = 'Query_sep';
        if (!workbook.Sheets[sheetName]) {
            res.status(400).json({ message: `Hoja "${sheetName}" no encontrada en el archivo` });
            return;
        }
        // Convertir a JSON
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        if (rawData.length === 0) {
            res.status(400).json({ message: 'No hay datos en la hoja Query_sep' });
            return;
        }
        // Limpiar tabla antes de importar (datos temporales)
        await db_1.prisma.query1.deleteMany({});
        // Mapear y preparar datos
        const dataToInsert = rawData.map((row) => {
            // Convertir fecha de Excel (número serial) a Date
            let fecha = null;
            if (row.Fecha && typeof row.Fecha === 'number') {
                const excelEpoch = new Date(1899, 11, 30);
                fecha = new Date(excelEpoch.getTime() + row.Fecha * 86400000);
            }
            return {
                area_solicitante: row.Area_Solicitante ? String(row.Area_Solicitante).substring(0, 100) : null,
                empresa: row.Empresa ? String(row.Empresa).substring(0, 50) : null,
                fecha: fecha,
                comprobante_original: row.Comprobante_Original ? String(row.Comprobante_Original).trim().substring(0, 50) : null,
                numero_original: row.Número_Original ? parseInt(String(row.Número_Original)) : null,
                poot_b: row['POOT-B'] ? String(row['POOT-B']).substring(0, 50) : null,
                comprobante_stock: row.Comprobante_Stock ? String(row.Comprobante_Stock).substring(0, 50) : null,
                numero_stock: row.Número_Stock ? parseInt(String(row.Número_Stock)) : null,
                numero_item: row.Número_Item ? parseInt(String(row.Número_Item)) : null,
                tipo_producto: row.Tipo_Producto ? String(row.Tipo_Producto).substring(0, 50) : null,
                material: row.Material ? String(row.Material).substring(0, 255) : null,
                codigo: row.Codigo ? String(row.Codigo).substring(0, 50) : null,
                unidad: row.Unidad ? String(row.Unidad).substring(0, 20) : null,
                cantidad: row.Cantidad ? parseFloat(String(row.Cantidad)) : null,
                precio_igv: row.Precio_Igv ? parseFloat(String(row.Precio_Igv)) : null,
                total: row.TOTAL ? parseFloat(String(row.TOTAL)) : null,
                lista: row.Lista ? String(row.Lista).trim().substring(0, 50) : null,
                moneda: row.Moneda ? String(row.Moneda).substring(0, 10) : null,
                form_h: row.FORM_H ? String(row.FORM_H).substring(0, 255) : null,
                go_estapro: row.GO_ESTAPRO ? String(row.GO_ESTAPRO).substring(0, 100) : null,
                go_userid: row.GO_USERID ? String(row.GO_USERID).substring(0, 100) : null,
                go_cantid: row.GO_CANTID ? parseFloat(String(row.GO_CANTID)) : null,
                go_canate: row.GO_CANATE ? parseFloat(String(row.GO_CANATE)) : null,
                go_canpen: row.GO_CANPEN ? parseFloat(String(row.GO_CANPEN)) : null,
                go_desdep: row.GO_DESDEP ? String(row.GO_DESDEP).substring(0, 100) : null,
                go_obsvdt: row.GO_OBSVDT ? String(row.GO_OBSVDT) : null,
                go_textos: row.GO_TEXTOS ? String(row.GO_TEXTOS) : null,
                area_pedido_destino: row.Area_Pedido_Destino ? String(row.Area_Pedido_Destino).substring(0, 100) : null,
                equipo: row.Equipo ? String(row.Equipo).substring(0, 100) : null,
                observacion: row.Observacion ? String(row.Observacion) : null,
                tipo_manten: row.Tipo_Manten ? String(row.Tipo_Manten).substring(0, 50) : null,
                mantenimiento: row.Mantenimiento ? String(row.Mantenimiento).substring(0, 100) : null,
                horas: row.Horas ? String(row.Horas).substring(0, 50) : null,
                hora_inicial: row.Hora_Inicial ? String(row.Hora_Inicial).substring(0, 50) : null,
                hora_final: row.Hora_Final ? String(row.Hora_Final).substring(0, 50) : null,
                hora: row.Hora ? String(row.Hora).substring(0, 50) : null,
                cod_trabajador: row.Cod_Trabajador ? String(row.Cod_Trabajador).substring(0, 50) : null,
                mes: row.Mes ? String(row.Mes).substring(0, 20) : null,
                anio: row.Año ? String(row.Año).substring(0, 10) : null
            };
        });
        // Insertar en lotes de 100 registros
        const batchSize = 100;
        let insertedCount = 0;
        for (let i = 0; i < dataToInsert.length; i += batchSize) {
            const batch = dataToInsert.slice(i, i + batchSize);
            await db_1.prisma.query1.createMany({
                data: batch,
                skipDuplicates: true
            });
            insertedCount += batch.length;
        }
        res.json({
            success: true,
            message: `✅ ${insertedCount} registros importados correctamente`,
            total: insertedCount
        });
    }
    catch (error) {
        console.error('Error importando Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Error al importar datos desde Excel',
            error: error.message
        });
    }
};
exports.importExcelData = importExcelData;
// Buscar datos en Query1 por POOT
const searchByPoot = async (req, res) => {
    try {
        const { poot } = req.query;
        if (!poot) {
            res.status(400).json({ message: 'Parámetro POOT requerido' });
            return;
        }
        const results = await db_1.prisma.query1.findMany({
            where: {
                poot_b: {
                    contains: String(poot)
                }
            },
            orderBy: { numero_item: 'asc' }
        });
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al buscar datos' });
    }
};
exports.searchByPoot = searchByPoot;
// Buscar datos por equipo
const searchByEquipo = async (req, res) => {
    try {
        const { equipo } = req.query;
        if (!equipo) {
            res.status(400).json({ message: 'Parámetro equipo requerido' });
            return;
        }
        const results = await db_1.prisma.query1.findMany({
            where: {
                equipo: {
                    contains: String(equipo)
                }
            },
            orderBy: { fecha: 'desc' },
            take: 50
        });
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al buscar datos' });
    }
};
exports.searchByEquipo = searchByEquipo;
// Obtener estadísticas de datos importados
const getImportStats = async (req, res) => {
    try {
        const total = await db_1.prisma.query1.count();
        const lastImport = await db_1.prisma.query1.findFirst({
            orderBy: { created_at: 'desc' },
            select: { created_at: true }
        });
        res.json({
            total_records: total,
            last_import: lastImport?.created_at || null,
            status: total > 0 ? 'active' : 'empty'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};
exports.getImportStats = getImportStats;
