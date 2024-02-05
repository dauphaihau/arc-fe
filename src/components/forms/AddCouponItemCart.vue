<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import { useCartStore } from '~/stores/cart';
import type { IUpdateCouponsItem } from '~/interfaces/cart';

const { $api } = useNuxtApp();
const cartStore = useCartStore();

const { shop } = defineProps<{
  shop: string
}>();

const state = reactive({
  active: false,
  code: '',
  codes: [] as string[],
  invalidCodes: [] as string[],
  errorMsg: '',
});

const addCoupon = async () => {
  let tempShopCodes: IUpdateCouponsItem[] = [];
  const codes = [];
  state.errorMsg = '';

  if (state.invalidCodes.length > 0 && state.invalidCodes.includes(state.code)) {
    state.errorMsg = 'Code not found';
    return;
  }

  const temp = [...cartStore.shopCodes];

  if (!cartStore.shopCodes.length) {
    tempShopCodes = [{ shop, coupon_codes: [state.code] }];
    codes.push(state.code);
  } else {
    tempShopCodes = temp.map((sc) => {
      if (sc.shop === shop) {
        if (sc.coupon_codes.includes(state.code)) {
          state.errorMsg = 'Duplicate code';
        } else {
          sc.coupon_codes.push(state.code);
          codes.push(sc.coupon_codes);
        }
      }
      return sc;
    });
  }

  if (!state.errorMsg) {
    const { data, error } = await $api.cart.updateCouponsItem(tempShopCodes);
    if (error.value) {
      switch (error.value.statusCode) {
        case StatusCodes.NOT_FOUND:
          state.errorMsg = 'Code not found';
          state.invalidCodes.push(state.code);
      }
    } else {
      cartStore.shopCodes = tempShopCodes;
      cartStore.tempOrder = data.value?.tempOrder || null;
      state.codes = codes;
      state.code = '';
    }
  }
};
const onSubmit = () => {
};
</script>

<template>
  <UButton
    variant="ghost"
    icon="i-heroicons-ticket"
    color="gray"
    class="w-fit"
    @click="() => state.active = !state.active"
  >
    Apply shop coupon codes
  </UButton>

  <div v-if="state.active" class="flex gap-3 mb-4">
    <!--        ref="formRef"-->
    <UForm
      :validate-on="['submit']"
      :state="state"
      @submit="onSubmit"
    >
      <UFormGroup
        required
        name="code"
        :error="state.errorMsg"
      >
        <UButtonGroup size="lg" orientation="horizontal">
          <UInput v-model="state.code" :disabled="state.codes.length === 3" />
          <UButton
            color="gray"
            variant="solid"
            @click="addCoupon"
          >
            Add
          </UButton>
        </UButtonGroup>
      </UFormGroup>
    </UForm>

    <div v-if="state.codes.length > 0">
      <div v-for="(code, index) of state.codes" :key="index">
        <UChip :show="false">
          <UButton color="gray" size="lg">
            {{ code }}
          </UButton>
        </UChip>
      </div>
    </div>
  </div>
</template>
