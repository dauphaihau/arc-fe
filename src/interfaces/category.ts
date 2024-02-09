import { z } from 'zod';
import { categorySchema } from '~/schemas/category.schema';

export type ICategory = z.infer<typeof categorySchema>;

export type GetCategoriesParams = Pick<ICategory, 'parent'> & {
  has_more: boolean
}
