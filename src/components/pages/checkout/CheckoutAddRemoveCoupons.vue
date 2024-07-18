<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import { FetchError } from 'ofetch';
import { consola } from 'consola';
import { useCartStore } from '~/stores/cart';
import { toastCustom } from '~/config/toast';
import { useMutateSummaryOder } from '~/services/order';
import { COUPON_CONFIG } from '~/config/enums/coupon';
import type { Coupon } from '~/types/coupon';

const toast = useToast();
const cartStore = useCartStore();
const queryClient = useQueryClient();

const getSummaryOrderBody = computed(() => {
  return {
    inventory: cartStore.stateCheckoutNow.product.inventory,
    quantity: cartStore.stateCheckoutNow.product.quantity,
  };
});

const state = reactive({
  showAddCouponInput: cartStore.stateCheckoutNow.product.coupon_codes.length > 0,
  code: '',
  errorMsg: '',
});

const {
  isPending: isPendingMutateSummaryOder,
  mutateAsync: mutateSummaryOder,
} = useMutateSummaryOder();

const addCoupon = async () => {
  state.errorMsg = '';

  const errorMsg = cartStore.stateCheckoutNow.invalidCodes.get(state.code);
  if (errorMsg) {
    state.errorMsg = errorMsg;
    return;
  }
  const product = cartStore.stateCheckoutNow.product;
  if (!product?.inventory) {
    return;
  }
  const tempCodes = [...product.coupon_codes, state.code];
  try {
    const { summaryOrder } = await mutateSummaryOder({
      inventory: product.inventory,
      quantity: product.quantity,
      coupon_codes: tempCodes,
    });
    state.code = '';
    product.coupon_codes = tempCodes;
    queryClient.setQueryData(
      ['get-summary-oder', getSummaryOrderBody.value],
      { summaryOrder }
    );
  }
  catch (error) {
    if (error instanceof FetchError) {
      switch (error.status) {
        case StatusCodes.NOT_FOUND:
          state.errorMsg = 'Coupon code not found';
          cartStore.stateCheckoutNow.invalidCodes.set(state.code, state.errorMsg);
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
  const product = cartStore.stateCheckoutNow.product;
  if (!product?.inventory) {
    consola.error('inventory is null');
    return;
  }
  const filtered = product.coupon_codes.filter(c => c !== code);
  try {
    const { summaryOrder } = await mutateSummaryOder({
      inventory: product.inventory,
      quantity: product.quantity,
      coupon_codes: filtered,
    });
    queryClient.setQueryData(['get-summary-oder', getSummaryOrderBody.value], {
      summaryOrder,
    });
    product.coupon_codes = filtered;
  }
  catch (error) {
    toast.add({
      ...toastCustom.error,
      title: 'Delete coupon failed',
    });
  }
};

const toggleShowAddCouponInput = async () => {
  state.showAddCouponInput = !state.showAddCouponInput;
  if (!state.showAddCouponInput) {
    const product = cartStore.stateCheckoutNow.product;
    if (!product?.inventory) {
      consola.error('inventory is null');
      return;
    }
    try {
      const { summaryOrder } = await mutateSummaryOder({
        inventory: product.inventory,
        quantity: product.quantity,
        coupon_codes: [],
      });
      queryClient.setQueryData(['get-summary-oder', getSummaryOrderBody], {
        summaryOrder,
      });
      product.coupon_codes = [];
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
  return isPendingMutateSummaryOder.value ||
    cartStore.stateCheckoutNow.product.coupon_codes.includes(state.code) ||
    !state.code;
});

const disabledInput = computed(() => {
  return cartStore.stateCheckoutNow.product.coupon_codes.length === COUPON_CONFIG.MAX_USE_PER_ORDER;
});
</script>

<template>
  <UButton
    variant="ghost"
    icon="i-heroicons-ticket"
    color="gray"
    class="w-fit"
    :disabled="cartStore.stateCheckoutNow.isPendingCreateOrder"
    @click="toggleShowAddCouponInput"
  >
    Apply shop coupon codes
  </UButton>

  <div
    v-if="state.showAddCouponInput"
    class="mb-4 flex gap-3"
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
          v-uppercase
          :disabled="disabledInput || cartStore.stateCheckoutNow.isPendingCreateOrder"
        />
        <UButton
          color="gray"
          variant="solid"
          :disabled="disabledAddBtn || cartStore.stateCheckoutNow.isPendingCreateOrder"
          @click="addCoupon"
        >
          Add
        </UButton>
      </UButtonGroup>
    </UFormGroup>

    <div
      v-if="cartStore.stateCheckoutNow.product.coupon_codes.length > 0"
      class="flex gap-3"
    >
      <div
        v-for="(code, index) of cartStore.stateCheckoutNow.product.coupon_codes"
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
            :disabled="isPendingMutateSummaryOder || cartStore.stateCheckoutNow.isPendingCreateOrder"
            icon="i-heroicons-x-mark-20-solid"
            :ui="{ rounded: 'rounded-full' }"
            @click="() => deleteCoupon(code)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
