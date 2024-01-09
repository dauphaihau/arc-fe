import { z } from 'zod';
import { productAttributeSchema } from './sub/prod-attribute.schema';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATES,
  PRODUCT_REGEX_SLUG,
  PRODUCT_REGEX_NOT_URL,
  PRODUCT_WHO_MADE,
  PRODUCT_CONFIG,
  PRODUCT_MAX_IMAGES
} from '~/config/enums/product';
import { objectIdSchema } from '~/schemas/sub/objectId.schema';

export const productImageSchema = z.object({
  id: objectIdSchema.optional(),
  relative_url: z
    .string()
    .startsWith('shop', 'must start with shop')
    .regex(PRODUCT_REGEX_NOT_URL, 'must not absolute url'),
  rank: z
    .number()
    .min(1)
    .max(10)
    .default(1)
    .optional(),
});

export const productSchema = z.object({
  id: objectIdSchema,
  shop_id: objectIdSchema,
  title: z
    .string()
    .min(2, 'Title must contain at least 2 characters')
    .max(110),
  description: z
    .string()
    .min(2, 'Description must contain at least 2 characters')
    .max(PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION),
  price: z
    .number()
    .min(0.2, 'Price must at least 0.2$')
    .max(PRODUCT_CONFIG.MAX_PRICE,
      `Price must be less than or equal to ${PRODUCT_CONFIG.MAX_PRICE}$`),
  quantity: z
    .number()
    .min(1)
    .max(PRODUCT_CONFIG.MAX_QUANTITY),
  slug: z
    .string()
    .regex(PRODUCT_REGEX_SLUG, 'invalid slug')
    .optional(),
  tags: z.array(
    z.string()
      .min(2)
      .max(21)
  )
    .max(11).optional(),
  state: z
    .nativeEnum(PRODUCT_STATES)
    .default(PRODUCT_STATES.ACTIVE),
  is_digital: z
    .boolean()
    .default(false),
  who_made: z
    .nativeEnum(PRODUCT_WHO_MADE)
    .default(PRODUCT_WHO_MADE.I_DID)
    .optional(),
  views: z
    .number()
    .optional(),
  non_taxable: z
    .boolean()
    .default(false)
    .optional(),
  category: z.nativeEnum(PRODUCT_CATEGORIES),
  attributes: productAttributeSchema,
  images: z
    .array(productImageSchema)
    .min(1)
    .max(PRODUCT_MAX_IMAGES),
  rating_average: z
    .number()
    .min(0, 'Rating must be more than 0')
    .max(5, 'Rating must be equal or less than 5.0')
    .default(0)
    .optional(),
  sku: z
    .string()
    .optional(),
});

export const productStateUserCanModify = z.union([
  z.literal(PRODUCT_STATES.ACTIVE),
  z.literal(PRODUCT_STATES.INACTIVE),
  z.literal(PRODUCT_STATES.DRAFT),
]).default(PRODUCT_STATES.ACTIVE);
