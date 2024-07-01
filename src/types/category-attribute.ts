import type { z } from 'zod';
import type { categoryAttributeSchema } from '~/schemas/categoryAttributeSchema';

export type CategoryAttribute = z.infer<typeof categoryAttributeSchema>;
