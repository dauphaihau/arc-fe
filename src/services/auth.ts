import type { NitroFetchOptions } from 'nitropack';
import { StatusCodes } from 'http-status-codes';
import { RESOURCES } from '~/config/enums/resources';
import type { IUser, LoginBody, RegisterBody } from '~/interfaces/user';
import { TOKEN_TYPES } from '~/config/enums/token';
import { ROUTES } from '~/config/enums/routes';
import { toastCustom } from '~/config/toast';

export function useRegister(
  options?: NitroFetchOptions<never>
) {
  return useMutation({
    mutationKey: ['register'],
    mutationFn: (body: RegisterBody) => {
      return useCustomFetchTemp.post<{ user: IUser }>(
        `${RESOURCES.AUTH}/register`,
        body,
        options
      );
    },
  });
}

export function useLogin(
  options?: NitroFetchOptions<never>
) {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: (body: LoginBody) => {
      return useCustomFetchTemp.post<{ user: IUser }>(
        `${RESOURCES.AUTH}/login`,
        body,
        options
      );
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
        null,
        {
          onResponse: ({ response }) => {
            if (response.status === StatusCodes.OK) {
              authStore.clearAll();
              navigateTo(ROUTES.HOME);
            }
            else {
              toast.add({
                ...toastCustom.error,
                title: 'An unknown error occurred. Please try again',
              });
            }
          },
        }
      );
    },
  });
}

export function useForgetPassword(
  options?: NitroFetchOptions<never>
) {
  return useMutation({
    mutationKey: ['forget-password'],
    mutationFn: (email: IUser['email']) => {
      return useCustomFetchTemp.post(
        `${RESOURCES.AUTH}/forgot-password`,
        { email },
        options
      );
    },
  });
}

export function useVerifyToken(
  token?: string,
  options?: NitroFetchOptions<never>
) {
  return useQuery({
    queryKey: ['verify-token'],
    queryFn: () => {
      return useCustomFetchTemp.get(
        `${RESOURCES.AUTH}/verify-token?token=${token}&type=${TOKEN_TYPES.RESET_PASSWORD}`,
        undefined,
        options
      );
    },
    retry: false,
    enabled: !!token,
  });
}

export function useResetPassword(token: string) {
  return useMutation({
    mutationKey: ['reset-password'],
    mutationFn: (password: IUser['password']) => {
      return useCustomFetchTemp.post<{ user: IUser }>(
        `${RESOURCES.AUTH}/reset-password?token=${token}`,
        { password }
      );
    },
  });
}
