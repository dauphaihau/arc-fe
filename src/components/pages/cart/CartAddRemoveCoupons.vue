<script setup lang="ts">
/*
  use in cart, cart/checkout page
 */

import { StatusCodes } from 'http-status-codes';
import { FetchError } from 'ofetch';
import consola from 'consola';
import { type AdditionInfoOrderShops, useCartStore } from '~/stores/cart';
import { COUPON_CONFIG } from '~/config/enums/coupon';
import type { Shop } from '~/types/shop';
import { useCalcSummaryOrder } from '~/services/cart';
import type { ResponseGetCart } from '~/types/cart';
import { toastCustom } from '~/config/toast';
import type { Coupon } from '~/types/coupon';

const { shopId } = defineProps<{
  shopId: Shop['id']
}>();

const cartStore = useCartStore();
const queryClient = useQueryClient();
const toast = useToast();

const state = reactive({
  showAddCouponCodeInput: false,
  code: '',
  codes: [] as Coupon['code'][],
  invalidCodes: [] as Coupon['code'][],
  errorMsg: '',
});

onMounted(() => {
  const additionInfoOrderShop = cartStore.additionInfoOrderShops.get(shopId);
  if (additionInfoOrderShop && additionInfoOrderShop.coupon_codes.length > 0) {
    state.codes = additionInfoOrderShop.coupon_codes;
    state.showAddCouponCodeInput = true;
  }
});

const {
  mutateAsync: calcSummaryOrder,
  isPending: isPendingCalcSummaryOrder,
} = useCalcSummaryOrder();

const addCoupon = async () => {
  state.errorMsg = '';
  state.code = state.code.toUpperCase();

  if (state.invalidCodes.length > 0 && state.invalidCodes.includes(state.code)) {
    state.errorMsg = 'Coupon code not found';
    return;
  }

  // clone additionInfoOrderShops
  const tempAdditionInfoOrderShops = new Map<AdditionInfoOrderShops['key'], AdditionInfoOrderShops['value']>(
    JSON.parse(JSON.stringify([...cartStore.additionInfoOrderShops]))
  );

  const tempAdditionInfoOrderShop = tempAdditionInfoOrderShops.get(shopId);
  if (!tempAdditionInfoOrderShop) {
    consola.error('tempAdditionInfoOrderShop be undefined');
    return;
  }
  tempAdditionInfoOrderShop.coupon_codes.push(state.code);

  const additionInfoOrderShop = Array.from(tempAdditionInfoOrderShops).map(([keyShopId, value]) => ({
    shop: keyShopId,
    coupon_codes: value.coupon_codes,
  }));

  try {
    const { summaryOrder } = await calcSummaryOrder(additionInfoOrderShop);

    const cacheGetCart = queryClient.getQueryData<ResponseGetCart>(['get-cart']);
    if (cacheGetCart?.summaryOrder) {
      cacheGetCart.summaryOrder = summaryOrder;
      queryClient.setQueryData(['get-cart'], cacheGetCart);
      cartStore.stateCheckoutCart.keyRefreshCartSummaryOrderComp++;
    }
    cartStore.additionInfoOrderShops.set(shopId, tempAdditionInfoOrderShop);
    state.codes = tempAdditionInfoOrderShop.coupon_codes;
    state.code = '';
  }
  catch (error) {
    if (error instanceof FetchError) {
      switch (error.status) {
        case StatusCodes.NOT_FOUND:
          state.errorMsg = 'Coupon code not found';
          state.invalidCodes.push(state.code);
          break;
        case StatusCodes.UNPROCESSABLE_ENTITY:
          toast.add({
            ...toastCustom.error,
            title: error.data.message,
          });
          break;
        default:
          toast.add({
            ...toastCustom.error,
            title: 'Add coupon failed',
          });
      }
    }
  }
};

