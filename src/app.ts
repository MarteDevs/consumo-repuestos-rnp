import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/order.routes';
import equipmentRoutes from './routes/equipment.routes';
import productRoutes from './routes/product.routes';
import personnelRoutes from './routes/personnel.routes';
import locationRoutes from './routes/location.routes';
import statsRoutes from './routes/stats.routes';

import prisma from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors()); // Permite que tu Frontend (Vue/React) se conecte
app.use(express.json()); // Permite leer JSON en el body

// --- Rutas ---
// Aquí decimos: "Todo lo que empiece por /api/orders, manéjalo con orderRoutes"
app.use('/api/orders', orderRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/stats', statsRoutes);

// Ruta de salud (para ver si vive)
app.get('/health', (_req, _res) => {
  console.log('Health check requested');
  _res.status(200).send('OK');
});

// --- Arrancar Servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor Ormasan corriendo en http://localhost:${PORT}`);
});