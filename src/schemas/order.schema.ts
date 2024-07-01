import { z } from 'zod';
import { PAYMENT_TYPES, ORDER_STATUSES } from '~/config/enums/order';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';

export const orderSchema = z.object({
  id: objectIdSchema,
  user: objectIdSchema,
  address: objectIdSchema,
  payment_type: z.nativeEnum(PAYMENT_TYPES),
  tracking_number: z.string(),
  stripe_charge_id: z.string(),
  currency: z.string().max(3),
  status: z.nativeEnum(ORDER_STATUSES),
  subtotal: z.number(),
  shipping_fee: z.number(),
  total_discount: z.number(),
  total: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
