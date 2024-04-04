import type { IExchangeRate } from '~/config/enums/local-storage-keys';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import { MARKET_CONFIG } from '~/config/enums/market';
import type { IUser } from '~/interfaces/user';

// default rates
const ratesDefault = {
  AUD: 1.534853,
  CAD: 1.354354,
  EUR: 0.926206,
  HKD: 7.825841,
  JPY: 151.346196,
  SGD: 1.349651,
  TWD: 31.979005,
  KRW: 1349,
  GBP: 0.7919,
  VND: 24803,
};


export default function (amount: number | any) {
  const store = useStore();

  const rates = parseJSON<IExchangeRate>(
    localStorage[LOCAL_STORAGE_KEYS.EXCHANGE_RATE]
  )?.rates || store.rates || ratesDefault;

  const currency = parseJSON<IUser['market_preferences']>(
    localStorage[LOCAL_STORAGE_KEYS.USER_PREFERENCES]
  )?.currency || store.user_preferences?.currency || MARKET_CONFIG.BASE_CURRENCY;

  if (typeof amount !== 'number') {
    return amount;
  }
  if (currency === MARKET_CONFIG.BASE_CURRENCY) {
    return formatCurrency(amount);
  }
  const rate = rates[currency];
  const convertedAmount = rate * amount;
  return formatCurrency(convertedAmount, currency);
}
