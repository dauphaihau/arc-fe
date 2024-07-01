import type { ResponseGetPresignedUrlData } from '~/types/upload';
import { RESOURCES } from '~/config/enums/resources';

export function useGetPresignedUrl() {
  const authStore = useAuthStore();
  return useMutation({
    mutationKey: ['get-presigned-url'],
    mutationFn: () => {
      return useCustomFetchTemp.get<ResponseGetPresignedUrlData>(
        `${RESOURCES.UPLOAD}?shop=${authStore?.user?.shop?.id}`
      );
    },
  });
}
