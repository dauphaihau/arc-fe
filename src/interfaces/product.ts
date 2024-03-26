import { z } from 'zod';
import type { ICoupon } from './coupon';
import type { ICategory } from './category';
import {
  createProductSchema,
  productAttributeSchema,
  productImageSchema,
  productSchema,
  productStateUserCanModify, productVariantOptSchema,
  productVariantSchema,
  updateProductSchema, variantOptionCreateSchema, variantOptionsUpdateSchema
} from '~/schemas/product.schema';
import type { RequestGetListParams } from '~/interfaces/common';
import type { productInventorySchema } from '~/schemas/product-inventory.schema';
import type { Override } from '~/interfaces/utils';
import type { IShop } from '~/interfaces/shop';

export type IProduct = z.infer<typeof productSchema>;
export type IProductInventory = z.infer<typeof productInventorySchema>;
export type IProductImage = z.infer<typeof productImageSchema>;
export type IProductVariant = z.infer<typeof productVariantSchema>;
export type IProductOptVariant = z.infer<typeof productVariantOptSchema>;
export type IProductAttribute = z.infer<typeof productAttributeSchema>;
export type PRODUCT_STATES_USER_CAN_MODIFY = z.infer<typeof productStateUserCanModify>;

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type CreateProductBody = Override<CreateProductSchema, {
  who_made: ComputedRef<CreateProductSchema['who_made']>
}>
export type VariantOptionsCreate = z.infer<typeof variantOptionCreateSchema>;

export type UpdateProductBody = z.infer<typeof updateProductSchema>;
export type VariantOptionsUpdate = z.infer<typeof variantOptionsUpdateSchema>;

export type ResponseGetDetailProductByShop = Override<IProduct, {
  state: PRODUCT_STATES_USER_CAN_MODIFY
  category: ICategory
  variants: Override<IProductVariant, {
    inventory: Pick<IProductInventory, 'price' | 'stock' | 'sku' | 'id'> // populated
    variant_options: Override<IProductOptVariant, {
      variant: IProductVariant // populated
      inventory: Pick<IProductInventory, 'price' | 'stock' | 'sku' | 'id'> // populated
    }>[]
  }>[]
}> & Partial<Pick<IProductInventory, 'price' | 'stock' | 'sku'>>

export type IProductVirtualFields = {
  summary_inventory: Record<'lowest_price' | 'highest_price' | 'stock', number>
}

export type GetProductsLowestPriceQueries = Partial<Pick<IProduct, 'category' | 'shop'> & RequestGetListParams>

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
    'lowest_price' | 'highest_price' | 'stock' | 'sale_price' | 'percent_off'
    , number> & { discount_types: ICoupon['type'][] }
}>;

export type ResponseGetDetailProduct = Override<IProduct, {
  shop: IShop,
  variants: Override<IProductVariant, {
    inventory: Pick<IProductInventory, 'price' | 'stock' | 'sku' | 'id'> // populated
    variant_options: Override<IProductOptVariant, {
      variant: IProductVariant // populated
      inventory: Pick<IProductInventory, 'price' | 'stock' | 'sku' | 'id'> // populated
    }>[]
  }>[]
}>;
