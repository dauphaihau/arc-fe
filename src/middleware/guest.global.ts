import { KEY_LS_ACCESS_TOKEN } from '~/config/enums/token';
import { ROUTES } from '~/config/enums/routes';

export default defineNuxtRouteMiddleware((to, _from) => {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);

  if (!user.value && localStorage[KEY_LS_ACCESS_TOKEN]) {
    authStore.getCurrentUser();
  }

  if (user.value && [ROUTES.RESET].includes(to.path as ROUTES)) {
    return navigateTo(ROUTES.HOME);
  }
});
