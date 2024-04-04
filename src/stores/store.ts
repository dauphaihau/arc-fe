import { useStorage } from '@vueuse/core';
import type { IUser } from '~/interfaces/user';
import type { IExchangeRate } from '~/config/enums/local-storage-keys';
import { MARKET_CONFIG } from '~/config/enums/market';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';

export const useStore = defineStore('store', {
  state: () => ({
    user_preferences: null as IUser['market_preferences'] | null,
    rates: null as IExchangeRate['rates'] | null,
  }),
  getters: {},
  actions: {
    async getExchangeRates() {
      const { data, error } = await useFetch<{ rates: IExchangeRate['rates'], time_next_update_unix: number }>(
        `https://open.er-api.com/v6/latest/${MARKET_CONFIG.BASE_CURRENCY}`
      );
      if (!error.value && data.value) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.EXCHANGE_RATE);
        useStorage<IExchangeRate>(LOCAL_STORAGE_KEYS.EXCHANGE_RATE, {
          exp: data.value.time_next_update_unix * 1000,
          rates: data.value.rates,
        });
        this.rates = data.value.rates;
      }
    },

  },
});
