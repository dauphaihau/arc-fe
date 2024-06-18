import type { FetchOptions, SearchParameters } from 'ofetch';
import type { NitroFetchRequest } from 'nitropack';


const $api = <
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest>
(
  request: Parameters<typeof $fetch<T, R>>[0],
  opts?: Partial<Parameters<typeof $fetch<T, R>>[1]>
) => {
  const config = useRuntimeConfig();
  return $fetch<T, R>(request, {
    baseURL: `${config.public.apiBaseURL}/v${config.public.apiVersion}`,
    credentials: 'include',
    ...opts,
  });
};

export const useCustomOFetch = {
  get: <T>(url: string, params?: SearchParameters, options?: Omit<FetchOptions, 'method' | 'params'>) => {
    return $api<T>(url, { method: 'get', params, ...options });
  },
  post: <T>(url: string, body?: Record<string, unknown>, options?: Omit<FetchOptions, 'method' | 'body'>) => {
    return $api<T>(url, { method: 'post', body, ...options });
  },
  patch: <T>(url: string, body?: Record<string, unknown>, options?: Omit<FetchOptions, 'method' | 'body'>) => {
    return $api<T>(url, { method: 'patch', body, ...options });
  },
  delete: <T>(url: string, body?: Record<string, unknown>, options?: Omit<FetchOptions, 'method' | 'body'>) => {
    return $api<T>(url, { method: 'delete', body, ...options });
  },
};
