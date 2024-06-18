<script setup lang="ts">
import type { ResponseGetDetailProduct } from '~/interfaces/product';

const { product } = defineProps<ResponseGetDetailProduct>();

const items = [{
  label: 'Product details',
  icon: 'i-heroicons-information-circle',
  defaultOpen: true,
  content: product.description ?? '',
}, {
  label: 'Delivery and return policies',
  icon: 'i-heroicons-receipt-refund',
  disabled: true,
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque elit, tristique placerat feugiat ac, facilisis vitae arcu. Proin eget egestas augue. Praesent ut sem nec arcu pellentesque aliquet. Duis dapibus diam vel metus tempus vulputate.',
}, {
  label: 'Meet your sellers',
  disabled: true,
  icon: 'i-heroicons-building-storefront',
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque elit, tristique placerat feugiat ac, facilisis vitae arcu. Proin eget egestas augue. Praesent ut sem nec arcu pellentesque aliquet. Duis dapibus diam vel metus tempus vulputate.',
}];
</script>

<template>
  <UAccordion
    color="gray"
    variant="ghost"
    size="sm"
    :items="items"
    :ui="{
      item: {
        padding: 'pl-3',
      },
    }"
  />
</template>
