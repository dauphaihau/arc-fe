import { ROUTES } from '~/config/enums/routes';

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  if (!authStore.isLogged) {
    return navigateTo(ROUTES.HOME);
  }
});
