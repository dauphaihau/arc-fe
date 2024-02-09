<script setup lang="ts">
import type { ResponseGetProducts } from '~/interfaces/product';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';

const { product } = defineProps<{
  product: ResponseGetProducts
}>();

const config = useRuntimeConfig();
const router = useRouter();

</script>

<template>
  <div
    class="flex flex-col gap-2 cursor-pointer"
    @click="() => router.push(`/products/${product.id}`)"
  >
    <NuxtImg
      :src="config.public.awsHostBucket + '/' + product.images[0].relative_url"
      width="200"
      height="200"
      class="rounded"
      preload
    />
    <div class="space-y-0.5">
      <h1 class="text-xl font-semibold">
        {{ product.title }}
      </h1>
      <p class="text-customGray-950 text-md font-medium">
        {{
          product.variant_type !== PRODUCT_VARIANT_TYPES.NONE ?
            formatCurrency(product?.summary_inventory?.lowest_price) :
            formatCurrency(product?.inventory?.price)
        }}
      </p>
      <p class="text-customGray-800 text-sm">
        {{ product?.shop?.shop_name }}
      </p>
    </div>
    <slot name="content" />
  </div>
</template>
