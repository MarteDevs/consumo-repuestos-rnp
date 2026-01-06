import { Router } from 'express';
import { getPersonnel,
    createPersonnel, 
  updatePersonnel, 
  deletePersonnel

} from '../controllers/personnel.controller';

const router = Router();

router.get('/', getPersonnel);
router.post('/', createPersonnel);      // Crear nuevo
router.put('/:id', updatePersonnel);    // Actualizar existente
router.delete('/:id', deletePersonnel); // Eliminar (Desactivar)

export default router;