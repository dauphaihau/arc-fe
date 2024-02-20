import type { UseFetchOptions } from '#app';
import { defu } from 'defu';
import dayjs from 'dayjs';
import { KEY_LS_REFRESH_TOKEN, KEY_LS_ACCESS_TOKEN } from '~/config/enums/token';

type UrlType = string | Request | Ref<string | Request> | (() => string | Request)

export type HttpOption<T> = UseFetchOptions<T>

async function baseCustomFetch<T>(url: UrlType, options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig();

  const defaults: HttpOption<T> = {
    baseURL: `${config.public.apiBaseURL}` + `/v${config.public.apiVersion}`,
    credentials: 'include',
    server: false,
    // this overrides the default key generation, which includes a hash of
    // url, method, headers, etc. - this should be used with care as the key
    // is how Nuxt decides how responses should be deduplicated between
    // frontend and backend
    // key: url,

    // onRequest(_ctx) {
    // },
    //
    // onResponse(_ctx) {
    //   // _ctx.response._data = new myBusinessResponse(_ctx.response._data)
    // },

    // onResponse({ request, response, options }) {
    //   if (response._data.code !== 200) {
    //     console.log(response._data.message);
    //   }
    //   return response._data;
    // },

    // onResponseError(_ctx) {
    //   // throw new myBusinessError()
    // },
  };

  // for nice deep defaults, please use unjs/defu
  const params = defu(options, defaults);

  return await useFetch(url, params);
}

const checkAccessAndRefreshToken = async () => {
  const authStore = useAuthStore();
  if (!localStorage[KEY_LS_ACCESS_TOKEN] || !localStorage[KEY_LS_REFRESH_TOKEN]) {
    authStore.clearAll();
    return;
  }
  const refreshTokenExpired = dayjs().isAfter(dayjs(localStorage[KEY_LS_REFRESH_TOKEN]));
  if (refreshTokenExpired) {
    authStore.clearAll();
    return;
  }
  const accessTokenExpired = dayjs().isAfter(dayjs(localStorage[KEY_LS_ACCESS_TOKEN]));
  if (accessTokenExpired) {
    const { status, error } = await baseCustomFetch('/auth/refresh-tokens', { method: 'post' });
    if (status.value === 'success') {
      authStore.afterUserAuthenticated();
    } else {
      authStore.clearAll();
      throw new Error(error.value?.message);
    }
  }
};

export const useCustomFetch = {
  get: async <T>(url: UrlType, params?: any, option?: HttpOption<T>) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'get', params, ...option });
  },

  post: async <T>(url: UrlType, body?: any, option?: HttpOption<T>) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'post', body, ...option });
  },

  put: async <T>(url: UrlType, body?: any, option?: HttpOption<T>) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'put', body, ...option });
  },

  patch: async <T>(url: UrlType, body?: any, option?: HttpOption<T>) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'patch', body, ...option });
  },

  delete: async <T>(url: UrlType, params?: any, body?: any, option?: HttpOption<T>) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, {
      method: 'delete', params, body, ...option,
    });
  },
};
