import type { PAYMENT_TYPES } from '~/config/enums/order';
import type { UserAddress } from '~/types/user-address';
import type { Coupon } from '~/types/coupon';
import type { Cart } from '~/types/cart';

export enum CHECKOUT_NOW_STEPS { ADDRESS_SHIPPING, PAYMENT, REVIEW_CONFIRMATION, ORDER }

export type StateCheckoutNow = {
  temp_cart_id?: Cart['id']
  currentStep: CHECKOUT_NOW_STEPS
  promo_codes: Coupon['code'][]
  note: string
  invalidCodes: Map<Coupon['code'], string>
  countRefreshConvertCurrency: number
  payment_type: PAYMENT_TYPES
  address: UserAddress | null
  isPendingCreateOrder: boolean
};
