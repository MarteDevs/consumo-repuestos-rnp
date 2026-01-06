import { Router } from 'express';
import { getEquipments,
    createEquipment, 
    updateEquipment, 
    deleteEquipment
 } from '../controllers/equipment.controller';
const router = Router();

router.get('/', getEquipments);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

export default router;