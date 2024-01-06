import { z } from 'zod';
import { shopSchema } from '~/schemas/shop.schema';

export type IShop = z.infer<typeof shopSchema>;

export type CreateShopPayload = Pick<IShop, 'user_id' | 'shop_name'>;
