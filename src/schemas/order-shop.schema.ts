import { z } from 'zod';
import { cartItemSchema } from '@/schemas/cart.schema';
import { productInventorySchema } from '@/schemas/product-inventory.schema';
import { baseProductSchema } from '@/schemas/product.schema';
import { ORDER_CONFIG, ORDER_SHIPPING_STATUSES } from '@/config/enums/order';
import { objectIdSchema } from '@/schemas/sub/objectId.schema';

export const orderShopSchemaProductSchema = z.object({
  inventory: objectIdSchema,
  product: objectIdSchema,
  price: productInventorySchema.shape.price,
  quantity: z.number(),
  title: baseProductSchema.shape.title,
  image_url: z.string(),
});

export const orderShopSchema = z.object({
  id: objectIdSchema,
  order: objectIdSchema,
  shop: objectIdSchema,
  coupon_codes: cartItemSchema.shape.coupon_codes,
  shipping_status: z.nativeEnum(ORDER_SHIPPING_STATUSES).default(ORDER_SHIPPING_STATUSES.PRE_TRANSIT),
  products: z
    .array(orderShopSchemaProductSchema)
    .min(1)
    .max(20),
  subtotal: z.number(),
  total_discount: z.number(),
  total: z.number(),
  note: z
    .string()
    .max(ORDER_CONFIG.MAX_CHAR_NOTE)
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
