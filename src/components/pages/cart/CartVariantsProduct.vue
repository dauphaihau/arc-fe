<script setup lang="ts">
import type { IProductCartPopulated } from '~/interfaces/cart';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';

const { data } = defineProps<{ data: IProductCartPopulated }>();

const state = reactive({
  v1: '',
  v2: '',
  variant_group_name: '',
  variant_sub_group_name: '',
});

onMounted(() => {
  if (data.variant.variant_name) {
    const [v1, v2] = data.variant.variant_name.split('-');
    state.v1 = v1;
    state.v2 = v2;
  }
  const { variant_type } = data.inventory.product;
  if (variant_type === PRODUCT_VARIANT_TYPES.SINGLE) {
    state.variant_group_name = data.inventory.product.variant_group_name;
  }
  if (variant_type === PRODUCT_VARIANT_TYPES.COMBINE) {
    state.variant_group_name = data.inventory.product.variant_group_name;
    state.variant_sub_group_name = data.inventory.product.variant_sub_group_name;
  }
});

</script>

<template>
  <div class="flex flex-col gap-1">
    <div
      v-if="state.variant_group_name"
      class="text-zinc-500 text-lg"
    >
      {{ state.variant_group_name }}: {{ state.v1 }}
    </div>
    <div
      v-if="state.variant_sub_group_name"
      class="text-zinc-500 text-lg"
    >
      {{ state.variant_sub_group_name }}: {{ state.v2 }}
    </div>
  </div>
</template>
