<script setup lang="ts">
import type { IItemCart } from '~/interfaces/cart';

const { data } = defineProps<{
  data: IItemCart
}>();

const emit = defineEmits<{(e: 'refreshCart'): void }>();

</script>

<template>
  <div class="flex flex-col">
    <h3 class="text-xl font-medium mb-3">
      {{ data.shop?.shop_name }}
    </h3>

    <div v-for="(prod, index) of data.products" :key="index">
      <ProductCartCard
        :prod="prod"
        @refresh-cart="emit('refreshCart')"
      />
    </div>
  </div>
</template>
