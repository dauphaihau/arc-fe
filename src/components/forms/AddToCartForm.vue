<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types';
import type { IProduct } from '~/interfaces/product';
import { ROUTES } from '~/config/enums/routes';

const emit = defineEmits<{(e: 'onChangeVariant', value: number): void }>();

const { $api } = useNuxtApp();
const toast = useToast();

const { product } = defineProps<{
  product: IProduct
}>();

const formRef = ref();
const loading = ref(false);

interface IStateSubmit {
  quantity: number,
  variant1: string,
  variant2: string,
}

const stateSubmit = reactive<IStateSubmit>({
  quantity: 1,
  variant1: '',
  variant2: '',
});

const qtyVariant = ref(0);

const quantityOpts = computed(() => {
  return new Array(qtyVariant.value || product.quantity).fill('').map((_, index) => (index + 1).toString());
});

const state = reactive({
  firstVariantLabel: '',
  secondVariantLabel: '',
  firstVariantOpts: [] as string[],
  secondVariantOpts: [] as string[],
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
  if (!stateValidate.variant1) {
    errors.push({
      path: 'variant1',
      message: 'Required',
    });
  }

  if (!stateValidate.variant2) {
    errors.push({
      path: 'variant2',
      message: 'Required',
    });
  }
  return errors;
};

async function onSubmit(event: FormSubmitEvent<IStateSubmit>) {
  formRef.value.clear();
  loading.value = true;

  const productVariant = product.variants && product.variants.find((val) => {
    return val.variant_name === stateSubmit.variant1;
  });
  if (!productVariant) {
    toast.add({ title: 'Something Wrong' });
    return;
  }

  const { error } = await $api.cart.addProduct({
    product: product.id,
    product_variant: productVariant.id,
    quantity: Number(event.data.quantity),
    variant: stateSubmit.variant1 + '-' + stateSubmit.variant2,
  });
  loading.value = false;
  if (error.value) {
    toast.add({ title: 'Something Wrong' });
  } else {
    navigateTo(ROUTES.CART);
  }
}

watch(() => [stateSubmit.variant1, stateSubmit.variant2], () => {
  stateSubmit.quantity = 1;
  const foundVariant1 = product.variants?.find(val => val.variant_name === stateSubmit.variant1);
  const foundVariant2 = foundVariant1?.variant_options?.find((val) => {
    return val.variant_name === stateSubmit.variant2;
  });
  if (foundVariant2) {
    emit('onChangeVariant', foundVariant2.price);
    qtyVariant.value = foundVariant2.quantity;
  }
}, { deep: true });

</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :state="stateSubmit"
    class=""
    :validate="validate"
    @submit="onSubmit"
  >
    <div
      v-if="product?.variants && product.variants.length > 0"
      class="w-1/3 flex flex-col gap-4 mb-6"
    >
      <UFormGroup
        :label="state.firstVariantLabel"
        name="variant1"
        required
      >
        <USelectMenu
          v-model="stateSubmit.variant1"
          :placeholder="`Select a ${state.firstVariantLabel}`"
          size="lg"
          :options="state.firstVariantOpts"
        />
      </UFormGroup>

      <UFormGroup
        :label="state.secondVariantLabel"
        required
        name="variant2"
      >
        <USelectMenu
          v-model="stateSubmit.variant2"
          :placeholder="`Select a ${state.secondVariantLabel}`"
          size="lg"
          :options="state.secondVariantOpts"
        />
      </UFormGroup>

      <UFormGroup label="Quantity">
        <USelectMenu
          v-model="stateSubmit.quantity"
          size="lg"
          :options="quantityOpts"
        />
      </UFormGroup>
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
      >
        Buy it now
      </UButton>
    </div>
  </UForm>
</template>