const deleteCoupon = async (code: Coupon['code']) => {
  const tempAdditionInfoOrderShops = new Map<AdditionInfoOrderShops['key'], AdditionInfoOrderShops['value']>(
    JSON.parse(JSON.stringify([...cartStore.additionInfoOrderShops]))
  );
  const tempAdditionInfoOrderShop = tempAdditionInfoOrderShops.get(shopId);

  if (!tempAdditionInfoOrderShop) {
    consola.error('tempAdditionInfoOrderShop be undefined');
    return;
  }
  tempAdditionInfoOrderShop.coupon_codes = tempAdditionInfoOrderShop.coupon_codes.filter(c => c !== code);

  const additionInfoOrderShops = Array.from(tempAdditionInfoOrderShops).map(([keyShopId, value]) => ({
    shop: keyShopId,
    coupon_codes: value.coupon_codes,
  }));

  try {
    const { summaryOrder } = await calcSummaryOrder(additionInfoOrderShops);
    const cacheGetCart = queryClient.getQueryData<ResponseGetCart>(['get-cart']);
    const additionInfoOrderShop = tempAdditionInfoOrderShops.get(shopId);

    if (cacheGetCart?.summaryOrder && additionInfoOrderShop) {
      cartStore.additionInfoOrderShops.set(shopId, additionInfoOrderShop);

      cacheGetCart.summaryOrder = summaryOrder;
      queryClient.setQueryData(['get-cart'], cacheGetCart);
      cartStore.stateCheckoutCart.keyRefreshCartSummaryOrderComp++;
    }
    state.codes = tempAdditionInfoOrderShop.coupon_codes;
  }
  catch (e) {
    toast.add({
      ...toastCustom.error,
      title: 'Delete coupon failed',
    });
  }
};

const toggleShowAddCouponInput = async () => {
  state.showAddCouponCodeInput = !state.showAddCouponCodeInput;
  if (!state.showAddCouponCodeInput) {
    const tempAdditionInfoOrderShops = new Map<AdditionInfoOrderShops['key'], AdditionInfoOrderShops['value']>(
      JSON.parse(JSON.stringify([...cartStore.additionInfoOrderShops]))
    );
    const tempAdditionInfoOrderShop = tempAdditionInfoOrderShops.get(shopId);

    if (!tempAdditionInfoOrderShop) {
      consola.error('tempAdditionInfoOrderShop be undefined');
      return;
    }
    tempAdditionInfoOrderShop.coupon_codes = [];

    const additionInfoOrderShops = Array.from(tempAdditionInfoOrderShops).map(([keyShopId, value]) => ({
      shop: keyShopId,
      coupon_codes: value.coupon_codes,
    }));
    try {
      const { summaryOrder } = await calcSummaryOrder(additionInfoOrderShops);
      const cacheGetCart = queryClient.getQueryData<ResponseGetCart>(['get-cart']);
      const additionInfoOrderShop = tempAdditionInfoOrderShops.get(shopId);

      if (cacheGetCart?.summaryOrder && additionInfoOrderShop) {
        cartStore.additionInfoOrderShops.set(shopId, additionInfoOrderShop);

        cacheGetCart.summaryOrder = summaryOrder;
        queryClient.setQueryData(['get-cart'], cacheGetCart);
        cartStore.stateCheckoutCart.keyRefreshCartSummaryOrderComp++;
      }
      state.codes = [];
    }
    catch (error) {
      toast.add({
        ...toastCustom.error,
        title: 'Delete all coupons failed',
      });
    }
  }
};

const disabledAddBtn = computed(() => {
  return isPendingCalcSummaryOrder.value ||
    state.codes.length === COUPON_CONFIG.MAX_USE_PER_ORDER ||
    state.codes.includes(state.code) ||
    !state.code;
});
</script>

<template>
  <div>
    <UButton
      variant="ghost"
      icon="i-heroicons-ticket"
      color="gray"
      class="mb-1 w-fit"
      @click="toggleShowAddCouponInput"
    >
      Apply shop coupon codes
    </UButton>

    <div
      v-if="state.showAddCouponCodeInput"
      class="flex gap-3"
    >
      <UFormGroup
        required
        name="code"
        :error="state.errorMsg"
      >
        <UButtonGroup
          size="lg"
          orientation="horizontal"
        >
          <UInput
            v-model="state.code"
            :disabled="state.codes.length === COUPON_CONFIG.MAX_USE_PER_ORDER"
            :ui="{
              base: 'uppercase',
            }"
          />
          <UButton
            color="gray"
            variant="solid"
            :disabled="disabledAddBtn"
            @click="addCoupon"
          >
            Add
          </UButton>
        </UButtonGroup>
      </UFormGroup>

      <div
        v-if="state.codes && state.codes.length > 0"
        class="flex gap-3"
      >
        <div
          v-for="(code, index) of state.codes"
          :key="index"
        >
          <div class="relative">
            <UButton
              color="gray"
              size="lg"
            >
              {{ code }}
            </UButton>
            <UButton
              class="absolute -right-2 -top-3 z-[1]"
              size="2xs"
              color="gray"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              :ui="{ rounded: 'rounded-full' }"
              @click="() => deleteCoupon(code)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
