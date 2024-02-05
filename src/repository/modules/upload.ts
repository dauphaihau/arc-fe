import type { GetPresignedUrlData } from '~/interfaces/upload';
import { RESOURCES } from '~/config/enums/resources';

export class UploadModule {
  private shopId: string | undefined;

  constructor() {
    useRouter().beforeEach(() => {
      const authStore = useAuthStore();
      this.shopId = authStore.getUser?.shop?.id;
    });
  }

  async getPresignedUrl() {
    return await useCustomFetch.get<GetPresignedUrlData>(
      `${RESOURCES.UPLOAD}?shop_id=${this.shopId}`
    );
  }
}
