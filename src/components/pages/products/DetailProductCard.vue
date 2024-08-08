<script setup lang="ts">
import { ROUTES } from '~/config/enums/routes';
import type { ResponseGetProducts_Product } from '~/types/request-api/product';

const { product } = defineProps<{
  product: ResponseGetProducts_Product
}>();

const router = useRouter();
</script>

<template>
  <div
    class="flex cursor-pointer flex-col gap-2"
    @click="() => router.push(`${ROUTES.PRODUCTS}/${product.id}`)"
  >
    <NuxtImg
      :src="`domainAwsS3/${product.image_relative_url}`"
      width="210"
      height="160"
      class="rounded"
      preload
    />
    <div class="space-y-0.5">
      <h1 class="truncate text-sm font-semibold">
        {{ product.title }}
      </h1>
      <p class="text-sm text-customGray-800">
        {{ product.shop.shop_name }}
      </p>
      <p class="text-base font-medium text-customGray-950">
        {{ formatCurrency(product?.inventory?.price) }}
      </p>
    </div>
    <slot name="content" />
  </div>
</template>
