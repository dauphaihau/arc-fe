import { ROUTES } from '~/config/enums/routes';

export default defineNuxtRouteMiddleware(() => {
  const cartStore = useCartStore();

  if (!cartStore.summaryOrder) {
    return navigateTo(ROUTES.HOME);
  }
});
