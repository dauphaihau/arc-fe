<script setup lang="ts">
import type { IProductCart } from '~/interfaces/cart';

const { data } = defineProps<{ data: IProductCart }>();

const state = reactive({
  v1: '',
  v2: '',
});

onMounted(() => {
  if (data.variant) {
    const [v1, v2] = data.variant.split('-');
    state.v1 = v1;
    state.v2 = v2;
  }
});

</script>

<template>
  <div class="flex flex-col gap-3">
    <div>
      {{ data.product_variant.variant_group_name }}: {{ state.v1 }}
    </div>
    <div>
      {{ data.product_variant.sub_variant_group_name }}: {{ state.v2 }}
    </div>
  </div>
</template>
