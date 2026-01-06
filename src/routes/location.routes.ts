import { Router } from 'express';
import { getLocations,
    createLocation,
    updateLocation,
    deleteLocation 
} from '../controllers/location.controller';

const router = Router();

router.get('/', getLocations);
router.post('/', createLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

export default router;