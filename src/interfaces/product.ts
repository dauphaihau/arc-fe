import { z } from 'zod';
import { productSchema, productStateUserCanModify, productVariantSchema } from '../schemas/product.schema';
import type { RequestGetListParams } from '~/interfaces/common';
import type { productInventorySchema } from '~/schemas/product-inventory.schema';
import type { Override } from '~/interfaces/utils';

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


export type GetProductsParams = Partial<Pick<IProduct, 'title' | 'category'> & RequestGetListParams>

type IVariantGetProducts = Omit<IProductVariant, 'variant_options'> & {
  variant_options: {
    inventory: IProductInventory
  }[];
  inventory: IProductInventory
};

export type ResponseGetProducts = Override<IProduct, {
  variants?: IVariantGetProducts[]
  summary_inventory: Record<
    'lowest_price' | 'highest_price' | 'stock'
    , number>
}>;
