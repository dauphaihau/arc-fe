import { RESOURCES } from '~/config/enums/resources';
import type {
  ResponseGetCategories, GetCategoriesParams, ICategory, ICategorySearch
} from '~/interfaces/category';
import type { IAttribute } from '~/interfaces/attribute';

export class CategoryModule {
  async getCategories(params?: GetCategoriesParams | Ref<GetCategoriesParams>) {
    return await useCustomFetch.get<ResponseGetCategories>(
      RESOURCES.CATEGORIES,
      params || null
    );
  }

  async getSearchCategories(name: string) {
    return await useCustomFetch.delete<{categories: ICategorySearch[] }>(
      RESOURCES.CATEGORIES,
      {
        name,
      }
    );
  }

  async getAttributesByCategory(id: ICategory['id']) {
    return await useCustomFetch.get<{ attributes: IAttribute[] }>(
      `${RESOURCES.CATEGORIES}/${id}${RESOURCES.ATTRIBUTES}`
    );
  }
}
