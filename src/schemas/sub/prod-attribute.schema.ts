import { z } from 'zod';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_ATTR_CLOTHING_SIZES,
  PRODUCT_ATTR_CLOTHING_GENDER,
  PRODUCT_ATTR_CLOTHING_TYPES
} from '~/config/enums/product';

export const baseAttributeSchema = z.object({
  // manufacturer: z.string().min(2),
  // brand: z.string().min(2),
  // model_number: z.string().min(2),
  // weigh: z.string().min(2), // 3.41 pounds
  // material: z.array(z.string().min(2)).min(1),
  // package_dimensions: z.string().min(30), //  4.49 x 4.41 x 3.7 inches; 12.31 Ounces
  colors: z.array(z.string().min(2)).min(1, 'Choose at least one color'),
});

export const electronicSchema = z.object({
  category: z.literal(PRODUCT_CATEGORIES.ELECTRONIC),
  batteries: z.string(),
  series: z.string(),
});

export const clothingSchema = z.object({
  category: z.literal(PRODUCT_CATEGORIES.CLOTHING),
  type: z.nativeEnum(PRODUCT_ATTR_CLOTHING_TYPES),
  sizes: z.array(z.nativeEnum(PRODUCT_ATTR_CLOTHING_SIZES)).min(1),
  gender: z.nativeEnum(PRODUCT_ATTR_CLOTHING_GENDER),
});

const conditionsSchema = z.discriminatedUnion('category', [
  electronicSchema,
  clothingSchema,
]);

export const productAttributeSchema = z.intersection(conditionsSchema, baseAttributeSchema);
