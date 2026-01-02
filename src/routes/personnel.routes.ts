import { Router } from 'express';
import { getPersonnel } from '../controllers/personnel.controller';

const router = Router();

router.get('/', getPersonnel);

export default router;