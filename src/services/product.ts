import { RESOURCES } from '~/config/enums/resources';
import type { IProduct, ResponseGetDetailProduct } from '~/interfaces/product';

export function useGetDetailProduct(id: IProduct['id']) {
  return useQuery({
    queryKey: ['detail-product'],
    queryFn: () => {
      return useCustomFetchTemp.get<ResponseGetDetailProduct>(
        `${RESOURCES.PRODUCTS}/${id}`
      );
    },
  });
}
