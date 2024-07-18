import type { ResponseGetPresignedUrlData } from '~/types/upload';
import { RESOURCES } from '~/config/enums/resources';
import { useGetCurrentUser } from '~/services/user';

export function useGetPresignedUrl() {
  const { data: dataUserAuth } = useGetCurrentUser();
  return useMutation({
    mutationKey: ['get-presigned-url'],
    mutationFn: () => {
      return useCustomFetch.get<ResponseGetPresignedUrlData>(
        `${RESOURCES.UPLOAD}?shop=${dataUserAuth.value?.user?.shop?.id}`
      );
    },
  });
}
