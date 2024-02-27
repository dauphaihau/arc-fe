import { z } from 'zod';
import { addressSchema } from '~/schemas/address.schema';

export type IAddress = z.infer<typeof addressSchema>;

export type CreateBodyAddress = Omit<IAddress, 'id'>;

export type ResponseGetCountries = {
  data: { name: string }[]
}

export type ResponseGetStatesByCountry = {
  data: {
    states: {
      name: string
    }[]
  }
}
