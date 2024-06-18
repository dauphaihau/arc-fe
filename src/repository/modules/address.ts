import { RESOURCES } from '~/config/enums/resources';
import type {
  CreateBodyAddress, IAddress, ResponseGetStatesByCountry, ResponseGetCountries
} from '~/interfaces/address';
import type { ErrorServer, GetListResponse, RequestGetListParams } from '~/interfaces/common';

export class AddressModule {
  createAddress(body: CreateBodyAddress) {
    return useAsyncData<{ address: IAddress }, ErrorServer>(
      'createAddress',
      () => useCustomOFetch.post(RESOURCES.USER + RESOURCES.ADDRESSES, body)
    );
  }

  async getAddresses(queryParams?: RequestGetListParams) {
    return await useCustomFetch.get<GetListResponse<IAddress>>(
      RESOURCES.USER + RESOURCES.ADDRESSES,
      queryParams || undefined
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

  getCountries() {
    return useFetch<ResponseGetCountries>('https://countriesnow.space/api/v0.1/countries/iso', {
      method: 'get',
    });
  }

  getStatesByCountry(country: string) {
    return useFetch<ResponseGetStatesByCountry>('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'post',
      body: {
        country,
      },
    });
  }
}
