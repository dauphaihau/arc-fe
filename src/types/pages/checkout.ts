import type { Product, ProductInventory } from '~/types/product';
import type { PAYMENT_TYPES } from '~/config/enums/order';
import type { UserAddress } from '~/types/user-address';
import type { Coupon } from '~/types/coupon';

export enum CHECKOUT_NOW_STEPS { ADDRESS_SHIPPING, PAYMENT, REVIEW_CONFIRMATION, ORDER }

export type StateCheckoutNow = {
  currentStep: CHECKOUT_NOW_STEPS
  product: {
    quantity: number
    coupon_codes: string[]
    note: string
  } & Partial<{
    id: Product['id']
    inventory: ProductInventory['id']
    price: ProductInventory['price']
    stock: ProductInventory['stock']
    variantName1: string
    variantName2: string
  }>
  invalidCodes: Map<Coupon['code'], string>
  countRefreshConvertCurrency: number
  payment_type: PAYMENT_TYPES
  address: UserAddress | null
  loadingSubmit: boolean
};
