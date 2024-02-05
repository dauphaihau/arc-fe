<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types';
import type { IProduct } from '~/interfaces/product';
import { ROUTES } from '~/config/enums/routes';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';
import type { IAddProductCart } from '~/interfaces/cart';

const emit = defineEmits<{(e: 'onChangeVariant', value: number): void }>();

const { $api } = useNuxtApp();
const toast = useToast();

const { product } = defineProps<{
  product: IProduct
}>();

const formRef = ref();
const loading = ref(false);

interface IStateSubmit extends IAddProductCart {
  variantField1: string,
  variantField2: string,
}

const stateSubmit = reactive<IStateSubmit>({
  quantity: 1,
  inventory: '',
  variant: '',
  variantField1: '',
  variantField2: '',
});

const state = reactive({
  firstVariantLabel: '',
  secondVariantLabel: '',
  isVariant: product.variants && product.variants.length > 0,
  firstVariantOpts: [] as string[],
  secondVariantOpts: [] as string[],
  qtyVariant: 0,
});

const quantityOpts = computed(() => {
  const stock = (product.inventory && product.inventory.stock) || 1;
  return new Array(state.isVariant ? state.qtyVariant : stock)
    .fill('')
    .map((_, index) => (index + 1).toString());
});

onMounted(() => {
  if (product?.variants && product.variants.length > 0) {
    const variant = product.variants[0];
    state.firstVariantLabel = variant?.variant_group_name;
    state.secondVariantLabel = variant?.sub_variant_group_name as string;

    state.firstVariantOpts = product.variants.map(val => val.variant_name);
    if (variant?.variant_options) {
      state.secondVariantOpts = variant.variant_options?.map(val => val.variant_name);
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
  formRef.value.clear();
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
  const { error } = await $api.cart.addProduct(payload);
  loading.value = false;
  if (error.value) {
    toast.add({ title: 'Something Wrong' });
  } else {
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
      state.qtyVariant = foundVariant1.inventory.stock;
      stateSubmit.inventory = foundVariant1.inventory.id;
      stateSubmit.variant = foundVariant1.id;
    }

    if (product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE && foundVariant1) {
      const foundVariant2 = foundVariant1?.variant_options?.find((val) => {
        return val.variant_name === stateSubmit.variantField2;
      });
      if (foundVariant2) {
        emit('onChangeVariant', foundVariant2.inventory.price);
        state.qtyVariant = foundVariant2.inventory.stock;
        stateSubmit.inventory = foundVariant2.inventory.id;
        stateSubmit.variant = foundVariant1.id;
      }
    }
  }
}, { deep: true });

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
    <div
      v-if="product?.variants && product.variants.length > 0"
      class="w-1/3 flex flex-col gap-4 mb-6"
    >
      <UFormGroup
        v-if="state.firstVariantLabel"
        :label="state.firstVariantLabel"
        name="variantField1"
        required
      >
        <USelectMenu
          v-model="stateSubmit.variantField1"
          :placeholder="`Select a ${state.firstVariantLabel}`"
          size="lg"
          :options="state.firstVariantOpts"
        />
      </UFormGroup>

      <UFormGroup
        v-if="state.secondVariantLabel"
        :label="state.secondVariantLabel"
        required
        name="variantField2"
      >
        <USelectMenu
          v-model="stateSubmit.variantField2"
          :placeholder="`Select a ${state.secondVariantLabel}`"
          size="lg"
          :options="state.secondVariantOpts"
        />
      </UFormGroup>
    </div>

    <UFormGroup label="Quantity" class="w-1/4">
      <USelectMenu
        v-model="stateSubmit.quantity"
        size="lg"
        :options="quantityOpts"
      />
    </UFormGroup>

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
      >
        Buy it now
      </UButton>
    </div>
  </UForm>
</template>
