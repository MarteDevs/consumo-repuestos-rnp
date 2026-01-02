import { Request, Response } from 'express';
import prisma from '../config/db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query; // Leemos ?search=perno de la URL

    const products = await prisma.product_variants.findMany({
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
        brands: true    // Traemos la marca (Ej: RNP)
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
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar productos' });
  }
};