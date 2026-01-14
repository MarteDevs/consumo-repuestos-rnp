import prisma from '../config/db';
import { CreateOrderDTO } from '../schemas/order.schema';

export const createOrderService = async (data: CreateOrderDTO) => {
  
  // 1. Lógica de Negocio: Validar Horómetros
  if (data.meter_reading_current < data.meter_reading_previous) {
    throw new Error("El horómetro actual no puede ser menor al anterior. Verifica los datos.");
  }

  // 2. Validar que el equipo exista
  const equipment = await prisma.equipment.findUnique({
    where: { id: data.equipment_id }
  });

  if (!equipment) {
    throw new Error(`El equipo con ID ${data.equipment_id} no existe en el sistema.`);
  }

  // 3. Transacción: O se guarda todo, o no se guarda nada (Seguridad de datos)
  const result = await prisma.$transaction(async (tx) => {
    
    // A. Crear la Cabecera (Orden)
    const newOrder = await tx.maintenance_orders.create({
      data: {
        poot_number: data.poot_number,
        order_date: new Date(data.order_date + "T12:00:00"),
        equipment_id: data.equipment_id,
        location_id: data.location_id,
        mechanic_id: data.mechanic_id,
        supervisor_id: data.supervisor_id,
        maintenance_type: data.maintenance_type,
        meter_reading_previous: data.meter_reading_previous,
        meter_reading_current: data.meter_reading_current,
        exchange_rate: 3.80 // TODO: Más adelante podemos conectar esto a una API de tipo de cambio real
      }
    });

    // B. Procesar cada repuesto (Detalle)
    for (const item of data.items) {
      // Buscamos el precio ACTUAL del repuesto en la BD
      const variant = await tx.product_variants.findUnique({
        where: { id: item.variant_id }
      });

      if (!variant) {
        throw new Error(`El repuesto con ID ${item.variant_id} no existe en el catálogo.`);
      }

      // Calculamos el costo total de la línea
      const totalLineCost = Number(variant.unit_price) * item.quantity;

      const lastDetailForItem = await tx.consumption_details.findFirst({
        where: {
          variant_id: item.variant_id,
          maintenance_orders: {
            equipment_id: data.equipment_id
          }
        },
        orderBy: {
          maintenance_orders: {
            order_date: 'desc'
          }
        },
        include: {
          maintenance_orders: true
        }
      });

      const meterReadingPreviousItem = lastDetailForItem?.maintenance_orders.meter_reading_current ?? data.meter_reading_previous;
      const meterReadingCurrentItem = data.meter_reading_current;
      const lifeFeet = Number(meterReadingCurrentItem) - Number(meterReadingPreviousItem ?? 0);

      // Guardamos el detalle CONGELANDO el precio
      await tx.consumption_details.create({
        data: {
          order_id: newOrder.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          recorded_unit_price: variant.unit_price,
          recorded_currency: variant.currency,
          total_line_cost: totalLineCost,
          meter_reading_previous_item: meterReadingPreviousItem,
          meter_reading_current_item: meterReadingCurrentItem,
          life_feet: lifeFeet
        }
      });
    }

    // C. Actualizar el horómetro acumulado del equipo automáticamente
    await tx.equipment.update({
      where: { id: data.equipment_id },
      data: { 
        accumulated_feet: data.meter_reading_current,
        current_location_id: data.location_id // Actualizamos dónde está el equipo
      }
    });

    return newOrder;
  });

  return result;
};
