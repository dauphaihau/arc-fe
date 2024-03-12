import { z } from 'zod';
import { categorySchema } from '~/schemas/category.schema';

export type ICategory = z.infer<typeof categorySchema>;

export type GetCategoriesParams = Pick<ICategory, 'parent'>;

export type ResponseGetCategories = {
  categories: ICategory[]
  has_more: boolean
}

export interface ICategorySessionStorage extends ICategory {
  to?: string;
}

export type ICategorySearch = {
  id: ICategory['id']
  lastNameCategory: ICategory['name']
  categoriesRelated: ICategory['name'][]
};
