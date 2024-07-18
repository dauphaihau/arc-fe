<script setup lang="ts">
import type { ResponseGetProducts } from '~/types/product';
import { ROUTES } from '~/config/enums/routes';

const { product } = defineProps<{
  product: ResponseGetProducts
}>();
</script>

<template>
  <NuxtLink
    class="relative flex cursor-pointer flex-col gap-2"
    :to="`${ROUTES.PRODUCTS}/${product.id}`"
  >
    <NuxtImg
      :src="`domainAwsS3/${product.image_relative_url}`"
      width="250"
      height="160"
      class="size-full rounded-lg"
    />
    <div class="absolute bottom-3 left-3 space-y-0.5 rounded-lg bg-white px-2.5 py-1">
      <p class="text-md font-medium text-customGray-950">
        {{ convertCurrency(product?.inventory?.price) }}
      </p>
    </div>
    <slot name="content" />
  </NuxtLink>
</template>
