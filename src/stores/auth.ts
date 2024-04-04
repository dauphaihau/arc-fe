import dayjs from 'dayjs';
import type {
  IUser, IUserPopulated, LoginBody, RegisterBody, UpdateUserBody
} from '~/interfaces/user';
import { TOKEN_TYPES } from '~/config/enums/token';
import { ROUTES } from '~/config/enums/routes';
import { RESOURCES } from '~/config/enums/resources';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import type { IShop } from '~/interfaces/shop';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as IUserPopulated | IUser | null | undefined,
    showLoginDialog: false,
    tokenResetPassword: '',
  }),
  getters: {
    getUser: state => state.user,
    getShop: state => state.user?.shop as IShop,
    isLogged: state => !!state.user,
    isOwnedShop: state => !!state.user?.shop,
  },
  actions: {

    async getCurrentUser() {
      const { data } = await useCustomFetch.get<{ user: IUser }>(`${RESOURCES.USER}/me`);
      this.user = data.value?.user;
    },

    async updateUser(body: UpdateUserBody) {
      const response = await useCustomFetch.patch<{ user: IUser }>(RESOURCES.USER, body);
      this.user = response.data.value?.user;
      return response;
    },

    async register(body: RegisterBody) {
      const response = await useAsyncData<{ user: IUser }, ErrorServer>(
        'register',
        () => useCustomOFetch.post(`${RESOURCES.AUTH}/register`, body)
      );
      this.user = response.data.value?.user;
      this.setExpTokens();
      return response;
    },

    async login(payload: LoginBody) {
      const response = await useAsyncData<{ user: IUser }, ErrorServer>(
        'login',
        () => useCustomOFetch.post(`${RESOURCES.AUTH}/login`, payload)
      );
      this.user = response.data.value?.user;
      this.setExpTokens();
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
        this.user = user;
        this.tokenResetPassword = '';
        this.setExpTokens();
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
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXP);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXP);
      this.$reset();
    },
    setExpTokens() {
      const config = useRuntimeConfig();
      localStorage[LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXP] = dayjs().add(Number(config.public.accessTokenExpirationMins), 'minutes');
      localStorage[LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXP] = dayjs().add(Number(config.public.refreshTokenExpirationDays), 'minutes');
    },
  },
});
