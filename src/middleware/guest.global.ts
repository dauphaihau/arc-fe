import { KEY_LS_ACCESS_TOKEN } from '~/config/enums/token';
import { ROUTES } from '~/config/enums/routes';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const authStore = useAuthStore();

  if (!authStore.isLogged && localStorage[KEY_LS_ACCESS_TOKEN]) {
    await authStore.getCurrentUser();
  }

  if (authStore.isLogged && [ROUTES.RESET].includes(to.path as ROUTES)) {
    return navigateTo(ROUTES.HOME);
  }
});
