import type {
  Product, ProductCombineVariant,
  ProductImage,
  ProductInventory, ProductSingleVariant,
  ProductVariant
} from '~/types/product';
import type { Coupon } from '~/types/coupon';
import type { Shop } from '~/types/shop';
import type { Cart, ProductCart } from '~/types/cart';
import type { User } from '~/types/user';

// region get cart
export type ResponseGetCart_ProductCart = Pick<ProductCart, 'quantity' | 'is_select_order'> & {
  price: ProductInventory['price']
  product: Pick<Product, 'id' | 'title' | 'variant_type'> & {
    variant_group_name?: ProductSingleVariant['variant_group_name']
    variant_sub_group_name?: ProductCombineVariant['variant_sub_group_name']
    image: {
      relative_url: ProductImage['relative_url']
    }
  }
  inventory: Pick<ProductInventory, 'id' | 'price' | 'stock' | 'sku' | 'variant'> & {
    sale_price?: ProductInventory['price']
  }
  percent_coupon?: Pick<Coupon, 'id' | 'percent_off' | 'start_date' | 'end_date'>
  freeship_coupon?: Pick<Coupon, 'id' | 'start_date' | 'end_date'>
};

export type ResponseGetCart_ShopCart = {
  shop: Pick<Shop, 'id' | 'shop_name'>
  products: ResponseGetCart_ProductCart[]
  total_price: number
  total_shipping_fee: number
};

export type ResponseGetCart_SummaryOrder = Record<
  'subtotal_price' |
  'total_discount' |
  'subtotal_applies_total_discount' |
  'total_shipping_fee' |
  'total_price' |
  'total_products'
  , number>;

export type ResponseGetCart_ProductCartRecentUpdate = {
  product: Pick<Product, 'id' | 'title'> & {
    image: {
      relative_url: ProductImage['relative_url']
    }
  }
  inventory: Pick<ProductInventory, 'variant'>
  quantity: ProductCart['quantity']
};

export type ResponseGetCart = {
  cart: {
    cart_id: Cart['id']
    user_id: User['id']
    shop_carts: ResponseGetCart_ShopCart[]
    products_recent_update: ResponseGetCart_ProductCartRecentUpdate[]
    summary_cart: {
      total_products: number
    }
  } | null
  summary_order: ResponseGetCart_SummaryOrder
};
// endregion

// region update cart
export type UpdateCartBody = Partial<{
  cart_id: Cart['id']
  inventory_id: ProductInventory['id']
  is_select_order: ResponseGetCart_ProductCart['is_select_order']
  quantity: ResponseGetCart_ProductCart['quantity']
  addition_info_temp_cart: {
    promo_codes: Coupon['code'][]
  }
  addition_info_shop_carts: {
    shop_id: Shop['id']
    promo_codes?: Coupon['code'][]
    note?: string[]
  }[]
}>;

export type ResponseUpdateCart = {
  summary_order: ResponseGetCart_SummaryOrder
  cart: ResponseGetCart['cart']
};
// endregion

// region add product cart
export type AddProductToCartBody = {
  inventory_id: ProductInventory['id']
  quantity: number
  variant_id?: ProductVariant['id']
  is_temp?: boolean
};

export type ResponseAddProductToCartBody = {
  summary_order: ResponseGetCart_SummaryOrder
  cart: ResponseGetCart['cart']
};
// endregion

export type ResponseDeleteProductCart = {
  summary_order: ResponseGetCart_SummaryOrder
  cart: ResponseGetCart['cart']
};
