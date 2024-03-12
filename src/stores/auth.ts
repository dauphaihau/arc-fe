import dayjs from 'dayjs';
import type { IUser, LoginBody, RegisterBody } from '~/interfaces/user';
import { TOKEN_TYPES, KEY_LS_ACCESS_TOKEN, KEY_LS_REFRESH_TOKEN } from '~/config/enums/token';
import { ROUTES } from '~/config/enums/routes';
import { RESOURCES } from '~/config/enums/resources';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as IUser | null,
    tokenResetPassword: '',
    showLoginDialog: false,
  }),
  getters: {
    getUser: state => state.user,
    getShop: state => state.user?.shop,
    isLogged: state => !!state.user,
    isOwnedShop: state => !!state.user?.shop,
  },
  actions: {

    async getCurrentUser() {
      const { data } = await useCustomFetch.get<{ user: IUser }>(`${RESOURCES.USER}/me`);
      this.afterUserAuthenticated(data.value?.user);
    },

    async register(body: RegisterBody) {
      const response = await useAsyncData<{ user: IUser }, ErrorServer>(
        'register',
        () => useCustomOFetch.post(`${RESOURCES.AUTH}/register`, body)
      );
      this.afterUserAuthenticated(response.data.value?.user);
      return response;
    },

    async login(payload: LoginBody) {
      const response = await useAsyncData<{ user: IUser }, ErrorServer>(
        'login',
        () => useCustomOFetch.post(`${RESOURCES.AUTH}/login`, payload)
      );
      this.afterUserAuthenticated(response.data.value?.user);
      return response;
    },

    async forgetPassword(email: IUser['email']) {
      return await useAsyncData<{}, ErrorServer>(
        'forget-password',
        () => useCustomOFetch.post(`${RESOURCES.AUTH}/forgot-password`, { email })
      );
    },

    async verifyToken() {
      const route = useRoute();
      const response = await useAsyncData<{}, ErrorServer>(
        'verifyToken',
        () => useCustomOFetch.get(
          `${RESOURCES.AUTH}/verify-token?token=${route.query.t}&type=${TOKEN_TYPES.RESET_PASSWORD}`
        )
      );
      if (!response.error.value) {
        this.tokenResetPassword = route.query.t as string;
      }
      return response;
    },

    async resetPassword(password: IUser['password']) {
      const response = await useAsyncData<{ user: IUser }, ErrorServer>(
        'reset-password',
        () => useCustomOFetch.post(`${RESOURCES.AUTH}/reset-password`,
          { password },
          {
            query: { token: this.tokenResetPassword },
          }
        )
      );
      const user = response.data.value?.user;
      if (user) {
        this.afterUserAuthenticated(user);
        this.tokenResetPassword = '';
      }
      return response;
    },

    async logout() {
      const { status } = await useCustomFetch.post(`${RESOURCES.AUTH}/logout`);
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
    afterUserAuthenticated(user?: IUser) {
      if (!user) {
        return;
      }
      this.user = user;
      const config = useRuntimeConfig();
      localStorage[KEY_LS_ACCESS_TOKEN] = dayjs().add(Number(config.public.accessTokenExpirationMins), 'minutes');
      localStorage[KEY_LS_REFRESH_TOKEN] = dayjs().add(Number(config.public.refreshTokenExpirationDays), 'minutes');
    },
  },
});
