import dayjs from 'dayjs';
import type { IUser, IUserPopulated } from '~/interfaces/user';
import { RESOURCES } from '~/config/enums/resources';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import type { IShop } from '~/interfaces/shop';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as IUserPopulated | IUser | null | undefined,
    tokenResetPassword: '',
    emailRequestForgetPassword: '',
  }),
  getters: {
    getUser: state => state.user,
    getShop: state => state.user?.shop as IShop,
    isLogged: state => !!state.user,
    isOwnedShop: state => !!state.user?.shop,
  },
  actions: {
    async getCurrentUser() {
      const res = await useCustomFetchTemp.get<{ user: IUser }>(`${RESOURCES.USER}/me`);
      this.user = res.user;
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
