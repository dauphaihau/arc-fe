<script lang="ts" setup>
import { useCartStore } from '~/stores/cart';
import { ROUTES } from '~/config/enums/routes';
import { ORDER_CONFIG, PAYMENT_TYPES } from '~/config/enums/order';
import type { CreateOrderForBuyNowBody, ISummaryOrder } from '~/interfaces/order';
import type { ICoupon } from '~/interfaces/coupon';
import type { IUser } from '~/interfaces/user';
import { type IExchangeRate, LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import { toastCustom } from '~/config/toast';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';
import { MARKET_CONFIG } from '~/config/enums/market';
import type { IStateProductCheckoutNow } from '~/interfaces/cart';
import type { IProductCombineVariant } from '~/interfaces/product';

enum STEPS { ADDRESS_SHIPPING, PAYMENT, REVIEW_CONFIRMATION, ORDER }

interface IOnModifyCoupons {
  summaryOrder: ISummaryOrder
  coupon_codes: ICoupon['code'][]
}

type IState = {
  currentStep: STEPS
  coupon_codes: string[]
  dataGetSummaryOder: { summaryOrder: ISummaryOrder } | null
  note: string
  countRefreshConvertCurrency: number
} & Record<'loadingOrder' | 'showNoteInput' | 'isAddressEmpty', boolean>
& IStateProductCheckoutNow
& Partial<Pick<IProductCombineVariant, 'variant_group_name' | 'variant_sub_group_name'>>;

definePageMeta({ layout: 'market', middleware: ['auth', 'checkout'] });

const { $api } = useNuxtApp();
const cartStore = useCartStore();
const toast = useToast();
const store = useStore();

const steps = ['Billing Address', 'Payment', 'Review & Confirmation'];

const state = reactive<IState>({
  ...cartStore.productCheckoutNow as IStateProductCheckoutNow,
  currentStep: STEPS.ADDRESS_SHIPPING,
  coupon_codes: [],
  dataGetSummaryOder: null,
  loadingOrder: false,
  showNoteInput: false,
  note: '',
  isAddressEmpty: false,
  countRefreshConvertCurrency: 0,
});

const getSummaryOder = async () => {
  const { data } = await $api.order.getSummaryOder({
    inventory: state.inventory,
    quantity: state.quantity,
    coupon_codes: state.coupon_codes,
  });
  if (data.value) {
    state.dataGetSummaryOder = data.value;
  }
};

onMounted(async () => {
  const { variant_type } = state.product;
  if (variant_type === PRODUCT_VARIANT_TYPES.SINGLE) {
    state.variant_group_name = state.product.variant_group_name;
  }
  if (variant_type === PRODUCT_VARIANT_TYPES.COMBINE) {
    state.variant_group_name = state.product.variant_group_name;
    state.variant_sub_group_name = state.product.variant_sub_group_name;
  }
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

  const body: CreateOrderForBuyNowBody = {
    payment_type: payment_type as PAYMENT_TYPES,
    address: address.id,
    inventory: state.inventory,
    quantity: state.quantity,
    coupon_codes: state.coupon_codes,
    note: state.note,
  };

  const currencySelected = parseJSON<IUser['market_preferences']>(
    localStorage[LOCAL_STORAGE_KEYS.USER_PREFERENCES]
  )?.currency;
  if (!currencySelected) {
    toast.add({
      ...toastCustom.error,
      title: 'Oops',
      description: 'Something wrong',
    });
    return;
  }
  body.currency = currencySelected;
  if (currencySelected !== MARKET_CONFIG.BASE_CURRENCY) {
    // validate currency
    const exchangeRate = parseJSON<IExchangeRate>(localStorage[LOCAL_STORAGE_KEYS.EXCHANGE_RATE]);
    const prevRate = exchangeRate?.rates[currencySelected];
    await store.getExchangeRates();
    if (!store.rates) {
      toast.add({
        ...toastCustom.error,
        title: 'Oops',
        description: 'Something wrong',
      });
      return;
    }
    const newRate = store.rates[currencySelected];
    if (prevRate !== newRate) {
      toast.add({
        ...toastCustom.info,
        title: 'Currency have a update, please recheck',
      });
      state.loadingOrder = false;
      state.countRefreshConvertCurrency++;
      return;
    }
  }

  const { data, error } = await $api.order.createOrderForBuyNow(body);
  if (error.value) {
    toast.add({
      ...toastCustom.error,
      title: 'Order failed',
    });
    return;
  }

  if (payment_type === PAYMENT_TYPES.CARD) {
    if (!data.value?.checkoutSessionUrl) {
      toast.add({
        ...toastCustom.error,
        title: 'Oops',
        description: 'Something wrong',
      });
      return;
    }
    navigateTo(data.value.checkoutSessionUrl, {
      external: true,
    });
  }
  else {
    navigateTo(ROUTES.SUCCESS);
  }
};

const onModifyCoupons = (values: IOnModifyCoupons) => {
  if (state.dataGetSummaryOder) {
    state.dataGetSummaryOder.summaryOrder = values.summaryOrder;
  }
  state.coupon_codes = values.coupon_codes;
};
</script>

<template>
  <div class="py-16">
    <CheckoutStepper
      class="mx-auto mb-24 max-w-[30rem]"
      :steps="steps"
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

          <!--          as Item cart -->
          <UCard
            v-if="cartStore.productCheckoutNow"
            :ui="{ base: 'overflow-visible' }"
            class="mb-4"
          >
            <div class="flex flex-col">
              <h3 class="mb-3 text-lg font-medium">
                {{ state.product.shop?.shop_name }}
              </h3>

              <div class="mb-8 flex gap-4">
                <NuxtImg
                  :src="state.url_image"
                  width="180"
                  height="180"
                  class="max-h-[180px] max-w-[180px] cursor-pointer rounded"
                />

                <div class="flex w-full justify-between">
                  <div class="space-y-2">
                    <h1 class="cursor-pointer text-xl font-semibold">
                      {{ state.product.title }}
                    </h1>

                    <div class="flex flex-col gap-1">
                      <div
                        v-if="state.variant_group_name"
                        class="text-lg text-zinc-500"
                      >
                        {{ state.variant_group_name }}: {{ state.variantName1 }}
                      </div>
                      <div
                        v-if="state.variant_sub_group_name"
                        class="text-lg text-zinc-500"
                      >
                        {{ state.variant_sub_group_name }}: {{ state.variantName2 }}
                      </div>
                    </div>

                    <div class="w-1/2">
                      <UButtonGroup
                        size="lg"
                        orientation="horizontal"
                      >
                        <UButton
                          icon="i-heroicons-minus"
                          color="white"
                          class="rounded-l-md rounded-r-none"
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
                          class="rounded-l-none rounded-r-md"
                          @click="() => state.quantity++"
                        />
                      </UButtonGroup>
                    </div>
                  </div>

                  <p
                    :key="state.countRefreshConvertCurrency"
                    class="text-xl font-medium text-customGray-950"
                  >
                    {{ convertCurrency(state.price) }}
                  </p>
                </div>
              </div>

              <UDivider />

              <div class="mt-6 flex w-fit flex-col gap-4">
                <ChekcoutAddCoupons
                  :shop="state.product.shop?.id"
                  :state-parent="state"
                  @on-modify-coupons="onModifyCoupons"
                />
                <div>
                  <UButton
                    variant="ghost"
                    icon="i-heroicons-clipboard-document-list"
                    color="gray"
                    class="mb-3 w-fit"
                    @click="state.showNoteInput = !state.showNoteInput"
                  >
                    Add a note to {{ cartStore.productCheckoutNow?.product.shop.shop_name }}
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
          :key="state.countRefreshConvertCurrency"
          :data="state.dataGetSummaryOder.summaryOrder"
        />

        <UButton
          class="mx-auto mt-8"
          block
          :disabled="state.isAddressEmpty"
          size="xl"
          :loading="state.loadingOrder"
          :ui="{
            rounded: 'shadow-border',
          }"
          @click="onCreateOrder"
        >
          {{ state.currentStep === STEPS.REVIEW_CONFIRMATION ? 'Complete Order' : 'Continue' }}
        </UButton>
      </div>
    </div>
  </div>
</template>
