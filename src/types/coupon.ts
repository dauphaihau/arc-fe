import type { z } from 'zod';
import type { couponSchema, createPromoCodeBodySchema, createSaleBodySchema } from '~/schemas/coupon.schema';
import type { RequestGetListParams } from '~/types/common';

export type Coupon = z.infer<typeof couponSchema>;

export type CreateSaleBody = z.infer<typeof createSaleBodySchema>;

export type CreatePromoCodeBody = z.infer<typeof createPromoCodeBodySchema>;

export type GetCouponsParams = Partial<Pick<Coupon, 'code' | 'is_auto_sale'> & RequestGetListParams>;
