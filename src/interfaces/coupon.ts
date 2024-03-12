import { z } from 'zod';
import { couponSchema } from '~/schemas/coupon.schema';
import type { Override } from '~/interfaces/utils';
import type { RequestGetListParams } from '~/interfaces/common';

export type ICoupon = z.infer<typeof couponSchema>;

export type CreateCouponPayload =
  Override<Omit<ICoupon, 'id' | 'shop' | 'uses_count'>,
    Partial<Pick<ICoupon, 'is_active'>>>

export type GetCouponsParams = Partial<Pick<ICoupon, 'code' | 'title' | 'is_auto_sale'> & RequestGetListParams>
