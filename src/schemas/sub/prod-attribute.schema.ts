import { z } from 'zod';
import { PRODUCT_CATEGORIES, PRODUCT_ATTR_CLOTHING_SIZE, PRODUCT_ATTR_CLOTHING_GENDER } from '~/config/enums/product';

const baseAttributeSchema = z.object({
  // manufacturer: z.string().min(2),
  // brand: z.string().min(2),
  // model_number: z.string().min(2),
  // weigh: z.string().min(2), // 3.41 pounds
  // material: z.array(z.string().min(2)).min(1),
  // package_dimensions: z.string().min(30), //  4.49 x 4.41 x 3.7 inches; 12.31 Ounces
  color: z.array(z.string().min(2)).min(1),
});

export const electronicSchema = z.object({
  category: z.literal(PRODUCT_CATEGORIES.ELECTRONIC),
  batteries: z.string(),
  series: z.string(),
});

export const clothingSchema = z.object({
  category: z.literal(PRODUCT_CATEGORIES.CLOTHING),
  size: z.nativeEnum(PRODUCT_ATTR_CLOTHING_SIZE),
  gender: z.nativeEnum(PRODUCT_ATTR_CLOTHING_GENDER),
});

const conditionsSchema = z.discriminatedUnion('category', [
  electronicSchema,
  clothingSchema,
]);

export const productAttributeSchema = z.intersection(conditionsSchema, baseAttributeSchema);
