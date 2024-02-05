import { z } from 'zod';
import { PAYMENT_TYPES, ORDER_STATUSES } from '~/config/enums/order';
import { COUPON_CONFIG } from '~/config/enums/coupon';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';
import { couponSchema } from '~/schemas/coupon.schema';

export const lineItemSchema = z.object({
  shop: objectIdSchema,
  coupon_codes: z
    .array(couponSchema.shape.code)
    .min(1)
    .max(COUPON_CONFIG.MAX_USE_PER_ORDER)
    .optional(),
  products: z
    .array(z.object({
      inventory: objectIdSchema,
      quantity: z.number(),
    }))
    .min(1)
    .max(20),
});

export const shopCodesSchema = z.object({
  shop: objectIdSchema,
  coupon_codes: z
    .array(couponSchema.shape.code)
    .min(1)
    .max(COUPON_CONFIG.MAX_USE_PER_ORDER)
    .optional(),
});

export const orderSchema = z.object({
  id: objectIdSchema,
  user: objectIdSchema,
  address: objectIdSchema,
  payment_type: z.nativeEnum(PAYMENT_TYPES),
  lines: z
    .array(lineItemSchema.or(z.any()))
    .min(1)
    .max(20),
  tracking_number: z.string(),
  stripe_charge_id: z.string(),
  currency: z.string().max(3),
  status: z.nativeEnum(ORDER_STATUSES),
  subtotal: z.number(),
  shipping_fee: z.number(),
  total_discount: z.number(),
  total: z.number(),
});
