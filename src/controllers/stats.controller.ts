import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Definir rangos de fecha (Mes Actual)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. KPI: Gasto Total del Mes Actual (SQL Directo para eficiencia)
    const currentMonthExpense: any[] = await prisma.$queryRaw`
      SELECT SUM(cd.total_line_cost) as total
      FROM maintenance_orders o
      JOIN consumption_details cd ON o.id = cd.order_id
      WHERE o.order_date >= ${firstDayOfMonth}
    `;

    // 2. KPI: Cantidad de Órdenes del Mes
    const currentMonthCount = await prisma.maintenance_orders.count({
      where: { order_date: { gte: firstDayOfMonth } }
    });

    // 3. GRÁFICO 1: Gasto por los últimos 6 meses
    // Truco: Agrupamos por Año-Mes
    const expensesByMonth: any[] = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(o.order_date, '%Y-%m') as month, 
        SUM(cd.total_line_cost) as total
      FROM maintenance_orders o
      JOIN consumption_details cd ON o.id = cd.order_id
      WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
      ORDER BY month ASC
    `;

    // 4. GRÁFICO 2: Top 5 Equipos más costosos (Histórico)
    const topExpensiveEquipments: any[] = await prisma.$queryRaw`
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
    `;

    // 5. GRÁFICO 3: Preventivo vs Correctivo
    const maintenanceTypeDistribution = await prisma.maintenance_orders.groupBy({
      by: ['maintenance_type'],
      _count: {
        id: true
      }
    });

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