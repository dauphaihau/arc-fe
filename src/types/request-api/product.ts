import type { Shop } from '~/types/shop';
import type {
  Product,
  ProductImage, ProductInventory, ProductShipping
} from '~/types/product';
import type { Coupon } from '~/types/coupon';
import type { RequestGetListParams, ResponseBaseGetList } from '~/types/common';
import type { Category } from '~/types/category';

// region get products
// export type GetProductsParams = Partial<Pick<Product, 'category' | 'shop'> & RequestGetListParams>;
export type GetProductsParams = Partial<{
  category_id: Category['id']
}> & RequestGetListParams;

export type ResponseGetProducts_Product = {
  shop: Pick<Shop, 'id' | 'shop_name'>
  inventory: Pick<ProductInventory, 'price' | 'stock' | 'sku'> & {
    sale_price?: ProductInventory['price']
  }
  image_relative_url: ProductImage['relative_url']
  percent_coupon?: Pick<Coupon, 'percent_off' | 'start_date' | 'end_date'>
  free_ship_coupon?: Pick<Coupon, 'start_date' | 'end_date'>
  category_id: Category['id']
} & Pick<Product, 'id' | 'title' | 'variant_type'>;

export type ResponseGetProducts = ResponseBaseGetList<ResponseGetProducts_Product>;
// endregion

// region get detail product
export type ResponseGetDetailProduct_Inventory = Pick<ProductInventory, 'id' | 'stock' | 'price' | 'variant'> & {
  sale_price: ProductInventory['price']
};

type DetailProduct = {
  shop: Pick<Shop, 'id' | 'shop_name'>
  shipping: Pick<ProductShipping, 'country' | 'process_time'>
  variant_group_name?: string
  variant_sub_group_name?: string
  inventories: ResponseGetDetailProduct_Inventory[]
} & Pick<Product, 'id' | 'title' | 'description' | 'variant_type' | 'images' | 'category'>;

export type ResponseGetDetailProduct = {
  product: DetailProduct
  percent_coupon?: Pick<Coupon, 'percent_off' | 'start_date' | 'end_date'>
  free_ship_coupon?: Pick<Coupon, 'start_date' | 'end_date'>
};
// endregion
