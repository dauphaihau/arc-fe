<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import { useCartStore } from '~/stores/cart';
import { COUPON_CONFIG } from '~/config/enums/coupon';
import type { IShop } from '~/interfaces/shop';
import type { ILineItemOrder } from '~/interfaces/order';

const { $api } = useNuxtApp();
const cartStore = useCartStore();
const toast = useToast();

const { shopId } = defineProps<{
  shopId: IShop['id']
}>();

const state = reactive({
  showCodeInput: false,
  code: '',
  codes: [] as string[],
  invalidCodes: [] as string[],
  errorMsg: '',
});

onMounted(() => {
  const additionInfoItem = cartStore.mapAdditionInfoItems.get(shopId);
  if (additionInfoItem &&
    additionInfoItem?.coupon_codes &&
    additionInfoItem.coupon_codes.length > 0) {
    state.showCodeInput = true;
    state.codes = additionInfoItem.coupon_codes;
  }
});

const addCoupon = async () => {
  state.errorMsg = '';

  if (!state.code) {
    state.errorMsg = 'Required';
    return;
  }
  state.code = state.code.toUpperCase();

  if (state.invalidCodes.length > 0 && state.invalidCodes.includes(state.code)) {
    state.errorMsg = 'Code not found';
    return;
  }

  const tempAdditionInfoItems = new Map<string, Partial<Pick<ILineItemOrder, 'note' | 'coupon_codes'>>>();
  Array.from(cartStore.mapAdditionInfoItems).forEach(([keyShopId, value]) => {
    tempAdditionInfoItems.set(keyShopId, value);
  });

  const tempAdditionInfoItem = tempAdditionInfoItems.get(shopId);

  if (tempAdditionInfoItems.size === 0 || !tempAdditionInfoItem) {
    state.errorMsg = 'Something wrong';
    return;
  }
  const coupon_codes = tempAdditionInfoItem.coupon_codes;
  if (!coupon_codes) {
    state.errorMsg = 'Coupon codes not found';
    return;
  }

  if (coupon_codes.includes(state.code)) {
    state.errorMsg = 'Duplicate code';
  }
  else {
    coupon_codes.push(state.code);
  }

  if (!state.errorMsg) {
    const update = Array.from(tempAdditionInfoItems).map(([keyShopId, value]) => ({
      coupon_codes: value?.coupon_codes || [],
      shop: keyShopId,
    }));
    const { data, error } = await $api.cart.updateCouponsItem(update);
    if (error.value) {
      switch (error.value.statusCode) {
        case StatusCodes.NOT_FOUND:
          state.errorMsg = 'Code not found';
          state.invalidCodes.push(state.code);
          break;
        case StatusCodes.BAD_REQUEST:
          toast.add({
            title: error.value.data.message,
            icon: 'i-heroicons-x-circle',
            color: 'red',
          });
      }
    }
    else if (tempAdditionInfoItem) {
      cartStore.mapAdditionInfoItems.set(shopId, tempAdditionInfoItem);
      cartStore.summaryOrder = data.value?.summaryOrder || null;
      state.codes = tempAdditionInfoItem.coupon_codes || [];
      state.code = '';
    }
  }
};

const deleteCoupon = async (coupon: string) => {
  const additionInfoItem = cartStore.mapAdditionInfoItems.get(shopId);

  if (!additionInfoItem || !additionInfoItem?.coupon_codes) {
    state.errorMsg = 'Something wrong';
    return;
  }

  const filtered = additionInfoItem.coupon_codes.filter(cp => cp !== coupon);
  cartStore.mapAdditionInfoItems.set(shopId, {
    ...cartStore.mapAdditionInfoItems.get(shopId),
    coupon_codes: filtered,
  });

  const update = Array.from(cartStore.mapAdditionInfoItems).map(([keyShopId, value]) => ({
    shop: keyShopId,
    coupon_codes: value?.coupon_codes || [],
  }));
  const { data, error } = await $api.cart.updateCouponsItem(update);
  if (error.value) {
    toast.add({
      title: 'Something Wrong',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    });
  }
  else {
    cartStore.summaryOrder = data.value?.summaryOrder || null;
    state.codes = filtered || [];
  }
};

watch(() => state.showCodeInput, () => {
  if (!state.showCodeInput) {
    cartStore.mapAdditionInfoItems.set(shopId, {
      ...cartStore.mapAdditionInfoItems.get(shopId),
      coupon_codes: [],
    });
    state.codes = [];
    if (cartStore.summaryOrderPrev) {
      cartStore.summaryOrder = cartStore.summaryOrderPrev;
    }
  }
});
</script>

<template>
  <UButton
    variant="ghost"
    icon="i-heroicons-ticket"
    color="gray"
    class="w-fit"
    @click="() => state.showCodeInput = !state.showCodeInput"
  >
    Apply shop coupon codes
  </UButton>

  <div
    v-if="state.showCodeInput"
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
          :disabled="state.codes.length === COUPON_CONFIG.MAX_USE_PER_ORDER"
          :ui="{
            base: 'uppercase',
          }"
        />
        <UButton
          color="gray"
          variant="solid"
          :disabled="state.codes.length === COUPON_CONFIG.MAX_USE_PER_ORDER"
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
</template>
