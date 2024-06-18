import type { NitroFetchOptions } from 'nitropack';
import { RESOURCES } from '~/config/enums/resources';
import type { IUser, UpdateUserBody } from '~/interfaces/user';

export function useUpdateUser(
  options?: NitroFetchOptions<never>
) {
  return useMutation({
    mutationKey: ['update-user'],
    mutationFn: async (body: UpdateUserBody) => {
      return await useCustomFetchTemp.patch<{ user: IUser }>(
        RESOURCES.USER,
        body,
        options
      );
    },
  });
}
