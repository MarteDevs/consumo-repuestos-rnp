"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrands = exports.deleteVariant = exports.upsertVariant = exports.createProduct = exports.getCatalog = exports.getProducts = void 0;
const db_1 = __importDefault(require("../config/db"));
const product_schema_1 = require("../schemas/product.schema");
// ENDPOINT PARA BÚSQUEDA DE PRODUCTOS (usado en crear órdenes)
const getProducts = async (req, res) => {
    try {
        const { search } = req.query; // Leemos ?search=perno de la URL
        const products = await db_1.default.product_variants.findMany({
            where: {
                is_active: true,
                // Buscamos dentro de la relación con el catálogo
                product_catalog: {
                    name: {
                        contains: search ? String(search) : undefined, // Filtro tipo "LIKE"
                        // mode: 'insensitive' // (Nota: en MySQL la búsqueda suele ser insensible por defecto)
                    }
                }
            },
            include: {
                product_catalog: true, // Traemos el nombre (Ej: Perno Sujetador)
                brands: true // Traemos la marca (Ej: RNP)
            },
            take: 20 // Limitamos a 20 resultados para no saturar
        });
        // Formateamos la respuesta para que sea fácil de leer en el Frontend
        const formatted = products.map(p => ({
            id: p.id,
            full_name: `${p.product_catalog.name} - ${p.brands.name}`, // Ej: "Perno Sujetador - RNP"
            price: p.unit_price,
            currency: p.currency
        }));
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al buscar productos' });
    }
};
exports.getProducts = getProducts;
// ENDPOINT PARA LISTAR CATÁLOGO COMPLETO (usado en gestión de inventario)
const getCatalog = async (req, res) => {
    try {
        const { search, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;
        const where = search ? {
            OR: [
                { name: { contains: String(search) } },
                { part_number: { contains: String(search) } }
            ]
        } : undefined;
        // Contar total de registros
        const total = await db_1.default.product_catalog.count({ where });
        // Obtener registros paginados
        const catalog = await db_1.default.product_catalog.findMany({
            where,
            include: {
                product_variants: {
                    where: { is_active: true },
                    include: {
                        brands: true
                    }
                }
            },
            orderBy: { name: 'asc' },
            skip,
            take: limitNum
        });
        res.json({
            data: catalog,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al cargar catálogo' });
    }
};
exports.getCatalog = getCatalog;
// 2. CREAR PRODUCTO BASE (CATÁLOGO)
const createProduct = async (req, res) => {
    try {
        const data = product_schema_1.CreateProductSchema.parse(req.body);
        // Verificar si ya existe ese número de parte
        const existing = await db_1.default.product_catalog.findFirst({
            where: { part_number: data.part_number }
        });
        if (existing) {
            res.status(400).json({ message: 'Ya existe un producto con ese N° de Parte' });
            return;
        }
        const newProduct = await db_1.default.product_catalog.create({
            data: {
                name: data.name.toUpperCase(),
                part_number: data.part_number,
                unit_of_measure: data.unit_of_measure
            }
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        res.status(400).json({ message: error.errors?.[0]?.message || 'Error al crear producto' });
    }
};
exports.createProduct = createProduct;
// 3. AGREGAR O ACTUALIZAR PRECIO (POR MARCA)
const upsertVariant = async (req, res) => {
    try {
        const data = product_schema_1.ProductVariantSchema.parse(req.body);
        // Buscamos si ya existe este producto con esta marca
        const existingVariant = await db_1.default.product_variants.findFirst({
            where: {
                catalog_id: data.catalog_id,
                brand_id: data.brand_id
            }
        });
        let result;
        if (existingVariant) {
            // SI YA EXISTE: Actualizamos el precio
            result = await db_1.default.product_variants.update({
                where: { id: existingVariant.id },
                data: {
                    unit_price: data.unit_price,
                    currency: data.currency,
                    is_active: true // Si estaba borrado, lo revivimos
                }
            });
        }
        else {
            // SI NO EXISTE: Creamos la nueva variante
            result = await db_1.default.product_variants.create({
                data: {
                    catalog_id: data.catalog_id,
                    brand_id: data.brand_id,
                    unit_price: data.unit_price,
                    currency: data.currency
                }
            });
        }
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.errors?.[0]?.message || 'Error gestionando precio' });
    }
};
exports.upsertVariant = upsertVariant;
// 4. ELIMINAR VARIANTE (LÓGICO)
// Esto es para decir: "Ya no vendemos este perno en marca CAT", pero mantenemos el historial
const deleteVariant = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.default.product_variants.update({
            where: { id: Number(id) },
            data: { is_active: false }
        });
        res.json({ message: 'Precio desactivado correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar precio' });
    }
};
exports.deleteVariant = deleteVariant;
// 5. OBTENER MARCAS (Para llenar el select en el frontend)
const getBrands = async (req, res) => {
    try {
        const brands = await db_1.default.brands.findMany({ orderBy: { name: 'asc' } });
        res.json(brands);
    }
    catch (error) {
        res.status(500).json({ message: 'Error cargando marcas' });
    }
};
exports.getBrands = getBrands;
