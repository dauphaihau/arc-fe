<script setup lang="ts">
import type { ResponseGetProducts } from '~/interfaces/product';
import { ROUTES } from '~/config/enums/routes';

const { product } = defineProps<{
  product: ResponseGetProducts
}>();

const config = useRuntimeConfig();
const router = useRouter();
</script>

<template>
  <div
    class="relative flex cursor-pointer flex-col gap-2"
    @click="() => router.push(`${ROUTES.PRODUCTS}/${product.id}`)"
  >
    <NuxtImg
      :src="config.public.awsHostBucket + '/' + product.image_relative_url"
      width="250"
      height="160"
      class="size-full rounded-lg"
      preload
    />
    <div class="absolute bottom-3 left-3 space-y-0.5 rounded-lg bg-white px-2.5 py-1">
      <p class="text-md font-medium text-customGray-950">
        {{ convertCurrency(product?.summary_inventory?.lowest_price) }}
      </p>
    </div>
    <slot name="content" />
  </div>
</template>
