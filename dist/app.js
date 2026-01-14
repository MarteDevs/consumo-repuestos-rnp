"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const equipment_routes_1 = __importDefault(require("./routes/equipment.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const personnel_routes_1 = __importDefault(require("./routes/personnel.routes"));
const location_routes_1 = __importDefault(require("./routes/location.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const import_routes_1 = __importDefault(require("./routes/import.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// --- Middlewares ---
app.use((0, cors_1.default)()); // Permite que tu Frontend (Vue/React) se conecte
app.use(express_1.default.json()); // Permite leer JSON en el body
// --- Rutas ---
// Aquí decimos: "Todo lo que empiece por /api/orders, manéjalo con orderRoutes"
app.use('/api/orders', order_routes_1.default);
app.use('/api/equipments', equipment_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/personnel', personnel_routes_1.default);
app.use('/api/locations', location_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
app.use('/api/import', import_routes_1.default);
// Ruta de salud (para ver si vive)
app.get('/health', (_req, _res) => {
    console.log('Health check requested');
    _res.status(200).send('OK');
});
// --- Arrancar Servidor ---
app.listen(PORT, () => {
    console.log(`✅ Servidor Ormasan corriendo en http://localhost:${PORT}`);
});
