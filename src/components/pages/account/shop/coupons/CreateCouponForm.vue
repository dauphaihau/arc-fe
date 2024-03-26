<script setup lang="ts">
import dayjs from 'dayjs';
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import type { CreateCouponPayload, ICoupon } from '~/interfaces/coupon';
import { COUPON_APPLIES_TO, COUPON_MIN_ORDER_TYPES, COUPON_TYPES } from '~/config/enums/coupon';
import { couponSchema } from '~/schemas/coupon.schema';
import type { UndefinableFields } from '~/interfaces/utils';
import type { IProduct } from '~/interfaces/product';
import { ROUTES } from '~/config/enums/routes';

const { $api } = useNuxtApp();
const router = useRouter();
const toast = useToast();

type InitState = UndefinableFields<CreateCouponPayload, 'amount_off'
    | 'percent_off'
    | 'min_order_value'
    | 'min_products'
    | 'max_uses_per_user'
    | 'max_uses'>

const state = reactive<InitState>({
  title: '',
  code: '',
  type: COUPON_TYPES.FIXED_AMOUNT,
  min_order_type: COUPON_MIN_ORDER_TYPES.NONE,
  applies_to: COUPON_APPLIES_TO.ALL,
  max_uses_per_user: undefined,
  max_uses: undefined,
  start_date: dayjs().add(10, 'minutes').toDate(),
  end_date: dayjs().add(1, 'days').toDate(),
});

const formRef = ref();
const loading = ref(false);
const btnSubmit = ref();

const typeOptions = [
  { value: COUPON_TYPES.FIXED_AMOUNT, label: 'Fixed amount off' },
  { value: COUPON_TYPES.PERCENTAGE, label: 'Percentage off' },
  { value: COUPON_TYPES.FREE_SHIP, label: 'Free standard shipping' },
];

const couponMinOrderOptions = [
  { value: COUPON_MIN_ORDER_TYPES.NONE, label: 'none' },
  { value: COUPON_MIN_ORDER_TYPES.NUMBER_OF_PRODUCTS, label: 'Number of items' },
  { value: COUPON_MIN_ORDER_TYPES.ORDER_TOTAL, label: 'Order total' },
];

const couponAppliesToOptions = [
  { value: COUPON_APPLIES_TO.ALL, label: 'All products' },
  { value: COUPON_APPLIES_TO.SPECIFIC, label: 'Select products' },
];

const validate = (stateValidate: CreateCouponPayload): FormError[] => {
  let errors: FormError[] = [];

  const { type, min_order_type, applies_to } = stateValidate;
  const result = couponSchema.omit({
    id: true,
    shop: true,
    users_used: true,
  }).required({
    ap: type === COUPON_TYPES.FIXED_AMOUNT || undefined,
    amount_off: type === COUPON_TYPES.FIXED_AMOUNT || undefined,
    percent_off: type === COUPON_TYPES.PERCENTAGE || undefined,
    applies_product_ids: applies_to === COUPON_APPLIES_TO.SPECIFIC || undefined,
    min_products: min_order_type === COUPON_MIN_ORDER_TYPES.NUMBER_OF_PRODUCTS || undefined,
    min_order_value: min_order_type === COUPON_MIN_ORDER_TYPES.ORDER_TOTAL || undefined,
  }).safeParse(stateValidate);

  if (!result.success) {
    errors = result.error.issues.map((detail) => {
      const path = detail.path.at(-1);
      return {
        path: typeof path === 'string' ? path : '',
        message: detail.message,
      };
    });
  }
  return errors;
};

async function onSubmit(event: FormSubmitEvent<CreateCouponPayload>) {
  formRef.value.clear();
  loading.value = true;

  switch (event.data.type) {
    case COUPON_TYPES.FREE_SHIP:
      delete event.data.amount_off;
      delete event.data.percent_off;
      break;
    case COUPON_TYPES.FIXED_AMOUNT:
      delete event.data.percent_off;
      break;
    case COUPON_TYPES.PERCENTAGE:
      delete event.data.amount_off;
      break;
  }

  switch (event.data.min_order_type) {
    case COUPON_MIN_ORDER_TYPES.NUMBER_OF_PRODUCTS:
      delete event.data.min_order_value;
      break;
    case COUPON_MIN_ORDER_TYPES.ORDER_TOTAL:
      delete event.data.min_products;
      break;
    case COUPON_MIN_ORDER_TYPES.NONE:
      delete event.data.min_products;
      delete event.data.min_order_value;
      break;
  }

  event.data.code = event.data.code.toUpperCase();

  const { error } = await $api.shop.createCoupon(event.data);
  loading.value = false;
  if (!error.value) {
    router.push(ROUTES.ACCOUNT + ROUTES.SHOP + ROUTES.COUPONS);
    toast.add({ title: 'Create coupon success' });
  } else {
    toast.add({ title: 'Create coupon failed' });
  }
}

function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id);
  element?.focus();
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const onChangeDuration = (values: Pick<ICoupon, 'start_date' | 'end_date'>) => {
  state.start_date = new Date(values.start_date);
  state.end_date = new Date(values.end_date);
};

