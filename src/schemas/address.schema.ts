import { z } from 'zod';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';
import { ADDRESS_CONFIG } from '~/config/enums/address';

export const addressSchema = z.object({
  id: objectIdSchema,
  user: objectIdSchema,
  full_name: z.string().max(ADDRESS_CONFIG.MAX_CHAR_FULL_NAME),
  address1: z.string().max(ADDRESS_CONFIG.MAX_CHAR_ADDRESS),
  address2: z.string().max(ADDRESS_CONFIG.MAX_CHAR_ADDRESS).optional(),
  city: z.string().max(ADDRESS_CONFIG.MAX_CHAR_CITY),
  country: z.string(),
  state: z.string(),
  zip: z.string().max(ADDRESS_CONFIG.MAX_CHAR_ZIP),
  phone: z.string().max(ADDRESS_CONFIG.MAX_CHAR_PHONE),
  is_primary: z.boolean().optional(),
});
