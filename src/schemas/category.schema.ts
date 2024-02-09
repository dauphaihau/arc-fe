import { z } from 'zod';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';
import { CATEGORY_CONFIG } from '~/config/enums/category';

export const categorySchema = z.object({
  id: objectIdSchema,
  parent: objectIdSchema
    .nullable()
    .optional(),
  name: z
    .string()
    .min(1)
    .max(CATEGORY_CONFIG.MAX_CHAR_NAME),
});
