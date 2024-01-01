import { z } from 'zod';
import { userSchema } from '~/schemas/user.schema';

export type IUser = z.infer<typeof userSchema>;

export type LoginPayloadType = Pick<IUser, 'email' | 'password'>;

export type RegisterPayloadType = Pick<IUser, 'email' | 'password' | 'name'>;
