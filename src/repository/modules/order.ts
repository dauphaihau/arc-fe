import { RESOURCES } from '~/config/enums/resources';
import type {
  ISummaryOrder, GetSummaryOderBody, CreateOrderForBuyNowBody, CreateOrderFromCartBody
} from '~/interfaces/order';

export class OrderModule {
  async createOrderFromCart(body: CreateOrderFromCartBody) {
    return await useCustomFetch.post<{ checkoutSessionUrl: string }>(
      `${RESOURCES.USER}${RESOURCES.ORDERS}`,
      body
    );
  }

  async createOrderForBuyNow(body: CreateOrderForBuyNowBody) {
    return await useCustomFetch.put<{ checkoutSessionUrl: string }>(
      `${RESOURCES.USER}${RESOURCES.ORDERS}`,
      body
    );
  }

  async getSummaryOder(body: GetSummaryOderBody) {
    return await useCustomFetch.delete<{ summaryOrder: ISummaryOrder }>(
      `${RESOURCES.USER}${RESOURCES.ORDERS}`,
      undefined,
      body
    );
  }
}
