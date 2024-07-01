import type { z } from 'zod';
import type { orderSchema } from '~/schemas/order.schema';
import type { Product, ProductInventory } from '~/types/product';
import type { Coupon } from '~/types/coupon';
import type { MARKET_CURRENCIES } from '~/config/enums/market';
import type { Override } from '~/types/utils';
import type { Shop } from '~/types/shop';
import type { orderShopSchema, orderShopSchemaProductSchema } from '~/schemas/order-shop.schema';

export type Order = z.infer<typeof orderSchema>;
export type OrderShop = z.infer<typeof orderShopSchema>;
export type OrderShopProduct = z.infer<typeof orderShopSchemaProductSchema>;

export type SummaryOrder = Record<'subTotalPrice' |
  'subTotalAppliedDiscountPrice' |
  'shippingFee' |
  'totalDiscount' |
  'totalPrice' |
  'totalProducts', number>;

export type AdditionInfoItem = Pick<OrderShop, 'shop' | 'coupon_codes' | 'note'>;

export type CreateOrderFromCartBody = {
  additionInfoItems?: AdditionInfoItem[]
  currency?: MARKET_CURRENCIES
} & Pick<Order, 'address' | 'payment_type'>;

export type CreateOrderForBuyNowBody = {
  inventory: ProductInventory['id']
  quantity: number
  coupon_codes: AdditionInfoItem['coupon_codes']
  note: AdditionInfoItem['note']
  currency?: MARKET_CURRENCIES
} & Pick<Order, 'address' | 'payment_type'>;

export type ResponseCreateOrder = {
  checkoutSessionUrl: string
  orderShops: Override<OrderShop, {
    shop: Pick<Shop, 'shop_name'>
  }>[]
};

export type GetSummaryOderBody = {
  quantity: number
  inventory: ProductInventory['id']
  coupon_codes?: Coupon['code'][]
};

export type ResponseGetOrderShopsByCheckoutSession = {
  orderShops: Override<OrderShop, {
    shop: Pick<Shop, 'shop_name'>
  }>[]
};

export type ResponseGetOrderShops = {
  orderShop: Override<OrderShop, {
    shop: Pick<Shop, 'id' | 'shop_name'>
    products: Override<OrderShopProduct, {
      product: Pick<Product, 'shipping' | 'id'>
    }>[]
  }> & {
    estimated_delivery?: Date
    from_countries?: string[]
  }
};
