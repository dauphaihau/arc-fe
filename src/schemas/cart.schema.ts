import { z } from 'zod';
import { productVariantOptSchema, productSchema } from '~/schemas/product.schema';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';
import { shopSchema } from '~/schemas/shop.schema';

export const productCartSchema = z.object({
  product: productSchema,
  product_variant: productVariantOptSchema,
  quantity: productSchema.shape.quantity,
  variant: z.string().optional(),
  is_select_order: z
    .boolean()
    .default(true)
    .optional(),
});

export const itemCartSchema = z.object({
  shop: shopSchema,
  products: z.array(productCartSchema),
});

export const cartSchema = z.object({
  user_id: objectIdSchema,
  count_products: z.number().max(20),
  items: z
    .array(itemCartSchema)
    .max(20),
  products: z
    .array(productCartSchema)
    .max(20),
});
