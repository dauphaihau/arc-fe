import { ROUTES } from '~/config/enums/routes';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import { useGetCurrentUser } from '~/services/user';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { refetch, data } = useGetCurrentUser();

  if (!data.value?.user && localStorage[LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXP]) {
    await refetch();
  }

  if (data.value?.user && [ROUTES.RESET].includes(to.path as ROUTES)) {
    return navigateTo(ROUTES.HOME);
  }
});
