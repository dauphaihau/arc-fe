import { z } from 'zod';
import { productSchema, productStateUserCanModify, productVariantSchema } from '../schemas/product.schema';
import { clothingSchema, electronicSchema, baseAttributeSchema } from '../schemas/sub/prod-attribute.schema';
import type { RequestGetListParams } from '~/interfaces/common';
import type { productInventorySchema } from '~/schemas/product-inventory.schema';


export type IProductInventory = z.infer<typeof productInventorySchema>;
export type IProduct = z.infer<typeof productSchema>;
export type IProductClothing = z.infer<typeof clothingSchema>;
export type IProductElectronic = z.infer<typeof electronicSchema>;
export type IProductVariant = z.infer<typeof productVariantSchema>;
export type IProductBaseAttr = z.infer<typeof baseAttributeSchema>;
export type PRODUCT_STATES_USER_CAN_MODIFY = z.infer<typeof productStateUserCanModify>;

export type IProductVirtualFields = {
  summary_inventory: Record<'lowest_price' | 'highest_price' | 'stock', number>
}

export type CreateProductPayload =
  Omit<IProduct, 'id' | 'rating_average' | 'views' | 'category' | 'attributes' | 'images' | 'shop' | 'state' | 'variant_type'> &
  Partial<Pick<IProduct, 'category' | 'images'>> &
  { attributes: IProductBaseAttr & { category?: IProduct['category'] } } &
  { state: PRODUCT_STATES_USER_CAN_MODIFY } &
   Pick<IProductInventory, 'price'| 'sku'|'stock'>


export type GetProductsParams = Partial<Pick<IProduct, 'title' | 'category'> & RequestGetListParams>
