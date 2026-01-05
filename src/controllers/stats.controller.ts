import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Ejecutar todas las queries en paralelo para optimizar el uso del pool
    const [
      currentMonthExpense,
      currentMonthCount,
      expensesByMonth,
      topExpensiveEquipments,
      maintenanceTypeDistribution
    ] = await Promise.all([
      // 1. KPI: Gasto Total del Mes Actual
      prisma.$queryRaw<any[]>`
        SELECT SUM(cd.total_line_cost) as total
        FROM maintenance_orders o
        JOIN consumption_details cd ON o.id = cd.order_id
        WHERE o.order_date >= ${firstDayOfMonth}
      `,
      
      // 2. KPI: Cantidad de Órdenes del Mes
      prisma.maintenance_orders.count({
        where: { order_date: { gte: firstDayOfMonth } }
      }),
      
      // 3. GRÁFICO 1: Gasto por los últimos 6 meses
      prisma.$queryRaw<any[]>`
        SELECT 
          DATE_FORMAT(o.order_date, '%Y-%m') as month, 
          SUM(cd.total_line_cost) as total
        FROM maintenance_orders o
        JOIN consumption_details cd ON o.id = cd.order_id
        WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
        ORDER BY month ASC
      `,
      
      // 4. GRÁFICO 2: Top 5 Equipos más costosos
      prisma.$queryRaw<any[]>`
        SELECT 
          e.internal_code, 
          e.model,
          SUM(cd.total_line_cost) as total
        FROM maintenance_orders o
        JOIN consumption_details cd ON o.id = cd.order_id
        JOIN equipment e ON o.equipment_id = e.id
        GROUP BY e.id
        ORDER BY total DESC
        LIMIT 5
      `,
      
      // 5. GRÁFICO 3: Preventivo vs Correctivo
      prisma.maintenance_orders.groupBy({
        by: ['maintenance_type'],
        _count: { id: true }
      })
    ]);

    // Armamos la respuesta final
    res.json({
      kpi: {
        current_month_total: currentMonthExpense[0].total || 0,
        current_month_count: currentMonthCount
      },
      charts: {
        expenses_by_month: expensesByMonth,
        top_equipments: topExpensiveEquipments,
        maintenance_types: maintenanceTypeDistribution
      }
    });

  } catch (error) {
    console.error("Error en estadísticas:", error);
    res.status(500).json({ message: 'Error al calcular estadísticas' });
  }
};