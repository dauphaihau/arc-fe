import { RESOURCES } from '~/config/enums/resources';
import type {
  Category, CategorySearch, GetCategoriesParams, ResponseGetCategories
} from '~/types/category';
import type { CategoryAttribute } from '~/types/category-attribute';

export function useGetCategories(
  params?: GetCategoriesParams
) {
  return useQuery<ResponseGetCategories>({
    enabled: !!params,
    queryKey: ['get-categories', params],
    queryFn: () => {
      return useCustomFetch.get<ResponseGetCategories>(
        RESOURCES.CATEGORIES,
        params
      );
    },
  });
}

export function useGetRootCategories() {
  return useQuery({
    queryKey: ['get-root-categories'],
    queryFn: () => {
      return useCustomFetch.get<ResponseGetCategories>(RESOURCES.CATEGORIES);
    },
  });
}

export function useGetSearchCategories() {
  return useMutation({
    mutationKey: ['get-search-categories'],
    mutationFn: (name: Category['name']) => {
      return useCustomFetch.delete<{ categories: CategorySearch[] }>(
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
      return useCustomFetch.get<{ attributes: CategoryAttribute[] }>(
        `${RESOURCES.CATEGORIES}/${id}${RESOURCES.ATTRIBUTES}`
      );
    },
  });
}
