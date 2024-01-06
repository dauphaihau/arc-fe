import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import type { FormError } from '@nuxt/ui/dist/runtime/types';
import type { IUser, LoginPayloadType, RegisterPayloadType } from '~/interfaces/user';
import { TOKEN_TYPES, KEY_LS_ACCESS_TOKEN, KEY_LS_REFRESH_TOKEN } from '~/config/enums/token';
import { ROUTES } from '~/config/enums/routes';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as IUser | null,
    tokenResetPassword: '',
  }),
  getters: {
    getUser: state => state.user,
    getShop: state => state.user?.shop,
    isLogged: state => !!state.user,
    isOwnedShop: state => !!state.user?.shop,
  },
  actions: {
    async getCurrentUser() {
      const { data } = await useCustomFetch.get<{ user: IUser }>('/user/me');
      if (data.value?.user) {
        this.user = data.value?.user;
      } else {
        navigateTo(ROUTES.HOME);
      }
    },
    async register(payload: RegisterPayloadType): Promise<FormError | null> {
      const { data, error } = await useAsyncData<{ user: IUser }, ErrorServer>(
        'login',
        () => useCustomOFetch.post('/auth/register', payload)
      );
      if (error.value) {
        if (error.value.data.code === StatusCodes.CONFLICT) {
          return { path: 'email', message: error.value.data.message };
        }
        return { path: '', message: error.value.data.message || 'An unknown error occurred. Please try again' };
      }
      if (data.value?.user) {
        this.afterUserAuthenticated(data.value.user);
      }
      return null;
    },
    async login(payload: LoginPayloadType): Promise<string> {
      const { data, error } = await useAsyncData<{ user: IUser }, ErrorServer>(
        'register',
        () => useCustomOFetch.post('/auth/login', payload)
      );
      if (error.value) {
        return error.value.data.message || 'An unknown error occurred. Please try again';
      }
      if (data.value?.user) {
        this.afterUserAuthenticated(data.value.user);
      }
      return '';
    },
    async forgetPassword(email: IUser['email']): Promise<string> {
      const { error } = await useAsyncData<{}, ErrorServer>(
        'forget-password',
        () => useCustomOFetch.post('/auth/forgot-password', { email })
      );
      if (error.value) {
        return error.value.data.message || 'An unknown error occurred. Please try again';
      }
      return '';
    },
    async verifyToken(): Promise<boolean> {
      const route = useRoute();
      const { error } = await useAsyncData<{}, ErrorServer>(
        'verifyToken',
        () => useCustomOFetch.get(
          `/auth/verify-token?token=${route.query.t}&type=${TOKEN_TYPES.RESET_PASSWORD}`
        )
        // () => useCustomOFetch.get(`/auth/reset-password?token=${route.query.t}`)
      );
      if (error.value) {
        // return error.value.data.message || 'An unknown error occurred. Please try again';
        return false;
      }
      this.tokenResetPassword = route.query.t as string;
      return true;
    },
    async resetPassword(password: IUser['password']): Promise<string> {
      const { data, error } = await useAsyncData<{ user: IUser }, ErrorServer>(
        'forget',
        () => useCustomOFetch.post('/auth/reset-password',
          { password },
          {
            query: { token: this.tokenResetPassword },
          }
        )
      );
      if (error.value) {
        return error.value.data.message || 'An unknown error occurred. Please try again';
      }
      if (data.value?.user) {
        this.afterUserAuthenticated(data.value.user);
        this.tokenResetPassword = '';
      }
      return '';
    },
    async logout() {
      const { status } = await useCustomFetch.post('/auth/logout');
      if (status.value === 'success') {
        this.clearAll();
        navigateTo(ROUTES.HOME);
      }
    },
    clearAll() {
      localStorage.removeItem(KEY_LS_REFRESH_TOKEN);
      localStorage.removeItem(KEY_LS_ACCESS_TOKEN);
      this.user = null;
    },
    // login, register, reset-password
    afterUserAuthenticated(user?: IUser) {
      if (user) {
        this.user = user;
      }
      const config = useRuntimeConfig();
      localStorage[KEY_LS_ACCESS_TOKEN] = dayjs().add(Number(config.public.accessTokenExpirationMins), 'minutes');
      localStorage[KEY_LS_REFRESH_TOKEN] = dayjs().add(Number(config.public.refreshTokenExpirationDays), 'minutes');
    },
  },
});
