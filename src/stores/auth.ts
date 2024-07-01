import dayjs from 'dayjs';
import { RESOURCES } from '~/config/enums/resources';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import type { UserAuthenticated } from '~/types/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserAuthenticated | null,
    tokenResetPassword: '',
    emailRequestForgetPassword: '',
  }),
  getters: {
    isLogged: state => !!state.user,
    isOwnedShop: state => !!state.user?.shop,
  },
  actions: {
    async getCurrentUser() {
      const res = await useCustomFetchTemp.get<{ user: UserAuthenticated }>(`${RESOURCES.USER}/me`);
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
