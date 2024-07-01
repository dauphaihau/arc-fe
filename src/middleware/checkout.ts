import { ROUTES } from '~/config/enums/routes';

export default defineNuxtRouteMiddleware(() => {
  const cartStore = useCartStore();
  if (!cartStore.stateCheckoutNow?.product?.id) {
    return navigateTo(ROUTES.HOME);
  }
});
