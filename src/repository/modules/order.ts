import { RESOURCES } from '~/config/enums/resources';
import type { CreateOrderPayload } from '~/interfaces/order';

export class OrderModule {
  async createOrder(payload: CreateOrderPayload) {
    return await useCustomFetch.post<{checkoutSessionUrl: string}>(
      `${RESOURCES.USER}${RESOURCES.ORDERS}`,
      payload
    );
  }
}
