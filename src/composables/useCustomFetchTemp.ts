import dayjs from 'dayjs';
import type { SearchParameters } from 'ofetch';
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import { StatusCodes } from 'http-status-codes';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import { RESOURCES } from '~/config/enums/resources';

const baseCustomFetch = async <
  DefaultT = unknown,
  DefaultR extends NitroFetchRequest = NitroFetchRequest,
  T = DefaultT,
  R extends NitroFetchRequest = DefaultR,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>
>(
  url: R,
  options?: O
) => {
  const config = useRuntimeConfig();
  return $fetch<T>(url, {
    baseURL: `${config.public.apiBaseURL}/v${config.public.apiVersion}`,
    credentials: 'include',
    ...options,
  });
};

const checkAccessAndRefreshToken = async () => {
  const refreshTokenExp = localStorage[LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXP];
  const accessTokenExp = localStorage[LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXP];
  if (!refreshTokenExp && !accessTokenExp) {
    return;
  }
  const authStore = useAuthStore();
  const isRefreshTokenValid = dayjs(refreshTokenExp).isValid();
  const isRefreshTokenExpired = dayjs().isAfter(dayjs(refreshTokenExp));
  if (!isRefreshTokenValid || isRefreshTokenExpired) {
    authStore.clearAll();
    return;
  }
  const isAccessTokenExpired = dayjs().isAfter(dayjs(accessTokenExp));
  if (isAccessTokenExpired) {
    await baseCustomFetch(`${RESOURCES.AUTH}/refresh-tokens`, {
      method: 'post',
      onResponse: ({ response }) => {
        if (response.status === StatusCodes.OK) {
          authStore.setExpTokens();
        }
        else {
          authStore.clearAll();
          throw new Error('Refresh token failed');
        }
      },
    });
  }
};

type TBody = NitroFetchOptions<NitroFetchRequest>['body'];
type TOptions = NitroFetchOptions<NitroFetchRequest>;

export const useCustomFetchTemp = {
  get: async <T>(url: string, params?: SearchParameters, option?: TOptions) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'get', params, ...option });
  },

  post: async <T>(url: string, body?: TBody, option?: TOptions) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'post', body, ...option });
  },

  put: async <T>(url: string, body?: TBody, option?: TOptions) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'put', body, ...option });
  },

  patch: async <T>(url: string, body?: TBody, option?: TOptions) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, { method: 'patch', body, ...option });
  },

  delete: async <T>(
    url: string,
    params?: SearchParameters,
    body?: TBody,
    option?: TOptions
  ) => {
    await checkAccessAndRefreshToken();
    return await baseCustomFetch<T>(url, {
      method: 'delete', params, body, ...option,
    });
  },
};
