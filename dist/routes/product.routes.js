"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const router = (0, express_1.Router)();
router.get('/', product_controller_1.getProducts); // Búsqueda de productos (para órdenes)
router.get('/catalog', product_controller_1.getCatalog); // Catálogo completo (para inventario)
router.post('/', product_controller_1.createProduct); // Crear nombre/código nuevo
// Rutas de Precios/Variantes
router.post('/variant', product_controller_1.upsertVariant); // Agregar precio a una marca
router.delete('/variant/:id', product_controller_1.deleteVariant); // Borrar un precio específico
// Auxiliar
router.get('/brands', product_controller_1.getBrands); // Obtener lista de marcas
exports.default = router;
