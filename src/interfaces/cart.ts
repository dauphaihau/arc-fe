import { z } from 'zod';
import type { IProduct, IProductInventory, IProductVariant } from './product';
import type { Override } from './utils';
import { cartSchema, itemCartSchema, productCartSchema } from '~/schemas/cart.schema';
import type { ICoupon } from '~/interfaces/coupon';
import type { IShop } from '~/interfaces/shop';
import type { IAdditionInfoItem, ISummaryOrder } from '~/interfaces/order';
import type { IAddress } from '~/interfaces/address';

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
  additionInfoItems? : IAdditionInfoItem[]
};

export type IUpdateCouponsItem = {
  shop: IShop['id'],
  coupon_codes: ICoupon['code'][]
}

export type IProductCartPopulated = Override<IProductCart, {
  inventory: IProductInventory & {
    product: IProduct
  },
}>

export type IItemCartPopulated = Override<IItemCart, {
  products: IProductCartPopulated[]
}>

export type IResponseGetCart = {
  cart: Override<ICart, {
    items: IItemCartPopulated[]
  }>,
  summaryOrder: ISummaryOrder
  totalProducts: number
  address: IAddress
}

export type IResponseGetCartForHeaders = {
  cart: {
    products: {
      product: {
        _id: IProduct['id']
        title: IProduct['title']
        image: {
          relative_url: string
        }
      }
      inventory: {
        variant: IProductInventory['variant']
      }
    }[]
    restProducts: number
  }
}
