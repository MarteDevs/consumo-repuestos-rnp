import { Router } from 'express';
import { 
  importExcelData, 
  searchByPoot, 
  searchByEquipo, 
  getImportStats,
  upload
} from '../controllers/import.controller';

const router = Router();

// POST /api/import/excel - Importar datos desde Excel (archivo existente)
router.post('/excel', importExcelData);

// POST /api/import/upload - Subir y procesar archivo Excel desde frontend
router.post('/upload', upload.single('file'), importExcelData);

// GET /api/import/search/poot?poot=23887 - Buscar por POOT
router.get('/search/poot', searchByPoot);

// GET /api/import/search/equipo?equipo=RNP - Buscar por equipo
router.get('/search/equipo', searchByEquipo);

// GET /api/import/stats - Obtener estadísticas de importación
router.get('/stats', getImportStats);

export default router;
