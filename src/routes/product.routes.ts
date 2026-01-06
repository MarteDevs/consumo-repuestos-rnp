import { Router } from 'express';
import { getProducts,
    getCatalog,
    createProduct, 
  upsertVariant, 
  deleteVariant,
  getBrands
 } from '../controllers/product.controller';
const router = Router();
router.get('/', getProducts);          // Búsqueda de productos (para órdenes)
router.get('/catalog', getCatalog);    // Catálogo completo (para inventario)
router.post('/', createProduct);       // Crear nombre/código nuevo

// Rutas de Precios/Variantes
router.post('/variant', upsertVariant);       // Agregar precio a una marca
router.delete('/variant/:id', deleteVariant); // Borrar un precio específico

// Auxiliar
router.get('/brands', getBrands);      // Obtener lista de marcas
export default router;