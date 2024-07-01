import { z } from 'zod';
import {
  PRODUCT_STATES,
  PRODUCT_REGEX_SLUG,
  PRODUCT_REGEX_NOT_URL,
  PRODUCT_WHO_MADE,
  PRODUCT_CONFIG,
  PRODUCT_VARIANT_TYPES
} from '~/config/enums/product';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';
import { shopSchema } from '~/schemas/shop.schema';
import { categorySchema } from '~/schemas/category.schema';
import { createProductShippingSchema, productShippingSchema } from '~/schemas/product-shipping.schema';
import { createProductInventorySchema, productInventorySchema } from '~/schemas/product-inventory.schema';
import { productVariantOptSchema, productVariantSchema } from '~/schemas/product-variant.schema';

export const productImageSchema = z.object({
  id: objectIdSchema,
  relative_url: z
    .string()
    .startsWith('shop', 'must start with shop')
    .regex(PRODUCT_REGEX_NOT_URL, 'must not absolute url'),
  rank: z
    .number()
    .min(PRODUCT_CONFIG.MIN_IMAGES)
    .max(PRODUCT_CONFIG.MAX_IMAGES)
    .default(1),
});

export const productAttributeSchema = z.object({
  attribute: objectIdSchema,
  selected: z.string(),
});

