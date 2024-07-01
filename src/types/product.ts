import type { z } from 'zod';
import type { Coupon } from './coupon';
import type { Category } from './category';
import type {
  combineVariantSchema,
  createProductSchema,
  productAttributeSchema,
  productImageSchema, productPopulateSchema,
  productSchema,
  productStateUserCanModify,
  singleVariantSchema,
  updateProductSchema, variantOptionCreateSchema, variantOptionsUpdateSchema
} from '~/schemas/product.schema';
import type { RequestGetListParams } from '~/types/common';
import type { productInventorySchema } from '~/schemas/product-inventory.schema';
import type { Override } from '~/types/utils';
import type { Shop } from '~/types/shop';
import type { productStandardShippingSchema, createProductShippingSchema, productShippingSchema } from '~/schemas/product-shipping.schema';
import type { productVariantSchema, productVariantOptSchema } from '~/schemas/product-variant.schema';

export type Product = z.infer<typeof productSchema>;
export type ProductSingleVariant = z.infer<typeof singleVariantSchema>;
export type ProductCombineVariant = z.infer<typeof combineVariantSchema>;
export type ProductPopulated = z.infer<typeof productPopulateSchema>;
export type ProductInventory = z.infer<typeof productInventorySchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductAttribute = z.infer<typeof productAttributeSchema>;
export type ProductStandardShipping = z.infer<typeof productStandardShippingSchema>;
export type ProductShipping = z.infer<typeof productShippingSchema>;
export type ProductOptVariant = z.infer<typeof productVariantOptSchema>;
export type PRODUCT_STATES_USER_CAN_MODIFY = z.infer<typeof productStateUserCanModify>;

export type CreateProductShipping = z.infer<typeof createProductShippingSchema>;

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type CreateProductBody = Override<CreateProductSchema, {
  who_made: ComputedRef<CreateProductSchema['who_made']>
}>;
export type VariantOptionsCreate = z.infer<typeof variantOptionCreateSchema>;

export type UpdateProductBody = z.infer<typeof updateProductSchema>;
export type VariantOptionsUpdate = z.infer<typeof variantOptionsUpdateSchema>;

export type ProductVirtualFields = {
  summary_inventory: Record<'lowest_price' | 'highest_price' | 'stock', number>
};

export type GetProductsLowestPriceQueries = Partial<Pick<Product, 'category' | 'shop'> & RequestGetListParams>;

export type GetProductsQueryParams = Partial<Pick<Product, 'title' > & RequestGetListParams>;

type IVariantGetProducts = Omit<ProductVariant, 'variant_options'> & {
  variant_options: {
    inventory: ProductInventory
  }[]
  inventory: ProductInventory
};

export type ResponseGetProducts = Override<Product, {
  shop_name: Shop['shop_name']
  variants?: IVariantGetProducts[]
  image_relative_url: string
  summary_inventory: Record<
    'lowest_price' | 'highest_price' | 'stock' | 'sale_price' | 'percent_off'
    , number> & { discount_types: Coupon['type'][] }
}>;

export type ResponseGetDetailProduct = {
  product: Omit<ProductPopulated, 'category'> & {
    category: Category['id']
    inventory: ProductInventory
  } & ProductPopulated
};

export type ResponseShopGetDetailProduct = {
  product: ProductPopulated
};
