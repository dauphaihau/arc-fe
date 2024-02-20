import { z } from 'zod';
import { productInventorySchema } from './product-inventory.schema';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';
import { shopSchema } from '~/schemas/shop.schema';
import { productVariantSchema } from '~/schemas/product.schema';

export const productCartSchema = z.object({
  id: objectIdSchema,
  inventory: productInventorySchema,
  variant: productVariantSchema,
  quantity: productInventorySchema.shape.stock,
  is_select_order: z
    .boolean()
    .default(true)
    .optional(),
});

export const itemCartSchema = z.object({
  id: objectIdSchema,
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
