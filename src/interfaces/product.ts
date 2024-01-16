import { z } from 'zod';
import { productSchema, productStateUserCanModify, productVariantSchema } from '../schemas/product.schema';
import { clothingSchema, electronicSchema, baseAttributeSchema } from '../schemas/sub/prod-attribute.schema';
import type { RequestGetListParams } from '~/interfaces/common';

export type IProduct = z.infer<typeof productSchema>;
export type IProductClothing = z.infer<typeof clothingSchema>;
export type IProductElectronic = z.infer<typeof electronicSchema>;
export type IProductVariant = z.infer<typeof productVariantSchema>;
export type IProductBaseAttr = z.infer<typeof baseAttributeSchema>;

export type PRODUCT_STATES_USER_CAN_MODIFY = z.infer<typeof productStateUserCanModify>;

export type CreateProductPayload =
  Omit<IProduct, 'id' | 'rating_average' | 'views' | 'category' | 'attributes' | 'images' | 'shop' | 'state'> &
  Partial<Pick<IProduct, 'category' | 'images'>> &
  { attributes: IProductBaseAttr & { category?: IProduct['category'] } } &
  { state: PRODUCT_STATES_USER_CAN_MODIFY }


export type GetProductsParams = Partial<Pick<IProduct, 'title' | 'price' | 'category'> & RequestGetListParams>
