import { Router } from 'express';
import { createOrderController, getOrders, getOrderById } from '../controllers/order.controller'; // Importa la nueva función

const router = Router();

router.post('/', createOrderController);
router.get('/', getOrders); 
router.get('/:id', getOrderById); // <--- NUEVA RUTA GET

export default router;