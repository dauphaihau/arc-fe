import { RESOURCES } from '~/config/enums/resources';
import type {
  CreateBodyAddress, IAddress, ResponseGetStatesByCountry, ResponseGetCountries
} from '~/interfaces/address';
import type { GetListResponse, RequestGetListParams } from '~/interfaces/common';

export class AddressModule {
  async createAddress(body: CreateBodyAddress) {
    return await useAsyncData<{ address: IAddress }, ErrorServer>(
      'createAddress',
      () => useCustomOFetch.post(RESOURCES.USER + RESOURCES.ADDRESSES, body)
    );
  }

  async getAddresses(queryParams?: RequestGetListParams) {
    return await useCustomFetch.get<GetListResponse<IAddress>>(
      RESOURCES.USER + RESOURCES.ADDRESSES,
      queryParams || null
    );
  }

  async deleteAddress(addressId: IAddress['id']) {
    return await useCustomFetch.delete(
      `${RESOURCES.USER}${RESOURCES.ADDRESSES}/${addressId}`
    );
  }

  async updateAddress(addressUpdate: Partial<IAddress>) {
    const { id, ...body } = addressUpdate;
    delete body.user;
    return await useCustomFetch.patch<{ address: IAddress }>(
      `${RESOURCES.USER}${RESOURCES.ADDRESSES}/${id}`,
      body
    );
  }

  async getCountries() {
    return await useFetch<ResponseGetCountries>('https://countriesnow.space/api/v0.1/countries/iso', {
      method: 'get',
    });
  }

  async getStatesByCountry(country: string) {
    return await useFetch<ResponseGetStatesByCountry>('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'post',
      body: {
        country,
      },
    });
  }
}
