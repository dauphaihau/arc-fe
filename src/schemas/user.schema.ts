import { z } from 'zod';
import { USER_REG_NAME, USER_REG_PASSWORD } from '~/config/enums/user';

export const userSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'invalid type name',
    })
    .trim()
    .regex(USER_REG_NAME, 'Name is invalid')
    .min(3, 'Name must be at least 3 characters')
    .max(60, 'Name must be no longer than 60 characters'),
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'invalid type email',
    })
    .trim()
    .min(6, 'Email must be at least 6 characters')
    .max(254, 'Email must be no longer than 254 characters')
    .email('invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(USER_REG_PASSWORD, 'Password must contain at least 1 lower letter, 1 uppercase letter, 1 number and 1 special character'),
  is_email_verified: z
    .boolean()
    .optional(),
});
