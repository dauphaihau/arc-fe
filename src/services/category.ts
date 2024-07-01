import { RESOURCES } from '~/config/enums/resources';
import type {
  Category, CategorySearch, GetCategoriesParams, ResponseGetCategories
} from '~/types/category';
import type { CategoryAttribute } from '~/types/category-attribute';

export function useGetCategories(params?: GetCategoriesParams) {
  return useQuery({
    queryKey: ['get-categories'],
    queryFn: () => {
      return useCustomFetchTemp.get<ResponseGetCategories>(
        RESOURCES.CATEGORIES,
        params || undefined
      );
    },
  });
}

export function useGetSearchCategories() {
  return useMutation({
    mutationKey: ['get-search-categories'],
    mutationFn: (name: Category['name']) => {
      return useCustomFetchTemp.delete<{ categories: CategorySearch[] }>(
        RESOURCES.CATEGORIES,
        {
          name,
        }
      );
    },
  });
}

export function useGetAttributesByCategory(id?: Category['id']) {
  return useQuery({
    enabled: !!id,
    queryKey: ['get-attributes-by-category'],
    queryFn: () => {
      return useCustomFetchTemp.get<{ attributes: CategoryAttribute[] }>(
        `${RESOURCES.CATEGORIES}/${id}${RESOURCES.ATTRIBUTES}`
      );
    },
  });
}
