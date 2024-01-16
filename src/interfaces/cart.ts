import { z } from 'zod';
import type { IProduct, IProductVariant } from './product';
import { cartSchema, itemCartSchema, productCartSchema } from '~/schemas/cart.schema';

export type ICart = z.infer<typeof cartSchema>;
export type IItemCart = z.infer<typeof itemCartSchema>;
export type IProductCart = z.infer<typeof productCartSchema>

export type IAddProductCart = Partial<Omit<IProductCart, 'product' | 'product_variant'>> & {
    product: IProduct['id']
    product_variant: IProductVariant['id']
};

export type IUpdateProductCart = Partial<Omit<IProductCart, 'product' | 'product_variant'>> & {
    product: IProduct['id']
    product_variant?: IProductVariant['id']
};
