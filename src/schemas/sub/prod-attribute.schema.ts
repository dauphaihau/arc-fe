import { z } from 'zod';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_ATTR_CLOTHING_TYPES,
  PRODUCT_ATTR_CLOTHING_GENDER,
  PRODUCT_ATTR_CLOTHING_SHAPES
} from '~/config/enums/product';

export const baseAttributeSchema = z.object({
  brand: z.string().optional(),
  // brand: z.string().min(2).optional(),
  // manufacturer: z.string().min(2),
  // model_number: z.string().min(2),
  // weigh: z.string().min(2), // 3.41 pounds
  // material: z.array(z.string().min(2)).min(1),
  // package_dimensions: z.string().min(30), //  4.49 x 4.41 x 3.7 inches; 12.31 Ounces
});

export const electronicSchema = z.object({
  category: z.literal(PRODUCT_CATEGORIES.ELECTRONIC),
  batteries: z.string(),
  series: z.string(),
});

export const clothingSchema = z.object({
  category: z.literal(PRODUCT_CATEGORIES.CLOTHING),
  type: z.nativeEnum(PRODUCT_ATTR_CLOTHING_TYPES),
  shape: z.nativeEnum(PRODUCT_ATTR_CLOTHING_SHAPES),
  gender: z.nativeEnum(PRODUCT_ATTR_CLOTHING_GENDER),
});

const conditionsSchema = z.discriminatedUnion('category', [
  electronicSchema,
  clothingSchema,
]);

export const productAttributeSchema = z.intersection(conditionsSchema, baseAttributeSchema);
