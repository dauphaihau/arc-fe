import type { z } from 'zod';
import type { categorySchema } from '~/schemas/category.schema';

export type Category = z.infer<typeof categorySchema>;

export type GetCategoriesParams = Pick<Category, 'parent'>;

export type ResponseGetCategories = {
  categories: Category[]
  has_more: boolean
};

export interface CategorySessionStorage extends Category {
  to?: string
}

export type CategorySearch = {
  id: Category['id']
  lastNameCategory: Category['name']
  categoriesRelated: Category['name'][]
};
