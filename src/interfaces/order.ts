import { z } from 'zod';
import { shopCodesSchema, orderSchema } from '~/schemas/order.schema';

export type IOrder = z.infer<typeof orderSchema>;
export type IShopCodes = z.infer<typeof shopCodesSchema>;

export type ITempOrder = Record<'subTotalPrice' |
  'subTotalAppliedDiscountPrice' |
  'shippingFee' |
  'totalDiscount' |
  'totalPrice' |
  'totalProducts', number>

export type CreateOrderPayload =
  Pick<IOrder, 'address' | 'payment_type'> & {
  shops_codes?: IShopCodes[]
}
