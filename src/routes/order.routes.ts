import { Router } from 'express';
import { createOrderController } from '../controllers/order.controller';

const router = Router();

// Definimos el método POST en la raíz de esta ruta
// La URL final será: http://localhost:3000/api/orders
router.post('/', createOrderController);

export default router;