import { KEY_LS_ACCESS_TOKEN } from '~/config/enums/token';
import { PATHS } from '~/config/enums/path';

export default defineNuxtRouteMiddleware((to, _from) => {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);

  if (!user.value && localStorage[KEY_LS_ACCESS_TOKEN]) {
    authStore.getCurrentUser();
  }

  if (user.value && [PATHS.RESET].includes(to.path as PATHS)) {
    return navigateTo(PATHS.HOME);
  }
});
