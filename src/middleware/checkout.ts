import { ROUTES } from '~/config/enums/routes';

export default defineNuxtRouteMiddleware(() => {
  const cartStore = useCartStore();

  if (!cartStore.productCheckoutNow) {
    return navigateTo(ROUTES.HOME);
  }
});
