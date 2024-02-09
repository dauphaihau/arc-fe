import { z } from 'zod';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';

export const attributeSchema = z.object({
  id: objectIdSchema,
  category: objectIdSchema,
  name: z.string(),
  options: z.array(z.string()).optional(),
});
