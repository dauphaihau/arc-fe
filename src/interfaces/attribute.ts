import type { z } from 'zod';
import type { attributeSchema } from '~/schemas/attribute.schema';

export type IAttribute = z.infer<typeof attributeSchema>;
