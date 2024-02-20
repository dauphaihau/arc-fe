import { RESOURCES } from '~/config/enums/resources';
import type { ResponseGetCategories, GetCategoriesParams, ICategory } from '~/interfaces/category';
import type { IAttribute } from '~/interfaces/attribute';

export class CategoryModule {
  async getCategories(params?: GetCategoriesParams | Ref<GetCategoriesParams>) {
    return await useCustomFetch.get<ResponseGetCategories>(
      RESOURCES.CATEGORIES,
      params || null
    );
  }

  async getAttributesByCategory(id: ICategory['id']) {
    return await useCustomFetch.get<{ attributes: IAttribute[] }>(
      `${RESOURCES.CATEGORIES}/${id}${RESOURCES.ATTRIBUTES}`
    );
  }
}
