import { z } from 'zod';
import { PRODUCT_CONFIG } from '~/config/enums/product';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';

export const productInventorySchema = z.object({
  id: objectIdSchema,
  shop: objectIdSchema,
  product: objectIdSchema,
  price: z
    .number()
    .min(0.2, 'Price must at least 0.2$')
    .max(PRODUCT_CONFIG.MAX_PRICE,
      `Price must be less than or equal to ${PRODUCT_CONFIG.MAX_PRICE}$`),
  stock: z
    .number()
    .min(0)
    .max(PRODUCT_CONFIG.MAX_QUANTITY),
  sku: z
    .string()
    .max(PRODUCT_CONFIG.MAX_CHAR_SKU)
    .optional(),
  variant: z.string().optional(),
  reservations: z.array(z.any()),
});
