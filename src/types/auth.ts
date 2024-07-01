import type { User } from '~/types/user';
import type { Shop } from '~/types/shop';

export type UserAuthenticated = Pick<User, 'name' | 'email' | 'is_email_verified' | 'market_preferences'> & {
  shop?: Pick<Shop, 'shop_name' | 'id'>
};

export type LoginBody = Pick<User, 'email' | 'password'>;

export type RegisterBody = Pick<User, 'email' | 'password' | 'name' | 'market_preferences'>;

export type ResetPasswordBody = Record<'password' | 'passwordConfirm', string>;
