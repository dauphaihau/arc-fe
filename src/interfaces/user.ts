import { z } from 'zod';
import { userSchema } from '~/schemas/user.schema';

export type IUser = z.infer<typeof userSchema>;

export type LoginBody = Pick<IUser, 'email' | 'password'>;

export type RegisterBody = Pick<IUser, 'email' | 'password' | 'name'>;
