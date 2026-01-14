"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller"); // Importa la nueva función
const router = (0, express_1.Router)();
router.post('/', order_controller_1.createOrderController);
router.get('/', order_controller_1.getOrders);
router.get('/:id', order_controller_1.getOrderById); // <--- NUEVA RUTA GET
exports.default = router;
