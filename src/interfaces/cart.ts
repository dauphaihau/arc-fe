import type { z } from 'zod';
import type {
  IProduct,
  IProductInventory, IProductPopulated,
  IProductVariant
} from './product';
import type { Override } from './utils';
import type { cartSchema, itemCartSchema, productCartSchema } from '~/schemas/cart.schema';
import type { ICoupon } from '~/interfaces/coupon';
import type { IShop } from '~/interfaces/shop';
import type { IAdditionInfoItem, ISummaryOrder } from '~/interfaces/order';
import type { IAddress } from '~/interfaces/address';

export type ICart = z.infer<typeof cartSchema>;
export type IItemCart = z.infer<typeof itemCartSchema>;
export type IProductCart = z.infer<typeof productCartSchema>;

export type IAddProductCart = Pick<IProductCart, 'quantity'> & {
  inventory: IProductInventory['id']
  variant?: IProductVariant['id']
};

export type IUpdateProductCart = Partial<Pick<IProductCart, 'quantity' | 'is_select_order'>> & {
  inventory: IProductInventory['id']
  variant?: IProductVariant['id']
  additionInfoItems?: IAdditionInfoItem[]
};

export type IUpdateCouponsItem = {
  shop: IShop['id']
  coupon_codes: ICoupon['code'][]
};

export type IProductCartPopulated = Override<IProductCart, {
  variant: Pick<IProductVariant, 'variant_name'>
  inventory: IProductInventory & {
    product: IProduct
  }
}>;

export type IItemCartPopulated = Override<IItemCart, {
  shop: IShop
  products: IProductCartPopulated[]
}>;

export type IResponseGetCart = {
  cart: Override<ICart, {
    items: IItemCartPopulated[]
  }>
  summaryOrder: ISummaryOrder
  totalProducts: number
  address: IAddress
};

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
};

export type IStateProductCheckoutNow = {
  product: IProductPopulated
  variant?: string
  quantity: number
  inventory: string
  url_image: string
  variantName1?: string
  variantName2?: string
} & Pick<IProductInventory, 'price' | 'stock'>;
