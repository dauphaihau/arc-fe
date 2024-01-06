import { ROUTES } from '~/config/enums/routes';

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  if (authStore.isOwnedShop) {
    return navigateTo(`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.DASHBOARD}`);
  }
});
