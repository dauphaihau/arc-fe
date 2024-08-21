<script setup lang="ts">
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';
import { consola } from 'consola';
import {
  COUPON_APPLIES_TO, COUPON_CONFIG, COUPON_MIN_ORDER_TYPES, COUPON_TYPES
} from '~/config/enums/coupon';
import { createPromoCodeBodySchema } from '~/schemas/coupon.schema';
import type { UndefinableFields } from '~/types/utils';
import { ROUTES } from '~/config/enums/routes';
import { toastCustom } from '~/config/toast';
import { useShopCreateCoupon } from '~/services/shop';
import { PRODUCT_CONFIG } from '~/config/enums/product';

type CreatePromoCodeBody = z.infer<typeof createPromoCodeBodySchema>;

type InitState = UndefinableFields<CreatePromoCodeBody, 'amount_off'
| 'percent_off'
| 'min_order_value'
| 'min_products'
| 'max_uses_per_user'
| 'max_uses'
| 'start_date'
| 'end_date'
>;

const router = useRouter();
const toast = useToast();

const {
  mutateAsync: createCoupon,
  isPending: isPendingCreateCoupon,
} = useShopCreateCoupon();

const couponTypeOptions = [
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

const selectedCouponType = ref(couponTypeOptions[0].value);

const selectedMinOrder = ref(couponMinOrderOptions[0].value);

const state = reactive<InitState>({
  code: '',
  type: COUPON_TYPES.PERCENTAGE,
  min_order_type: COUPON_MIN_ORDER_TYPES.NONE,
  applies_to: COUPON_APPLIES_TO.ALL,
  max_uses_per_user: undefined,
  max_uses: undefined,
  start_date: undefined,
  end_date: undefined,
});

const formRef = ref();
const btnSubmit = ref();

const validateForm = (stateValidate: CreatePromoCodeBody): FormError[] => {
  let errors: FormError[] = [];

  stateValidate.type = selectedCouponType.value;
  stateValidate.min_order_type = selectedMinOrder.value;
  const { type, min_order_type, applies_to } = stateValidate;
  consola.info('stateValidate', stateValidate);

  const result = createPromoCodeBodySchema.required({
    amount_off: type === COUPON_TYPES.FIXED_AMOUNT || undefined,
    percent_off: type === COUPON_TYPES.PERCENTAGE || undefined,
    applies_product_ids: applies_to === COUPON_APPLIES_TO.SPECIFIC || undefined,
    min_products: min_order_type === COUPON_MIN_ORDER_TYPES.NUMBER_OF_PRODUCTS || undefined,
    min_order_value: min_order_type === COUPON_MIN_ORDER_TYPES.ORDER_TOTAL || undefined,
  }).safeParse(stateValidate);

  if (!result.success) {
    errors = result.error.issues.map((detail) => {
      const path = detail.path.at(-1);
      if (path === 'start_date' || path === 'end_date') {
        consola.error(`${path} is invalid: `, stateValidate[path]);
        return {
          path: 'duration',
          message: 'Invalid date',
        };
      }
      return {
        path: typeof path === 'string' ? path : '',
        message: detail.message,
      };
    });
    consola.error('zod parse errors', errors);
  }
  return errors;
};

async function onSubmit(event: FormSubmitEvent<CreatePromoCodeBody>) {
  formRef.value.clear();

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

  try {
    await createCoupon(event.data);
    await router.push(`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.COUPONS}`);
    toast.add({
      ...toastCustom.success,
      title: 'Create promo code success',
    });
  }
  catch (error) {
    toast.add({
      ...toastCustom.error,
      title: 'Create promo code failed',
    });
  }
}

function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id);
  element?.focus();
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :validate="validateForm"
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
        <div class="space-y-5">
          <UFormGroup
            label="Code"
            name="code"
            description="This is what shoppers will enter at checkout to get a discount.
            Each code should be unique, and only use letters and numbers."
            class="grid grid-cols-4 gap-10"
            required
          >
            <UInput
              v-model="state.code"
              v-uppercase
              :maxlength="COUPON_CONFIG.MAX_CHAR_CODE"
              :disabled="isPendingCreateCoupon"
              placeholder="Ex. WINTERSALE"
              size="lg"
              class="w-full"
              @keydown.space.prevent
            />
          </UFormGroup>

          <UFormGroup
            label="Duration"
            name="duration"
            class="grid grid-cols-4 gap-10"
            required
            description="You can set a date for your code to expire, or leave it open-ended."
          >
            <SearchStartEndDateInput
              v-model:start-date="state.start_date"
              v-model:end-date="state.end_date"
            />
          </UFormGroup>
        </div>
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Details
      </template>
      <template #content>
        <div class="space-y-8">
          <UFormGroup
            label="Discount type"
            name="type"
            class="grid grid-cols-4 items-center gap-10"
            :ui="{ container: 'col-span-2' }"
          >
            <div class="flex space-x-5">
              <USelectMenu
                v-model="selectedCouponType"
                size="lg"
                :options="couponTypeOptions"
                value-attribute="value"
                name-attribute="label"
                class="w-[220px]"
              />
              <UFormGroup
                v-if="selectedCouponType === COUPON_TYPES.FIXED_AMOUNT"
                name="amount_off"
              >
                <UInput
                  v-model.number="state.amount_off"
                  v-max-number="PRODUCT_CONFIG.MAX_PRICE - 1"
                  v-numeric
                  size="lg"
                  class="w-1/2"
                >
                  <template #trailing>
                    <span class="text-xs text-gray-500 dark:text-gray-400">USD</span>
                  </template>
                </UInput>
              </UFormGroup>
              <UFormGroup
                v-if="selectedCouponType === COUPON_TYPES.PERCENTAGE"
                name="percent_off"
                class="w-2/5"
              >
                <UInput
                  v-model.number="state.percent_off"
                  v-numeric
                  v-max-number="COUPON_CONFIG.MAX_PERCENTAGE_OFF"
                  size="lg"
                  class="w-2/5"
                >
                  <template #trailing>
                    <span class="text-xs text-gray-500 dark:text-gray-400">%</span>
                  </template>
                </UInput>
              </UFormGroup>
            </div>
          </UFormGroup>

          <UFormGroup
            label="Order minimum"
            description="You can require a minimum spend or number of items for buyers to qualify for your offer."
            name="min_order_type"
            class="grid grid-cols-4 items-center gap-10"
            :ui="{ container: 'col-span-2' }"
          >
            <div class="flex space-x-5">
              <USelectMenu
                v-model="selectedMinOrder"
                size="lg"
                :options="couponMinOrderOptions"
                class="w-[170px]"
                value-attribute="value"
                name-attribute="label"
              />

              <UFormGroup
                v-if="selectedMinOrder === COUPON_MIN_ORDER_TYPES.NUMBER_OF_PRODUCTS"
                name="min_products"
                class="w-1/3"
              >
                <UInput
                  v-model.number="state.min_products"
                  v-numeric
                  size="lg"
                />
              </UFormGroup>
              <UFormGroup
                v-if="selectedMinOrder === COUPON_MIN_ORDER_TYPES.ORDER_TOTAL"
                name="min_order_value"
                class="w-1/3"
              >
                <UInput
                  v-model.number="state.min_order_value"
                  size="lg"
                >
                  <template #trailing>
                    <span class="text-xs text-gray-500 dark:text-gray-400">USD</span>
                  </template>
                </UInput>
              </UFormGroup>
            </div>
          </UFormGroup>

          <UFormGroup
            label="Maximum total usage"
            name="max_uses"
            class="grid grid-cols-4 gap-10"
          >
            <UInput
              v-model.number="state.max_uses"
              v-max-number="COUPON_CONFIG.MAX_USES"
              v-numeric
              :disabled="isPendingCreateCoupon"
              size="lg"
              class="w-1/2"
            />
          </UFormGroup>

          <UFormGroup
            label="Maximum Usage/Buyer"
            name="max_uses_per_user"
            class="grid grid-cols-4 gap-10"
          >
            <UInput
              v-model.number="state.max_uses_per_user"
              v-max-number="COUPON_CONFIG.MAX_USES_PER_USER"
              v-numeric
              type="number"
              :disabled="isPendingCreateCoupon"
              size="lg"
              class="w-1/2"
            />
          </UFormGroup>

          <UFormGroup
            class="grid grid-cols-4 gap-10"
            description="Your discount can apply shop-wide, or be limited to specific items."
            label="Which products can buyers use this promo code on?"
            name="applies_to"
            :ui="{ container: 'col-span-2' }"
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
            v-if="state.applies_to === COUPON_APPLIES_TO.SPECIFIC"
            name="applies_product_ids"
            class="mb-4"
            required
          >
            <CreateCouponApplyCouponOnProduct v-model="state.applies_product_ids" />
          </UFormGroup>
        </div>
      </template>
    </WrapperFormGroupCard>

    <button
      ref="btnSubmit"
      type="submit"
      class="hidden"
    />
  </UForm>

  <div
    class="fixed bottom-0 left-0 flex
       w-full items-center justify-end gap-2 border-t bg-white py-2.5 pr-8"
  >
    <UButton
      :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.COUPONS}`"
      :disabled="isPendingCreateCoupon"
      size="sm"
      type="submit"
      color="gray"
    >
      Cancel
    </UButton>
    <UButton
      :loading="isPendingCreateCoupon"
      size="sm"
      type="submit"
      @click="() => btnSubmit.click()"
    >
      Create
    </UButton>
  </div>
</template>
