import type { z } from 'zod';
import type {
  Product, ProductImage,
  ProductInventory,
  ProductVariant
} from './product';
import type { Override } from './utils';
import type { cartSchema, cartItemSchema, cartProductSchema } from '~/schemas/cart.schema';
import type { Coupon } from '~/types/coupon';
import type { Shop } from '~/types/shop';
import type { AdditionInfoItem, SummaryOrder } from '~/types/order';
import type { UserAddress } from '~/types/user-address';

export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CartProduct = z.infer<typeof cartProductSchema>;

export type AddCartProduct = Pick<CartProduct, 'quantity'> & {
  inventory: ProductInventory['id']
  variant?: ProductVariant['id']
};

export type UpdateCartProductBody = Partial<Pick<CartProduct, 'quantity' | 'is_select_order'>> & {
  inventory: ProductInventory['id']
  variant?: ProductVariant['id']
  additionInfoItems?: AdditionInfoItem[]
};

export type UpdateCouponsItem = {
  shop: Shop['id']
  coupon_codes: Coupon['code'][]
};

export type ProductCartPopulated = Override<CartProduct, {
  variant: Pick<ProductVariant, 'variant_name'>
  inventory: ProductInventory & {
    product: Product
  }
}>;

export type ItemCartPopulated = Override<CartItem, {
  shop: Shop
  products: ProductCartPopulated[]
}>;

export type ResponseGetCart = {
  cart: Override<Cart, {
    items: ItemCartPopulated[]
  }>
  summaryOrder: SummaryOrder
  totalProducts: number
  address: UserAddress
};

export type ResponseGetProductsRecentlyAdded = {
  cart: {
    products: {
      product: {
        _id: Product['id']
        title: Product['title']
        image: Pick<ProductImage, 'relative_url'>
      }
      inventory: {
        variant: string
      }
    }[]
    restProducts: number
  }
};
