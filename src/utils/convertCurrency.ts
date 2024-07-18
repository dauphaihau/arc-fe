import { MARKET_CONFIG } from '~/config/enums/market';
import { useGetCurrentUser } from '~/services/user';

const tempRates = {
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

export default function (amount: number | unknown) {
  if (typeof amount !== 'number') {
    return amount;
  }

  const marketStore = useMarketStore();
  const { data: dataUserAuth } = useGetCurrentUser();

  const rates = marketStore.exchangeRate?.rates || tempRates;

  const currency = dataUserAuth?.value?.user?.market_preferences?.currency ||
    marketStore.guestPreferences?.currency ||
    MARKET_CONFIG.BASE_CURRENCY;

  if (currency === MARKET_CONFIG.BASE_CURRENCY) {
    return formatCurrency(amount);
  }
  const rate = rates[currency];
  const convertedAmount = rate * amount;
  return formatCurrency(convertedAmount, currency);
}
