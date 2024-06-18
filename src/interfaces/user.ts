import type { z } from 'zod';
import type { userSchema } from '~/schemas/user.schema';
import type { Override } from '~/interfaces/utils';
import type { IShop } from '~/interfaces/shop';

export type IUser = z.infer<typeof userSchema>;

export type IUserPopulated = Override<IUser, {
  shop?: IShop
}>;

export type LoginBody = Pick<IUser, 'email' | 'password'>;

export type RegisterBody = Pick<IUser, 'email' | 'password' | 'name' | 'market_preferences'>;

export type UpdateUserBody = Partial<Pick<IUser, 'name' | 'email' | 'password' | 'market_preferences'>>;
