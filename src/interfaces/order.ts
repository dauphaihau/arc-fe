import { z } from 'zod';
import { lineItemSchema, orderSchema } from '~/schemas/order.schema';
import type { IProductInventory } from '~/interfaces/product';
import type { ICoupon } from '~/interfaces/coupon';

export type IOrder = z.infer<typeof orderSchema>;
export type ILineItemOrder = z.infer<typeof lineItemSchema>;

export type ISummaryOrder = Record<'subTotalPrice' |
  'subTotalAppliedDiscountPrice' |
  'shippingFee' |
  'totalDiscount' |
  'totalPrice' |
  'totalProducts', number>


export type IAdditionInfoItem = Pick<ILineItemOrder, 'shop' | 'coupon_codes' | 'note'>

export type CreateOrderFromCartBody =
  Pick<IOrder, 'address' | 'payment_type'> & {
  additionInfoItems?: IAdditionInfoItem[]
}

export type CreateOrderForBuyNowBody =
  Pick<IOrder, 'address' | 'payment_type'> & {
  inventory: IProductInventory['id']
  quantity: number
  coupon_codes: IAdditionInfoItem['coupon_codes']
  note: IAdditionInfoItem['note']
}

export type GetSummaryOderBody = {
  quantity: number
  inventory: IProductInventory['id']
  coupon_codes?: ICoupon['code'][]
}