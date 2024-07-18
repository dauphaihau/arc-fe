<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types';
import { ROUTES } from '~/config/enums/routes';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';
import type { AddCartProduct } from '~/types/cart';
import type { ResponseGetDetailProduct } from '~/types/product';
import { RegisterLoginDialog } from '#components';
import { useAddProductToCart } from '~/services/cart';
import { useGetCurrentUser } from '~/services/user';

interface StateSubmit extends AddCartProduct {
  variantOption: string
  variantSubOption: string
}

// const { product } = defineProps<ResponseGetDetailProduct>();
const props = defineProps<ResponseGetDetailProduct>();
const { product } = props;

const emit = defineEmits<{ (e: 'onChangeVariant', value: number): void }>();

const cartStore = useCartStore();
const modal = useModal();
const queryClient = useQueryClient();
const { data: dataUserAuth } = useGetCurrentUser();

const {
  mutate: addProductToCart,
  isPending: isPendingAddProductToCart,
} = useAddProductToCart({
  onSuccess: () => {
    cartStore.getProductsRecentlyAdded();
    queryClient.removeQueries({ queryKey: ['get-cart'] });
    navigateTo(ROUTES.CART);
  },
});

// ------------- States
const formRef = ref();

const state = reactive({
  firstVariantOpts: [] as string[],
  secondVariantOpts: [] as string[],
  stockVariant: 1,
  priceVariant: 0,
  variantName1: '',
  variantName2: '',
  isBuyNow: false,
});

const stateSubmit = reactive<StateSubmit>({
  quantity: 1,
  inventory: '',
  variant: '',
  variantOption: '',
  variantSubOption: '',
});

const maxQuantity = computed(() => {
  // if (product.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
  //   return (product.inventory && product.inventory.stock) || 1;
  // }
  if (props.product.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
    return (props.product.inventory && props.product.inventory.stock) || 1;
  }
  else {
    return state.stockVariant;
  }
});

// ------------- Lifecycle Hooks
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


// ------------- Features
const decreaseQty = () => {
  if (stateSubmit.quantity === 1) return;
  stateSubmit.quantity--;
};

const validateForm = (stateValidate: StateSubmit): FormError[] => {
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

async function onSubmit(event: FormSubmitEvent<StateSubmit>) {
  if (!dataUserAuth.value?.user) {
    modal.open(RegisterLoginDialog);
    return;
  }
  formRef.value.clear();

  if (state.isBuyNow) {
    onBuyNow();
    return;
  }

  const payload: AddCartProduct = {
    inventory: stateSubmit.inventory,
    quantity: Number(event.data.quantity),
  };
  if (stateSubmit.variant) {
    payload.variant = stateSubmit.variant;
  }
  addProductToCart(payload);
}

const onBuyNow = () => {
  const productCheckout = cartStore.stateCheckoutNow.product;

  productCheckout.id = product.id;
  productCheckout.inventory = stateSubmit.inventory;
  productCheckout.quantity = stateSubmit.quantity;

  if (product.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
    productCheckout.price = product.inventory.price;
    productCheckout.stock = product.inventory.stock;
  }
  else {
    productCheckout.price = state.priceVariant;
    productCheckout.stock = state.stockVariant;
  }
  productCheckout.variantName1 = state.variantName1;
  productCheckout.variantName2 = state.variantName2;

  navigateTo(ROUTES.CHECKOUT);
};

// ------------ Side effects
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
</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :state="stateSubmit"
    class="space-y-4"
    :validate="validateForm"
    @submit="onSubmit"
  >
    <div class="mb-6 flex w-1/3 flex-col gap-4">
      <UFormGroup
        v-if="product.variant_type === PRODUCT_VARIANT_TYPES.SINGLE
          || product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE"
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
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Quantity
        </label>
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
            v-model.number="stateSubmit.quantity"
            v-max-number="maxQuantity"
            v-numeric
            class="rounded-l-none"
            type="number"
            :ui="{ base: ' text-center rounded-l-none' }"
          />
          <UButton
            icon="i-heroicons-plus"
            color="white"
            class="rounded-l-none rounded-r-md"
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
        :disabled="isPendingAddProductToCart"
      >
        Add to card
      </UButton>
      <UButton
        size="xl"
        type="submit"
        :disabled="isPendingAddProductToCart"
        @click="state.isBuyNow = true"
      >
        Buy it now
      </UButton>
    </div>
  </UForm>
</template>
