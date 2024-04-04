<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types';
import { ROUTES } from '~/config/enums/routes';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';
import type { IAddProductCart } from '~/interfaces/cart';
import type { ResponseGetDetailProduct } from '~/interfaces/product';
import { toastCustom } from '~/config/toast';

interface IStateSubmit extends IAddProductCart {
  variantOption: string,
  variantSubOption: string,
}

const { $api } = useNuxtApp();
const toast = useToast();
const cartStore = useCartStore();
const authStore = useAuthStore();
const config = useRuntimeConfig();

const { product } = defineProps<{
  product: ResponseGetDetailProduct
}>();

const emit = defineEmits<{ (e: 'onChangeVariant', value: number): void }>();

const formRef = ref();

const state = reactive({
  firstVariantOpts: [] as string[],
  secondVariantOpts: [] as string[],
  stockVariant: 0,
  priceVariant: 0,
  variantName1: '',
  variantName2: '',
  isBuyNow: false,
  loading: false,
});

const stateSubmit = reactive<IStateSubmit>({
  quantity: 1,
  inventory: '',
  variant: '',
  variantOption: '',
  variantSubOption: '',
});

onMounted(() => {
  switch (product.variant_type) {
    case PRODUCT_VARIANT_TYPES.NONE:
      stateSubmit.inventory = product.inventory.id;
      break;
    case PRODUCT_VARIANT_TYPES.SINGLE:
      state.firstVariantOpts = product.variants.map(val => val.variant_name);
      break;
    case PRODUCT_VARIANT_TYPES.COMBINE: {
      const variant = product.variants[0];
      state.firstVariantOpts = product.variants.map(val => val.variant_name);
      state.secondVariantOpts = variant.variant_options.map(val => val.variant.variant_name);
    }
      break;
  }
});

const maxQuantity = computed(() => {
  if (product.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
    return (product.inventory && product.inventory.stock) || 1;
  }
  else {
    return state.stockVariant;
  }
});

const decreaseQty = () => {
  if (stateSubmit.quantity === 1) {
    return;
  }
  stateSubmit.quantity--;
};

const validate = (stateValidate: IStateSubmit): FormError[] => {
  const errors: FormError[] = [];

  if (product.variant_type !== PRODUCT_VARIANT_TYPES.NONE) {
    if (!stateValidate.variantOption) {
      errors.push({
        path: 'variantOption',
        message: 'Required',
      });
    }

    if (product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE && !stateValidate.variantSubOption) {
      errors.push({
        path: 'variantSubOption',
        message: 'Required',
      });
    }
  }
  return errors;
};

async function onSubmit(event: FormSubmitEvent<IStateSubmit>) {
  if (!authStore.isLogged) {
    authStore.showLoginDialog = true;
    return;
  }
  formRef.value.clear();

  if (state.isBuyNow) {
    onBuyNow();
    return;
  }
  state.loading = true;

  const payload: IAddProductCart = {
    inventory: stateSubmit.inventory,
    quantity: Number(event.data.quantity),
  };
  if (stateSubmit.variant) {
    payload.variant = stateSubmit.variant;
  }
  const { error, data, pending } = await $api.cart.addProduct(payload);
  state.loading = pending.value;
  if (error.value) {
    toast.add({
      ...toastCustom.error,
      title: 'Add to cart failed',
    });
  }
  else {
    cartStore.summaryOrder = data.value?.summaryOrder || null;
    await cartStore.getCartHeader();
    navigateTo(ROUTES.CART);
  }
}

