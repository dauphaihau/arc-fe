import { z } from 'zod';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';
import { CART_CONFIG } from '~/config/enums/cart';
import { couponSchema } from '~/schemas/coupon.schema';
import { COUPON_CONFIG } from '~/config/enums/coupon';
import { PRODUCT_CONFIG } from '~/config/enums/product';

export const cartProductSchema = z.object({
  id: objectIdSchema,
  inventory: objectIdSchema,
  variant: objectIdSchema.optional(),
  quantity: z.number().max(PRODUCT_CONFIG.MAX_STOCK),
  is_select_order: z
    .boolean()
    .default(true)
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const cartItemSchema = z.object({
  id: objectIdSchema,
  shop: objectIdSchema,
  products: z.array(cartProductSchema),
  coupon_codes: z
    .array(couponSchema.shape.code)
    .max(COUPON_CONFIG.MAX_USE_PER_ORDER)
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const cartSchema = z.object({
  id: objectIdSchema,
  user: objectIdSchema,
  items: z
    .array(cartItemSchema)
    .max(CART_CONFIG.MAX_ITEMS),
  createdAt: z.date(),
  updatedAt: z.date(),
});
