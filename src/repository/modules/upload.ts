import type { GetPresignedUrlData } from '~/interfaces/upload';
import { RESOURCES } from '~/config/enums/resources';

export const uploadModule = {

  async getPresignedUrl() {
    const authStore = useAuthStore();
    const shopId = authStore.getUser?.shop?.id;
    return await useCustomFetch.get<GetPresignedUrlData>(`${RESOURCES.UPLOAD}?shop_id=${shopId}`);
  },
};
