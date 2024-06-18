import type { z } from 'zod';
import type { shopSchema } from '~/schemas/shop.schema';

export type IShop = z.infer<typeof shopSchema>;
