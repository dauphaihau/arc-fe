<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types';
import { ROUTES } from '~/config/enums/routes';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';
import type { IAddProductCart } from '~/interfaces/cart';
import type { ResponseGetDetailProduct } from '~/interfaces/product';

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
const loading = ref(false);

interface IStateSubmit extends IAddProductCart {
  variantField1: string,
  variantField2: string,
}

const state = reactive({
  firstVariantLabel: product.variant_group_name,
  secondVariantLabel: product.variant_sub_group_name,
  isVariant: product.variants && product.variants.length > 0,
  firstVariantOpts: [] as string[],
  secondVariantOpts: [] as string[],
  stockVariant: 0,
  priceVariant: 0,
  variantName1: '',
  variantName2: '',
  isBuyNow: false,
});

const stateSubmit = reactive<IStateSubmit>({
  quantity: 1,
  inventory: '',
  variant: '',
  variantField1: '',
  variantField2: '',
});

const maxQuantity = computed(() => {
  if (state.isVariant) {
    return state.stockVariant;
  } else {
    return (product.inventory && product.inventory.stock) || 1;
  }
});

onMounted(() => {
  if (product?.variants && product.variants.length > 0) {
    state.firstVariantOpts = product.variants.map(val => val.variant_name);

    const variant = product.variants[0];
    if (variant?.variant_options) {
      state.secondVariantOpts = variant.variant_options.map(val => val.variant.variant_name);
    }
  }
});

const validate = (stateValidate: IStateSubmit): FormError[] => {
  const errors: FormError[] = [];

  if (product.variant_type !== PRODUCT_VARIANT_TYPES.NONE) {
    if (!stateValidate.variantField1) {
      errors.push({
        path: 'variantField1',
        message: 'Required',
      });
    }

    if (product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE && !stateValidate.variantField2) {
      errors.push({
        path: 'variantField2',
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
  loading.value = true;

  const payload: IAddProductCart = {
    inventory: product.variant_type === PRODUCT_VARIANT_TYPES.NONE ?
        product?.inventory?.id as string :
      stateSubmit.inventory,
    quantity: Number(event.data.quantity),
  };
  if (stateSubmit.variant) {
    payload.variant = stateSubmit.variant;
  }
  const { error, data } = await $api.cart.addProduct(payload);
  loading.value = false;
  if (error.value) {
    toast.add({ title: 'Something Wrong' });
  } else {
    cartStore.summaryOrder = data.value?.summaryOrder || null;
    await cartStore.getCartHeader();
    navigateTo(ROUTES.CART);
  }
}

watch(() => [stateSubmit.variantField1, stateSubmit.variantField2], () => {
  stateSubmit.quantity = 1;
  if (product.variant_type !== PRODUCT_VARIANT_TYPES.NONE) {
    const foundVariant1 = product.variants?.find((val) => {
      return val.variant_name === stateSubmit.variantField1;
    });
    if (foundVariant1 && product.variant_type === PRODUCT_VARIANT_TYPES.SINGLE) {
      emit('onChangeVariant', foundVariant1.inventory.price);
      state.stockVariant = foundVariant1.inventory.stock;
      state.priceVariant = foundVariant1.inventory?.price;
      state.variantName1 = foundVariant1.variant_name;
      stateSubmit.inventory = foundVariant1.inventory.id;
      stateSubmit.variant = foundVariant1.id;
    }

    if (product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE && foundVariant1) {
      const foundVariant2 = foundVariant1?.variant_options?.find((val) => {
        return val.variant.variant_name === stateSubmit.variantField2;
      });
      if (foundVariant2) {
        emit('onChangeVariant', foundVariant2.inventory.price);
        state.stockVariant = foundVariant2.inventory.stock;
        state.priceVariant = foundVariant2.inventory.price;
        state.variantName1 = foundVariant1.variant_name;
        state.variantName2 = foundVariant2.variant.variant_name;
        stateSubmit.inventory = foundVariant2.inventory.id;
        stateSubmit.variant = foundVariant1.id;
      }
    }
  }
}, { deep: true });

const decreaseQty = () => {
  if (stateSubmit.quantity === 1) {
    return;
  }
  stateSubmit.quantity--;
};

watch(() => stateSubmit.quantity, () => {
  if (maxQuantity.value && stateSubmit.quantity > maxQuantity.value) {
    stateSubmit.quantity = maxQuantity.value;
  }
});

const onBuyNow = () => {
  cartStore.productCheckoutNow = {
    variant: stateSubmit.variant,
    quantity: stateSubmit.quantity,
    inventory: stateSubmit.inventory,
    title: product.title,
    url_image: config.public.awsHostBucket + '/' + product?.images[0]?.relative_url,
    price: state.priceVariant,
    stock: state.stockVariant,
    firstVariantLabel: state.firstVariantLabel,
    secondVariantLabel: state.secondVariantLabel,
    variantName1: state.variantName1,
    variantName2: state.variantName2,
    shop: product.shop,
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
        v-if="state.firstVariantLabel && state.isVariant"
        :label="state.firstVariantLabel"
        name="variantField1"
      >
        <USelectMenu
          v-model="stateSubmit.variantField1"
          :placeholder="`Select a ${state.firstVariantLabel}`"
          size="lg"
          :options="state.firstVariantOpts"
        />
      </UFormGroup>

      <UFormGroup
        v-if="state.secondVariantLabel && state.isVariant"
        :label="state.secondVariantLabel"
        name="variantField2"
      >
        <USelectMenu
          v-model="stateSubmit.variantField2"
          :placeholder="`Select a ${state.secondVariantLabel}`"
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
        @click="state.isBuyNow = true"
      >
        Buy it now
      </UButton>
    </div>
  </UForm>
</template>
