import { Router } from 'express';
import { getEquipments } from '../controllers/equipment.controller';
const router = Router();
router.get('/', getEquipments);
export default router;