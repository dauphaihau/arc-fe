<script setup lang="ts">
import type { IProductCart } from '~/interfaces/cart';

const { data } = defineProps<{ data: IProductCart }>();

const state = reactive({
  v1: '',
  v2: '',
});

onMounted(() => {
  if (data.inventory?.variant) {
    const [v1, v2] = data.inventory.variant.split('-');
    state.v1 = v1;
    state.v2 = v2;
  }
});

</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="text-zinc-500 text-lg">
      {{ data.variant?.variant_group_name }}: {{ state.v1 }}
    </div>
    <div
      v-if="data.variant?.sub_variant_group_name"
      class="text-zinc-500 text-lg"
    >
      {{ data.variant?.sub_variant_group_name }}: {{ state.v2 }}
    </div>
  </div>
</template>
