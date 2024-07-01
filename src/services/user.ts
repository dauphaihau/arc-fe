import type { MutationOptions } from '@tanstack/vue-query';
import { RESOURCES } from '~/config/enums/resources';
import type { User, UpdateUserBody } from '~/types/user';
import type { GetListResponse, RequestGetListParams } from '~/types/common';
import type { CreateBodyUserAddressBody, UserAddress } from '~/types/user-address';

export function useUpdateUser() {
  return useMutation({
    mutationKey: ['update-user'],
    mutationFn: async (body: UpdateUserBody) => {
      return await useCustomFetchTemp.patch<{ user: User }>(
        RESOURCES.USER,
        body
      );
    },
  });
}

export function useGetUserAddresses(queryParams?: RequestGetListParams) {
  return useQuery({
    enabled: !!queryParams,
    queryKey: ['get-user-addresses', queryParams],
    queryFn: () => {
      return useCustomFetchTemp.get<GetListResponse<UserAddress>>(
        `${RESOURCES.USER}${RESOURCES.ADDRESSES}`,
        queryParams || undefined
      );
    },
  });
}

export function useCreateUserAddress() {
  return useMutation({
    mutationKey: ['create-user-address'],
    mutationFn: async (body: CreateBodyUserAddressBody) => {
      return await useCustomFetchTemp.post<{ address: UserAddress }>(
        `${RESOURCES.USER}${RESOURCES.ADDRESSES}`,
        body
      );
    },
  });
}

export function useUpdateUserAddress() {
  return useMutation({
    mutationKey: ['update-user-address'],
    mutationFn: async (body: Partial<UserAddress>) => {
      const { id, ...resBody } = body;
      return await useCustomFetchTemp.patch<{ address: UserAddress }>(
        `${RESOURCES.USER}${RESOURCES.ADDRESSES}/${id}`,
        resBody
      );
    },
  });
}

export function useDeleteUserAddress(
  options?: MutationOptions<unknown, unknown, UserAddress['id'], unknown>
) {
  return useMutation({
    mutationKey: ['delete-user-address'],
    mutationFn: async (id: UserAddress['id']) => {
      return await useCustomFetchTemp.delete(
        `${RESOURCES.USER}${RESOURCES.ADDRESSES}/${id}`
      );
    },
    ...options,
  });
}
