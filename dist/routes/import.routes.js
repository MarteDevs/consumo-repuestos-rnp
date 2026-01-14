"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const import_controller_1 = require("../controllers/import.controller");
const router = (0, express_1.Router)();
// POST /api/import/excel - Importar datos desde Excel (archivo existente)
router.post('/excel', import_controller_1.importExcelData);
// POST /api/import/upload - Subir y procesar archivo Excel desde frontend
router.post('/upload', import_controller_1.upload.single('file'), import_controller_1.importExcelData);
// GET /api/import/search/poot?poot=23887 - Buscar por POOT
router.get('/search/poot', import_controller_1.searchByPoot);
// GET /api/import/search/equipo?equipo=RNP - Buscar por equipo
router.get('/search/equipo', import_controller_1.searchByEquipo);
// GET /api/import/stats - Obtener estadísticas de importación
router.get('/stats', import_controller_1.getImportStats);
exports.default = router;
