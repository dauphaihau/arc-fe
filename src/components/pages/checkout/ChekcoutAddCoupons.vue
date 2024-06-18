<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import type { ISummaryOrder, GetSummaryOderBody } from '~/interfaces/order';
import type { ICoupon } from '~/interfaces/coupon';

const { $api } = useNuxtApp();
const toast = useToast();

const { stateParent } = defineProps<{
  stateParent: GetSummaryOderBody
}>();

interface IOnModifyCoupons {
  summaryOrder: ISummaryOrder
  coupon_codes: ICoupon['code'][]
}

const emit = defineEmits<{
  (e: 'onModifyCoupons', value: IOnModifyCoupons): void
}>();

const state = reactive({
  active: false,
  code: '',
  codes: [] as string[],
  invalidCodes: [] as string[],
  errorMsg: '',
});

const addCoupon = async () => {
  state.errorMsg = '';

  if (!state.code) {
    state.errorMsg = 'Required';
    return;
  }

  if (state.invalidCodes.length > 0 && state.invalidCodes.includes(state.code)) {
    state.errorMsg = 'Code not found';
    return;
  }

  const tempCodes = [...state.codes, state.code];

  const { data, error } = await $api.order.getSummaryOder({
    inventory: stateParent.inventory,
    quantity: stateParent.quantity,
    coupon_codes: tempCodes,
  });
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
        break;
    }
    return;
  }
  if (!data.value) {
    toast.add({
      title: 'Something wrong',
      icon: 'i-heroicons-exclamation-circle',
      color: 'red',
    });
    return;
  }
  emit('onModifyCoupons', {
    summaryOrder: data.value.summaryOrder,
    coupon_codes: state.codes,
  });
  state.codes = tempCodes;
  state.code = '';
};

const deleteCoupon = async (coupon: string) => {
  const filtered = state.codes.filter(cp => cp !== coupon);
  const { data, error } = await $api.order.getSummaryOder({
    inventory: stateParent.inventory,
    quantity: stateParent.quantity,
    coupon_codes: filtered,
  });
  if (error.value) {
    toast.add({
      title: 'Something Wrong',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    });
    return;
  }

  if (data.value) {
    emit('onModifyCoupons', {
      summaryOrder: data.value.summaryOrder,
      coupon_codes: filtered,
    });
    state.codes = filtered;
  }
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

  <div
    v-if="state.active"
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
          :disabled="state.codes.length === 3"
        />
        <UButton
          color="gray"
          variant="solid"
          @click="addCoupon"
        >
          Add
        </UButton>
      </UButtonGroup>
    </UFormGroup>

    <div
      v-if="state.codes.length > 0"
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