const onSelectProd = (ids: IProduct['id'][]) => {
  state.applies_product_ids = ids;
};

</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :validate="validate"
    :state="state"
    class="space-y-7"
    @error="onError"
    @submit="onSubmit"
  >
    <WrapperFormGroupCard>
      <template #title>
        Basic info
      </template>
      <template #content>
        <div class="w-1/2">
          <UFormGroup
            label="Title"
            name="title"
            class="mb-4"
            description="The Voucher name will not be displayed to the Buyer"
            required
          >
            <UInput v-model="state.title" :disabled="loading" size="lg" />
          </UFormGroup>
          <UFormGroup
            label="Code"
            name="code"
            description="This is what shoppers will enter at checkout to get a discount.
          Each code should be unique, and only use letters and numbers."
            class="mb-4"
            required
          >
            <UInput
              v-model="state.code"
              :disabled="loading"
              size="lg"
              :ui="{
                base: 'uppercase'
              }"
            />
          </UFormGroup>

          <UFormGroup
            label="Duration"
            name="start_date"
            class="mb-4"
            required
            description="You can set a date for your code to expire, or leave it open-ended."
          >
            <StartEndDateInput @on-change-duration="onChangeDuration" />
          </UFormGroup>
        </div>
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Details
      </template>
      <template #content>
        <UFormGroup label="Type" name="type" class="mb-4">
          <div class="flex gap-16">
            <URadio
              v-for="type of typeOptions"
              :key="type.value.toString()"
              v-model="state.type"
              v-bind="type"
            />
          </div>
        </UFormGroup>
        <div class="w-1/5">
          <UFormGroup
            v-if="state.type === COUPON_TYPES.FIXED_AMOUNT"
            name="amount_off"
            class="mb-4"
          >
            <UInput v-model="state.amount_off" size="lg" type="number">
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-xs">USD</span>
              </template>
            </UInput>
          </UFormGroup>
          <UFormGroup
            v-if="state.type === COUPON_TYPES.PERCENTAGE"
            name="percent_off"
            class="mb-4"
          >
            <UInput v-model="state.percent_off" size="lg" type="number">
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-xs">%</span>
              </template>
            </UInput>
          </UFormGroup>
        </div>

        <UFormGroup label="Order minimum" name="min_order_type" class="mb-4">
          <div class="flex gap-16">
            <URadio
              v-for="opt of couponMinOrderOptions"
              :key="opt.value.toString()"
              v-model="state.min_order_type"
              v-bind="opt"
            />
          </div>
        </UFormGroup>
        <div class="w-1/5">
          <UFormGroup
            v-if="state.min_order_type === COUPON_MIN_ORDER_TYPES.NUMBER_OF_PRODUCTS"
            name="min_products"
            class="mb-4"
          >
            <UInput v-model="state.min_products" size="lg" type="number" />
          </UFormGroup>
          <UFormGroup
            v-if="state.min_order_type === COUPON_MIN_ORDER_TYPES.ORDER_TOTAL"
            name="min_order_value"
            class="mb-4"
          >
            <UInput v-model="state.min_order_value" size="lg" type="number">
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-xs">USD</span>
              </template>
            </UInput>
          </UFormGroup>
        </div>

        <UFormGroup
          label="Maximum total usage"
          name="max_uses"
          class="mb-4 w-1/5"
        >
          <UInput v-model="state.max_uses" type="number" :disabled="loading" size="lg" />
        </UFormGroup>

        <UFormGroup
          label="Maximum Usage/Buyer"
          name="max_uses_per_user"
          class="mb-4 w-1/5"
        >
          <UInput v-model="state.max_uses_per_user" type="number" :disabled="loading" size="lg" />
        </UFormGroup>


        <UFormGroup
          class="mb-4"
          description="Your discount can apply shop-wide, or be limited to specific items."
          label="Which products can buyers use this promo code on?"
          name="applies_to"
        >
          <div class="flex gap-16">
            <URadio
              v-for="opt of couponAppliesToOptions"
              :key="opt.value.toString()"
              v-model="state.applies_to"
              v-bind="opt"
            />
          </div>
        </UFormGroup>

        <UFormGroup
          name="applies_product_ids"
          class="mb-4"
          required
        >
          <CreateCouponApplyCouponOnProduct
            v-if="state.applies_to === COUPON_APPLIES_TO.SPECIFIC"
            @on-select-prod="onSelectProd"
          />
        </UFormGroup>
      </template>
    </WrapperFormGroupCard>

    <button ref="btnSubmit" type="submit" class="hidden" />
  </UForm>

  <div
    class="flex justify-end items-center gap-2
       fixed bottom-0 bg-white w-full left-0 pr-8 py-2.5 border-t"
  >
    <UButton
      :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.COUPONS}`"
      :disabled="loading"
      size="sm"
      type="submit"
      color="gray"
    >
      Cancel
    </UButton>
    <UButton
      :disabled="loading"
      size="sm"
      type="submit"
      @click="() => btnSubmit.click()"
    >
      Create
    </UButton>
  </div>
</template>
