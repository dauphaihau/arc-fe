import { z } from 'zod';
import { productSchema, productStateUserCanModify, productVariantSchema } from '../schemas/product.schema';
import type { RequestGetListParams } from '~/interfaces/common';
import type { productInventorySchema } from '~/schemas/product-inventory.schema';
import type { Override } from '~/interfaces/utils';
import type { IShop } from '~/interfaces/shop';

export type IProduct = z.infer<typeof productSchema>;
export type IProductInventory = z.infer<typeof productInventorySchema>;
export type IProductVariant = z.infer<typeof productVariantSchema>;
export type PRODUCT_STATES_USER_CAN_MODIFY = z.infer<typeof productStateUserCanModify>;

export type IProductVirtualFields = {
  summary_inventory: Record<'lowest_price' | 'highest_price' | 'stock', number>
}

export type CreateProductPayload =
  Omit<IProduct, 'id' | 'rating_average' | 'views' | 'images' | 'shop' | 'state' | 'variant_type'> &
  Partial<Pick<IProduct, 'category' | 'images'>> &
  { category?: IProduct['category'] } &
  { state: PRODUCT_STATES_USER_CAN_MODIFY } &
   Pick<IProductInventory, 'price'| 'sku'|'stock'>


export type GetProductsLowsetPriceQueries = Partial<Pick<IProduct, 'category'> & RequestGetListParams>

export type GetProductsQueryParams = Partial<Pick<IProduct, 'title' > & RequestGetListParams>

type IVariantGetProducts = Omit<IProductVariant, 'variant_options'> & {
  variant_options: {
    inventory: IProductInventory
  }[];
  inventory: IProductInventory
};

export type ResponseGetProducts = Override<IProduct, {
  shop_name: IShop['shop_name']
  variants?: IVariantGetProducts[]
  image_relative_url: string
  summary_inventory: Record<
    'lowest_price' | 'highest_price' | 'stock'
    , number>
}>;
