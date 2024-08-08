import { z } from 'zod';
import { PRODUCT_CONFIG } from '~/config/enums/product';
import {
  COUPON_APPLIES_TO,
  COUPON_TYPES,
  COUPON_MIN_ORDER_TYPES,
  COUPON_CONFIG
} from '~/config/enums/coupon';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';

export const couponSchema = z.object({
  id: objectIdSchema,
  shop: objectIdSchema,
  code: z
    .string()
    .min(COUPON_CONFIG.MIN_CHAR_CODE,
      `Please enter a characters between
       ${COUPON_CONFIG.MIN_CHAR_CODE} and ${COUPON_CONFIG.MAX_CHAR_CODE}.`)
    .max(COUPON_CONFIG.MAX_CHAR_CODE,
      `Please enter a characters between
       ${COUPON_CONFIG.MIN_CHAR_CODE} and ${COUPON_CONFIG.MAX_CHAR_CODE}.`),
  type: z
    .nativeEnum(COUPON_TYPES)
    .default(COUPON_TYPES.FIXED_AMOUNT),
  amount_off: z
    .number()
    .min(1, `Please enter a value between 1 and ${PRODUCT_CONFIG.MAX_PRICE - 1}.`)
    .max(PRODUCT_CONFIG.MAX_PRICE - 1,
      `Please enter a value between 1 and ${PRODUCT_CONFIG.MAX_PRICE - 1}.`)
    .optional(),
  percent_off: z
    .number()
    .min(1, 'Please enter a value between 1 and 99.')
    .max(99, 'Please enter a value between 1 and 99.')
    .optional(),
  applies_to: z
    .nativeEnum(COUPON_APPLIES_TO)
    .default(COUPON_APPLIES_TO.ALL)
    .optional(),
  applies_product_ids: z
    .array(objectIdSchema)
    .min(1, 'Add at least 1 product')
    .default([])
    .optional(),
  max_uses_per_user: z
    .number()
    .min(COUPON_CONFIG.MIN_USES_PER_USER,
      `Please enter a value between
       ${COUPON_CONFIG.MIN_USES_PER_USER} and ${COUPON_CONFIG.MAX_USES_PER_USER}.`)
    .max(COUPON_CONFIG.MAX_USES_PER_USER,
      `Please enter a value between
       ${COUPON_CONFIG.MIN_USES_PER_USER} and ${COUPON_CONFIG.MAX_USES_PER_USER}.`),
  max_uses: z
    .number()
    .min(1, `Please enter a value between 1 and ${PRODUCT_CONFIG.MAX_STOCK}.`)
    .max(COUPON_CONFIG.MAX_USES,
      `Please enter a value between 1 and ${COUPON_CONFIG.MAX_USES}.`),
  min_order_type: z
    .nativeEnum(COUPON_MIN_ORDER_TYPES)
    .default(COUPON_MIN_ORDER_TYPES.ORDER_TOTAL),
  min_order_value: z
    .number()
    .default(0)
    .optional(),
  min_products: z
    .number()
    .min(1)
    .optional(),
  start_date: z
    .coerce
    .date(),
  end_date: z
    .coerce
    .date(),
  uses_count: z
    .number()
    .default(0),
  is_active: z
    .boolean()
    .default(false),
  users_used: z
    .array(objectIdSchema)
    .optional(),
  is_auto_sale: z
    .boolean()
    .default(false)
    .optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createPromoCodeBodySchema = couponSchema.omit({
  id: true,
  shop: true,
  users_used: true,
  uses_count: true,
  is_active: true,
  created_at: true,
  updated_at: true,
});

export const createSaleBodySchema = couponSchema.omit({
  id: true,
  shop: true,
  users_used: true,
  uses_count: true,
  is_active: true,
  created_at: true,
  updated_at: true,
}).merge(z.object({
  type: z.union([z.literal(COUPON_TYPES.PERCENTAGE), z.literal(COUPON_TYPES.FREE_SHIP)]),
}));
