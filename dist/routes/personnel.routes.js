"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const personnel_controller_1 = require("../controllers/personnel.controller");
const router = (0, express_1.Router)();
router.get('/', personnel_controller_1.getPersonnel);
router.post('/', personnel_controller_1.createPersonnel); // Crear nuevo
router.put('/:id', personnel_controller_1.updatePersonnel); // Actualizar existente
router.delete('/:id', personnel_controller_1.deletePersonnel); // Eliminar (Desactivar)
exports.default = router;
