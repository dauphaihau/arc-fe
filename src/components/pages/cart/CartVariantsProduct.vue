<script setup lang="ts">
import type { IProductCartPopulated } from '~/interfaces/cart';

const { data } = defineProps<{ data: IProductCartPopulated }>();

const state = reactive({
  v1: '',
  v2: '',
});

onMounted(() => {
  if (data.variant.variant_name) {
    const [v1, v2] = data.variant.variant_name.split('-');
    state.v1 = v1;
    state.v2 = v2;
  }
});

</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="text-zinc-500 text-lg">
      {{ data.inventory.product?.variant_group_name }}: {{ state.v1 }}
    </div>
    <div
      v-if="data.inventory.product?.variant_sub_group_name"
      class="text-zinc-500 text-lg"
    >
      {{ data.inventory.product?.variant_sub_group_name }}: {{ state.v2 }}
    </div>
  </div>
</template>
