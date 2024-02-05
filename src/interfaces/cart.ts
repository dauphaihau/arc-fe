import { z } from 'zod';
import type { IProductInventory, IProductVariant } from './product';
import { cartSchema, itemCartSchema, productCartSchema } from '~/schemas/cart.schema';
import type { ICoupon } from '~/interfaces/coupon';
import type { IShop } from '~/interfaces/shop';
import type { ITempOrder } from '~/interfaces/order';

export type ICart = z.infer<typeof cartSchema>;
export type IItemCart = z.infer<typeof itemCartSchema>;
export type IProductCart = z.infer<typeof productCartSchema>

export type IAddProductCart = Pick<IProductCart, 'quantity'> & {
  inventory: IProductInventory['id']
  variant?: IProductVariant['id']
};

export type IUpdateProductCart = Partial<Pick<IProductCart, 'quantity' | 'is_select_order'>> & {
  inventory: IProductInventory['id']
  variant?: IProductVariant['id']
};

export type IUpdateCouponsItem = {
  shop: IShop['id'],
  coupon_codes: ICoupon['code'][]
}

export type IResponseGetCart = {
  cart: ICart,
  tempOrder: ITempOrder
  totalProducts: number
}
