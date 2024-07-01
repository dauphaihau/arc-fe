import type { z } from 'zod';
import type { userAddressSchema, createUserAddressSchema } from '~/schemas/userAddressSchema';

export type UserAddress = z.infer<typeof userAddressSchema>;

export type CreateBodyUserAddressBody = z.infer<typeof createUserAddressSchema>;

export type ResponseGetCountries = {
  data: { name: string }[]
};

export type ResponseGetStatesByCountry = {
  data: {
    states: {
      name: string
    }[]
  }
};
