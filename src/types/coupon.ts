import type { z } from 'zod';
import type { couponSchema } from '~/schemas/coupon.schema';
import type { Override } from '~/types/utils';
import type { RequestGetListParams } from '~/types/common';

export type Coupon = z.infer<typeof couponSchema>;

export type CreateCouponBody =
  Override<Omit<Coupon, 'id' | 'shop' | 'uses_count' | 'createdAt' | 'updatedAt'>,
    Partial<Pick<Coupon, 'is_active'>>>;

export type GetCouponsParams = Partial<Pick<Coupon, 'code' | 'title' | 'is_auto_sale'> & RequestGetListParams>;
