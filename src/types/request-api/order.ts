import type { MARKET_CURRENCIES } from '~/config/enums/market';
import type { Shop } from '~/types/shop';
import type { Order, OrderShopProduct } from '~/types/order';
import type { UserAddress } from '~/types/user-address';
import type { Coupon } from '~/types/coupon';
import type { Override } from '~/types/utils';
import type { Product, ProductInventory } from '~/types/product';
import type { Payment } from '~/types/payment';
import type { Cart } from '~/types/cart';

// region get order shops
export type ResponseGetOrderShopsProduct = Override<OrderShopProduct, {
  product: Pick<Product, 'shipping' | 'id'> & {
    variant_group_name?: string
    variant_sub_group_name?: string
  }
  inventory: Pick<ProductInventory, 'variant'>
  percent_coupon: Pick<Coupon, 'percent_off'> | null
  // freeship_coupon: Pick<Coupon, ''> | null
}>;

type Shipping = {
  shipping_status: Order['shipping_status']
  updated_at: Order['updated_at']
  to_country: string
  from_countries: string[]
  estimated_delivery: Date
};

type ResponseGetOrderShopsOrderShop = {
  shop: Pick<Shop, 'id' | 'shop_name'>
  payment: Pick<Payment, 'type' | 'card_funding' | 'card_last4' | 'card_brand'>
  products: ResponseGetOrderShopsProduct[]
  promo_coupons: Pick<Coupon, 'id' | 'code'>[]
  shipping: Shipping
} & Pick<Order, 'id' | 'subtotal' | 'total_shipping_fee' | 'total' | 'total_discount' | 'note' | 'created_at'>;

export type ResponseGetOrderShops = {
  order_shops: ResponseGetOrderShopsOrderShop[]
};
// endregion

export type CreateOrderFromCartBody = {
  currency?: MARKET_CURRENCIES
  payment_type: Order['payment_type']
  user_address_id: UserAddress['id']
  addition_info_shop_carts?: {
    shop_id: Shop['id']
    promo_codes: Coupon['code'][]
    note: Order['note']
  }[]
};

export type CreateOrderForBuyNowBody = {
  cart_id: Cart['id']
  promo_codes: Coupon['code'][]
  note: string
  payment_type: Payment['type']
  user_address_id: UserAddress['id']
  currency?: MARKET_CURRENCIES
};

export type ResponseCreateOrder = {
  checkout_session_url: string
  order_shops: {
    id: Order['id']
    shop: Pick<Shop, 'id' | 'shop_name'>
  }[]
};

export type ResponseGetOrderShopsByCheckoutSession = {
  order_shops: {
    shop: Pick<Shop, 'shop_name'>
  }[]
};
