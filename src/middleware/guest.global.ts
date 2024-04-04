import { ROUTES } from '~/config/enums/routes';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const authStore = useAuthStore();

  if (!authStore.isLogged && localStorage[LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXP]) {
    await authStore.getCurrentUser();
  }

  if (authStore.isLogged && [ROUTES.RESET].includes(to.path as ROUTES)) {
    return navigateTo(ROUTES.HOME);
  }
});
