import { Router } from 'express';
import { createOrderController, getOrders } from '../controllers/order.controller'; // Importa la nueva función

const router = Router();

router.post('/', createOrderController);
router.get('/', getOrders); 

export default router;