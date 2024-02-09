import { z } from 'zod';
import { attributeSchema } from '~/schemas/attribute.schema';

export type IAttribute = z.infer<typeof attributeSchema>;
