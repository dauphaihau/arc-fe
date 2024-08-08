import type { z } from 'zod';
import type { ComputedRef } from 'vue';
import type {
  Product, ProductImage, ProductInventory, ProductPopulated
} from '~/types/product';
import type { createProductShippingSchema } from '~/schemas/product-shipping.schema';
import type {
  createProductSchema,
  updateProductSchema,
  createVariantOptionSchema,
  updateVariantOptionsSchema
} from '~/schemas/product.schema';
import type { Override } from '~/types/utils';
import type { RequestGetListParams } from '~/types/common';

// region create product
export type CreateProductShipping = z.infer<typeof createProductShippingSchema>;

export type CreateProductSchema = z.infer<typeof createProductSchema>;

export type CreateProductBody = Override<CreateProductSchema, {
  who_made: ComputedRef<CreateProductSchema['who_made']>
}>;
export type CreateVariantOptions = z.infer<typeof createVariantOptionSchema>;
// endregion

// region update product
export type UpdateProductBody = z.infer<typeof updateProductSchema>;

export type UpdateVariantOptions = z.infer<typeof updateVariantOptionsSchema>;
// endregion

// region get products
export type ShopGetProductsQueryParams = Partial<Pick<Product, 'title' > & RequestGetListParams>;

export type ResponseShopGetProducts = Pick<Product, 'id' | 'title' | 'variant_type'> & {
  image_relative_url: ProductImage['relative_url']
  inventories: Pick<ProductInventory, 'variant' | 'price' | 'stock' | 'sku'>[]
};
// endregion

export type ResponseShopGetDetailProduct = {
  product: ProductPopulated
};
