import { defu } from 'defu';
import dayjs from 'dayjs';
import type { SearchParameters } from 'ofetch';
import type { UseFetchOptions } from '#app';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import { RESOURCES } from '~/config/enums/resources';

async function baseCustomFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {}
) {
  const config = useRuntimeConfig();

  const defaults: UseFetchOptions<T> = {
    baseURL: `${config.public.apiBaseURL}/v${config.public.apiVersion}`,
    credentials: 'include',
    server: false,
  };

  // for nice deep defaults, please use unjs/defu
  const params = defu(options, defaults);

  // return await useFetch(url, params);
  return useFetch(url, params);
}

const checkAccessAndRefreshToken = async () => {
  const authStore = useAuthStore();
  const isRefreshTokenValid = dayjs(localStorage[LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXP]).isValid();
  const isRefreshTokenExpired = dayjs().isAfter(dayjs(localStorage[LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXP]));
  if (
    !localStorage[LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXP] ||
    !localStorage[LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXP] ||
    !isRefreshTokenValid ||
    isRefreshTokenExpired
  ) {
    authStore.clearAll();
    return;
  }
  const isAccessTokenExpired = dayjs().isAfter(dayjs(localStorage[LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXP]));
  if (isAccessTokenExpired) {
    const { status, error } = await baseCustomFetch(`${RESOURCES.AUTH}/refresh-tokens`, { method: 'post' });
    if (status.value === 'success') {
      authStore.setExpTokens();
    }
    else {
      authStore.clearAll();
      throw new Error(error.value?.message);
    }
  }
};

export const useCustomFetch = {
  get: async <T>(url: string, params?: SearchParameters, option?: UseFetchOptions<T>) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'get', params, ...option });
  },

  post: async <T>(url: string, body?: UseFetchOptions<T>['body'], option?: UseFetchOptions<T>) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'post', body, ...option });
  },

  put: async <T>(url: string, body?: UseFetchOptions<T>['body'], option?: UseFetchOptions<T>) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'put', body, ...option });
  },

  patch: async <T>(url: string, body?: UseFetchOptions<T>['body'], option?: UseFetchOptions<T>) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'patch', body, ...option });
  },

  delete: async <T>(
    url: string,
    params?: SearchParameters,
    body?: Record<string, unknown>,
    option?: UseFetchOptions<T>
  ) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, {
      method: 'delete', params, body, ...option,
    });
  },
};
