export enum LOCAL_STORAGE_KEYS {
  EXCHANGE_RATE = 'exchange-rate',
  USER_PREFERENCES = 'user-preferences',
  IP_DATA = 'ip-data',
  ACCESS_TOKEN_EXP = '1k2l3n1k',
  REFRESH_TOKEN_EXP = '12kk31kaak'
}

export interface IExchangeRate {
  rates: { [key: string]: number }
  exp: number
}

export type IIpData = Record<
  'emoji_flag' | 'region' | 'city' | 'country_name', string
> & {
  currency: {
    code: string
  }
} | undefined
