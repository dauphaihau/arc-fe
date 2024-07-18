import { ROUTES } from '~/config/enums/routes';
import { useGetCurrentUser } from '~/services/user';

export default defineNuxtRouteMiddleware(() => {
  const { data } = useGetCurrentUser();

  if (data.value?.user?.shop?.id) {
    return navigateTo(`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.PRODUCTS}`);
    // return navigateTo(`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.DASHBOARD}`);
  }
});
