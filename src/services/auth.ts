import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import { RESOURCES } from '~/config/enums/resources';
import type { User } from '~/types/user';
import { TOKEN_TYPES } from '~/config/enums/token';
import { ROUTES } from '~/config/enums/routes';
import { toastCustom } from '~/config/toast';
import type {
  LoginBody, RegisterBody, UserAuthenticated
} from '~/types/auth';

export function useRegister() {
  const authStore = useAuthStore();

  return useMutation({
    mutationKey: ['register'],
    mutationFn: (body: RegisterBody) => {
      return useCustomFetchTemp.post<{ user: UserAuthenticated }>(
        `${RESOURCES.AUTH}/register`,
        body
      );
    },
    onSuccess: (data) => {
      if (data?.user) {
        authStore.user = data.user;
        authStore.setExpTokens();
      }
    },
  });
}

export function useLogin() {
  const authStore = useAuthStore();
  const cartStore = useCartStore();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: (body: LoginBody) => {
      return useCustomFetchTemp.post<{ user: UserAuthenticated }>(
        `${RESOURCES.AUTH}/login`,
        body
      );
    },
    onSuccess: (data) => {
      if (data?.user) {
        authStore.user = data.user;
        authStore.setExpTokens();
        cartStore.getCartHeader();
      }
    },
  });
}

export function useLogout() {
  const authStore = useAuthStore();
  const toast = useToast();

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: () => {
      return useCustomFetchTemp.post(
        `${RESOURCES.AUTH}/logout`,
        null
      );
    },
    onSuccess() {
      authStore.clearAll();
      navigateTo(ROUTES.HOME);
    },
    onError() {
      toast.add({
        ...toastCustom.error,
        title: 'An unknown error occurred. Please try again',
      });
    },
  });
}

export function useForgetPassword() {
  return useMutation({
    mutationKey: ['forget-password'],
    mutationFn: (email: User['email']) => {
      return useCustomFetchTemp.post(
        `${RESOURCES.AUTH}/forgot-password`,
        { email }
      );
    },
  });
}

export function useVerifyToken(
  token?: string,
  options?: NitroFetchOptions<NitroFetchRequest>
) {
  return useQuery({
    enabled: !!token,
    retry: false,
    queryKey: ['verify-token'],
    queryFn: () => {
      return useCustomFetchTemp.get(
        `${RESOURCES.AUTH}/verify-token?token=${token}&type=${TOKEN_TYPES.RESET_PASSWORD}`,
        undefined,
        options
      );
    },
  });
}

export function useResetPassword(token: string) {
  const authStore = useAuthStore();
  const cartStore = useCartStore();

  return useMutation({
    mutationKey: ['reset-password'],
    mutationFn: (password: User['password']) => {
      return useCustomFetchTemp.post<{ user: UserAuthenticated }>(
        `${RESOURCES.AUTH}/reset-password?token=${token}`,
        { password }
      );
    },
    onSuccess: (data) => {
      if (data?.user) {
        authStore.user = data.user;
        authStore.tokenResetPassword = '';
        authStore.setExpTokens();
        cartStore.getCartHeader();
      }
    },
  });
}