export const baseProductSchema = z.object({
  id: objectIdSchema,
  shop: objectIdSchema,
  category: objectIdSchema,
  shipping: objectIdSchema,
  variant_type: z
    .nativeEnum(PRODUCT_VARIANT_TYPES)
    .default(PRODUCT_VARIANT_TYPES.NONE),
  attributes: z.array(productAttributeSchema),
  title: z
    .string()
    .min(PRODUCT_CONFIG.MIN_CHAR_TITLE, `Title must contain at least ${PRODUCT_CONFIG.MIN_CHAR_TITLE} characters`)
    .max(110),
  description: z
    .string()
    .min(PRODUCT_CONFIG.MIN_CHAR_DESCRIPTION, `Description must contain at least ${PRODUCT_CONFIG.MIN_CHAR_DESCRIPTION} characters`)
    .max(PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION),
  slug: z
    .string()
    .regex(PRODUCT_REGEX_SLUG, 'invalid slug')
    .optional(),
  tags: z.array(
    z.string()
      .min(PRODUCT_CONFIG.MIN_CHAR_TAG)
      .max(PRODUCT_CONFIG.MAX_CHAR_TAG)
  )
    .max(PRODUCT_CONFIG.MAX_TAGS)
    .default([]),
  state: z
    .nativeEnum(PRODUCT_STATES)
    .default(PRODUCT_STATES.ACTIVE),
  is_digital: z
    .boolean()
    .default(false),
  who_made: z
    .nativeEnum(PRODUCT_WHO_MADE)
    .default(PRODUCT_WHO_MADE.I_DID),
  views: z
    .number()
    .optional(),
  non_taxable: z
    .boolean()
    .default(false)
    .optional(),
  images: z
    .array(productImageSchema)
    .min(PRODUCT_CONFIG.MIN_IMAGES)
    .max(PRODUCT_CONFIG.MAX_IMAGES),
  rating_average: z
    .number()
    .min(0, 'Rating must be more than 0')
    .max(5, 'Rating must be equal or less than 5.0')
    .default(0)
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const baseProductPopulatedSchema = baseProductSchema.merge(z.object({
  shop: shopSchema,
  category: categorySchema,
  shipping: productShippingSchema,
}));

const noneVariantSchema = z.object({
  variant_type: z.literal(PRODUCT_VARIANT_TYPES.NONE),
  inventory: objectIdSchema,
});

const noneVariantPopulatedSchema = noneVariantSchema.merge(z.object({
  inventory: productInventorySchema,
}));

export const singleVariantSchema = z.object({
  variant_type: z.literal(PRODUCT_VARIANT_TYPES.SINGLE),
  variants: z.array(objectIdSchema),
  variant_group_name: z
    .string()
    .min(1)
    .max(PRODUCT_CONFIG.MAX_CHAR_VARIANT_GROUP_NAME),
});

const singleVariantPopulatedSchema = singleVariantSchema.merge(z.object({
  variants: z.array(
    productVariantSchema.merge(z.object({
      inventory: productInventorySchema,
    }))
  ),
}));

export const combineVariantSchema = z.object({
  variant_type: z.literal(PRODUCT_VARIANT_TYPES.COMBINE),
  variants: z.array(objectIdSchema),
  variant_group_name: z
    .string()
    .min(1)
    .max(PRODUCT_CONFIG.MAX_CHAR_VARIANT_GROUP_NAME),
  variant_sub_group_name: z
    .string()
    .min(1)
    .max(PRODUCT_CONFIG.MAX_CHAR_VARIANT_GROUP_NAME),
});

const combineVariantPopulatedSchema = combineVariantSchema.merge(z.object({
  variants: z.array(
    productVariantSchema.merge(z.object({
      variant_options: z.array(z.object({
        variant: productVariantSchema,
        inventory: productInventorySchema,
      })),
    }))
  ),
}));

const conditionVariantTypeSchema = z.discriminatedUnion(
  'variant_type', [
    noneVariantSchema,
    singleVariantSchema,
    combineVariantSchema,
  ]
);

const conditionVariantTypePopulatedSchema = z.discriminatedUnion(
  'variant_type', [
    noneVariantPopulatedSchema,
    singleVariantPopulatedSchema,
    combineVariantPopulatedSchema,
  ]
);

export const productSchema = z.intersection(conditionVariantTypeSchema, baseProductSchema);

export const productPopulateSchema = z.intersection(conditionVariantTypePopulatedSchema, baseProductPopulatedSchema);

// ------ Request api

export const productStateUserCanModify = z.union([
  z.literal(PRODUCT_STATES.ACTIVE),
  z.literal(PRODUCT_STATES.INACTIVE),
  z.literal(PRODUCT_STATES.DRAFT),
]).default(PRODUCT_STATES.ACTIVE);

export const variantOptionCreateSchema = productInventorySchema
  .pick({ price: true, sku: true, stock: true })
  .merge(productVariantSchema.pick({ variant_name: true }));

export const createProductSchema = baseProductSchema
  .omit({
    id: true,
    shop: true,
    rating_average: true,
    views: true,
    variants: true,
    shipping: true,
    createdAt: true,
    updatedAt: true,
  }).merge(
    z.object({
      state: productStateUserCanModify,
      images: z
        .array(productImageSchema.omit({ id: true }))
        .min(PRODUCT_CONFIG.MIN_IMAGES)
        .max(PRODUCT_CONFIG.MAX_IMAGES),
      tags: baseProductSchema.shape.tags.optional().default([]),
      shipping: createProductShippingSchema,
      // single_variants: z.array(
      // combine_variants: z.array(
      // none_variants: z.array(
      new_variants: z.array(
        productVariantSchema
          .pick({ variant_name: true })
          .merge(z.object({
            variant_options: z.array(variantOptionCreateSchema),
          }))
          .merge(createProductInventorySchema).partial()
      ).optional(),
    })
  )
  .merge(
    // createProductInventorySchema.partial()
    createProductInventorySchema
  );

export const variantOptionsUpdateSchema = createProductInventorySchema.merge(
  productVariantSchema.pick({ variant_name: true }).merge(
    productVariantOptSchema.pick({ variant: true })
  )
);

export const updateProductSchema = baseProductSchema
  .omit({
    shop: true,
    rating_average: true,
    views: true,
    variants: true,
    shipping: true,
  }).merge(
    z.object({
      state: productStateUserCanModify,
      images: z
        .array(productImageSchema.partial())
        .min(PRODUCT_CONFIG.MIN_IMAGES)
        .max(PRODUCT_CONFIG.MAX_IMAGES),
      update_variants: z.array(productVariantSchema.pick({ id: true, variant_name: true }).partial()).optional(),
      variant_inventories: z
        .array(
          productInventorySchema
            .pick({
              id: true, price: true, sku: true, stock: true,
            })
            .strict()
        )
        .optional(),
      new_single_variants: z.array(
        createProductInventorySchema.merge(
          productVariantSchema.pick({ variant_name: true })
        )),
      new_combine_variants: z.array(
        productVariantSchema
          .pick({ variant_name: true })
          .merge(
            z.object({
              variant_options: z.array(variantOptionsUpdateSchema),
            })
          )),
    })
  ).merge(
    createProductInventorySchema
  ).partial();
