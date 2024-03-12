<script lang="ts" setup>

import { useCartStore } from '~/stores/cart';
import { ROUTES } from '~/config/enums/routes';
import { ORDER_CONFIG, PAYMENT_TYPES } from '~/config/enums/order';
import type { ISummaryOrder } from '~/interfaces/order';
import type { ICoupon } from '~/interfaces/coupon';

definePageMeta({ layout: 'home', middleware: ['auth', 'checkout'] });

const { $api } = useNuxtApp();
const cartStore = useCartStore();
const toast = useToast();

enum STEPS { ADDRESS_SHIPPING, PAYMENT, REVIEW_CONFIRMATION, ORDER }

interface IOnModifyCoupons {
  summaryOrder: ISummaryOrder,
  coupon_codes: ICoupon['code'][]
}

const state = reactive({
  ...cartStore.productCheckoutNow,
  coupon_codes: [],
  dataGetSummaryOder: {},
  currentStep: STEPS.ADDRESS_SHIPPING,
  steps: ['Billing Address', 'Payment', 'Review & Confirmation'],
  loadingOrder: false,
  showNoteInput: false,
  note: '',
  isAddressEmpty: false,
});

const getSummaryOder = async () => {
  const { data } = await $api.order.getSummaryOder({
    inventory: state.inventory,
    quantity: state.quantity,
    coupon_codes: state.coupon_codes,
  });
  state.dataGetSummaryOder = data.value;
};

onMounted(async () => {
  await getSummaryOder();
});

watchDebounced(
  () => state.quantity,
  async () => {
    if (state.quantity > state.stock) {
      state.quantity = state.stock;
    }
    await getSummaryOder();
  },
  { debounce: 500, maxWait: 1000 }
);

const decreaseQty = () => {
  if (state.quantity === 1) {
    return;
  }
  state.quantity--;
};

const onCreateOrder = async () => {
  state.currentStep++;
  if (state.currentStep !== STEPS.ORDER) {
    return;
  }
  state.loadingOrder = true;

  const { payment_type, address } = cartStore.stateCheckout;

  const { data, error } = await $api.order.createOrderForBuyNow({
    payment_type: payment_type as PAYMENT_TYPES,
    address: address.id,
    inventory: state.inventory,
    quantity: state.quantity,
    coupon_codes: state.coupon_codes,
    note: state.note,
  });
  if (error.value) {
    toast.add({
      title: 'Order failed',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    });
    return;
  }

  if (payment_type === PAYMENT_TYPES.CARD && data.value?.checkoutSessionUrl) {
    navigateTo(data.value.checkoutSessionUrl, {
      external: true,
    });
  } else {
    navigateTo(ROUTES.SUCCESS);
  }
};

const onModifyCoupons = (values: IOnModifyCoupons) => {
  state.dataGetSummaryOder.summaryOrder = values.summaryOrder;
  state.coupon_codes = values.coupon_codes;
};

</script>

<template>
  <div class="py-16">
    <CheckoutStepper
      class="mb-24 max-w-[30rem] mx-auto"
      :steps="state.steps"
      :step="state.currentStep"
    />
    <div class="grid grid-cols-12 gap-16">
      <div class="col-span-8">
        <CheckoutAddressShipping
          v-if="state.currentStep === STEPS.ADDRESS_SHIPPING"
          class="mb-10"
          @on-address-empty="(val) => state.isAddressEmpty = val"
        />

        <CheckoutPaymentOptions v-if="state.currentStep === STEPS.PAYMENT" />

        <div
          v-if="state.currentStep === STEPS.REVIEW_CONFIRMATION
            || state.currentStep === STEPS.ORDER"
        >
          <CheckoutReviewShippingAndPayment class="mb-12" />

          <!--          as Item cart-->
          <UCard
            :ui="{ base: 'overflow-visible' }"
            class="mb-4"
          >
            <div class="flex flex-col">
              <h3 class="text-lg font-medium mb-3">
                {{ state.shop?.shop_name }}
              </h3>

              <div class="flex gap-4 mb-8">
                <NuxtImg
                  :src="state.url_image"
                  width="180"
                  height="180"
                  class="rounded max-w-[180px] max-h-[180px] cursor-pointer"
                />

                <div class="flex justify-between w-full">
                  <div class="space-y-2">
                    <h1 class="text-xl font-semibold cursor-pointer">
                      {{ state.title }}
                    </h1>

                    <div class="flex flex-col gap-1">
                      <div class="text-zinc-500 text-lg">
                        {{ state.firstVariantLabel }}: {{ state.variantName1 }}
                      </div>
                      <div
                        v-if="state.secondVariantLabel"
                        class="text-zinc-500 text-lg"
                      >
                        {{ state.secondVariantLabel }}: {{ state.variantName2 }}
                      </div>
                    </div>

                    <div class="w-1/2">
                      <UButtonGroup size="lg" orientation="horizontal">
                        <UButton
                          icon="i-heroicons-minus"
                          color="white"
                          class="rounded-l-[0.375rem] rounded-r-none"
                          @click="decreaseQty"
                        />
                        <UInput
                          v-model.number="state.quantity"
                          class="rounded-l-none"
                          type="number"
                          :ui="{ base: 'text-center rounded-l-none' }"
                          @keypress="keyPressIsNumber($event)"
                        />
                        <UButton
                          icon="i-heroicons-plus"
                          color="white"
                          class="rounded-r-[0.375rem] rounded-l-none"
                          @click="() => state.quantity++"
                        />
                      </UButtonGroup>
                    </div>
                  </div>

                  <p class="text-customGray-950 text-xl font-medium">
                    {{ formatCurrency(state.price) }}
                  </p>
                </div>
              </div>


              <UDivider />

              <div class="flex flex-col gap-4 w-fit mt-6">
                <ChekcoutAddCoupons
                  :shop="state.shop?.id"
                  :state-parent="state"
                  @on-modify-coupons="onModifyCoupons"
                />
                <div>
                  <UButton
                    variant="ghost"
                    icon="i-heroicons-clipboard-document-list"
                    color="gray"
                    class="w-fit mb-3"
                    @click="state.showNoteInput = !state.showNoteInput"
                  >
                    Add a note to {{ state.shop?.shop_name }}
                  </UButton>

                  <UTextarea
                    v-if="state.showNoteInput"
                    v-model="state.note"
                    autoresize
                    :maxlength="ORDER_CONFIG.MAX_CHAR_NOTE"
                    :rows="3"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div class="col-span-4">
        <CheckoutSummaryOrder
          v-if="state.dataGetSummaryOder?.summaryOrder"
          :data="state.dataGetSummaryOder.summaryOrder"
        />

        <UButton
          class="mx-auto mt-8"
          block
          :disabled="state.isAddressEmpty"
          size="xl"
          :loading="state.loadingOrder"
          :ui="{
            rounded: 'shadow-border'
          }"
          @click="onCreateOrder"
        >
          {{ state.currentStep === STEPS.REVIEW_CONFIRMATION ? 'Complete Order' : 'Continue' }}
        </UButton>
      </div>
    </div>
  </div>
</template>
