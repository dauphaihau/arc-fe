import { ROUTES } from '~/config/enums/routes';
import { useGetCurrentUser } from '~/services/user';

export default defineNuxtRouteMiddleware(() => {
  const { data } = useGetCurrentUser();

  if (!data.value?.user) {
    return navigateTo(ROUTES.HOME);
  }
});
