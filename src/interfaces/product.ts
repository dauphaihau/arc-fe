import { z } from 'zod';
import { productSchema, productStateUserCanModify } from '../schemas/product.schema';
import type { RequestGetListParams } from '~/interfaces/common';

export type IProduct = z.infer<typeof productSchema>;

export type PRODUCT_STATES_USER_CAN_MODIFY = z.infer<typeof productStateUserCanModify>;

export type CreateProductPayload = Omit<IProduct, 'id' | 'rating_average' | 'views' | 'state'> & {
  state: PRODUCT_STATES_USER_CAN_MODIFY
};

export type GetProductsParams = Partial<Pick<IProduct, 'title' | 'price' | 'category'> & RequestGetListParams>