watch(() => [stateSubmit.variantOption, stateSubmit.variantSubOption], () => {
  stateSubmit.quantity = 1;
  if (product.variant_type === PRODUCT_VARIANT_TYPES.SINGLE) {
    const foundVariant = product.variants.find((val) => {
      return val.variant_name === stateSubmit.variantOption;
    });
    if (foundVariant) {
      const { price, stock, id } = foundVariant.inventory;
      emit('onChangeVariant', price);
      state.stockVariant = stock;
      state.priceVariant = price;
      stateSubmit.inventory = id;
      state.variantName1 = foundVariant.variant_name;
      stateSubmit.variant = foundVariant.id;
    }
  }

  if (product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE) {
    const foundVariant = product.variants.find((val) => {
      return val.variant_name === stateSubmit.variantOption;
    });
    const foundSubVariant = foundVariant?.variant_options?.find((val) => {
      return val.variant.variant_name === stateSubmit.variantSubOption;
    });
    if (foundVariant && foundSubVariant) {
      emit('onChangeVariant', foundSubVariant.inventory.price);
      state.stockVariant = foundSubVariant.inventory.stock;
      state.priceVariant = foundSubVariant.inventory.price;
      state.variantName1 = foundVariant.variant_name;
      state.variantName2 = foundSubVariant.variant.variant_name;
      stateSubmit.inventory = foundSubVariant.inventory.id;
      stateSubmit.variant = foundVariant.id;
    }
  }
}, { deep: true });

watch(() => stateSubmit.quantity, () => {
  if (maxQuantity.value && stateSubmit.quantity > maxQuantity.value) {
    stateSubmit.quantity = maxQuantity.value;
  }
});

const onBuyNow = () => {
  cartStore.productCheckoutNow = {
    product,
    url_image: config.public.awsHostBucket + '/' + product?.images[0]?.relative_url,
    variantName1: state.variantName1,
    variantName2: state.variantName2,
    price: product.variant_type === PRODUCT_VARIANT_TYPES.NONE ? product.inventory.price : state.priceVariant,
    stock: product.variant_type === PRODUCT_VARIANT_TYPES.NONE ? product.inventory.stock : state.stockVariant,
    variant: stateSubmit.variant,
    quantity: stateSubmit.quantity,
    inventory: stateSubmit.inventory,
  };
  navigateTo(ROUTES.CHECKOUT);
};

</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :state="stateSubmit"
    class="space-y-4"
    :validate="validate"
    @submit="onSubmit"
  >
    <div class="w-[41%] flex flex-col gap-4 mb-6">
      <UFormGroup
        v-if="product.variant_type === PRODUCT_VARIANT_TYPES.SINGLE ||
          product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE"
        :label="product.variant_group_name"
        name="variantOption"
      >
        <USelectMenu
          v-model="stateSubmit.variantOption"
          :placeholder="`Select a ${product.variant_group_name}`"
          size="lg"
          :options="state.firstVariantOpts"
        />
      </UFormGroup>

      <UFormGroup
        v-if="product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE"
        :label="product.variant_sub_group_name"
        name="variantSubOption"
      >
        <USelectMenu
          v-model="stateSubmit.variantSubOption"
          :placeholder="`Select a ${product.variant_sub_group_name}`"
          size="lg"
          :options="state.secondVariantOpts"
        />
      </UFormGroup>

      <div>
        <label class="block font-medium text-gray-700 dark:text-gray-200 text-sm mb-1">
          Quantity
        </label>
        <UButtonGroup size="lg" orientation="horizontal">
          <UButton
            icon="i-heroicons-minus"
            color="white"
            class="rounded-l-[0.375rem] rounded-r-none"
            @click="decreaseQty"
          />
          <UInput
            v-model.number="stateSubmit.quantity"
            class="rounded-l-none"
            type="number"
            :ui="{ base: ' text-center rounded-l-none' }"
            @keypress="keyPressIsNumber($event)"
          />
          <UButton
            icon="i-heroicons-plus"
            color="white"
            class="rounded-r-[0.375rem] rounded-l-none"
            @click="() => stateSubmit.quantity++"
          />
        </UButtonGroup>
      </div>
    </div>

    <div class="flex gap-4">
      <UButton
        size="xl"
        variant="soft"
        type="submit"
      >
        Add to card
      </UButton>
      <UButton
        size="xl"
        type="submit"
        :loading="state.loading"
        @click="state.isBuyNow = true"
      >
        Buy it now
      </UButton>
    </div>
  </UForm>
</template>
