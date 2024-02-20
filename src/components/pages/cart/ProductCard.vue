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
    class="flex flex-col gap-2 cursor-pointer"
    @click="() => router.push(`${ROUTES.PRODUCTS}/${product.id}`)"
  >
    <NuxtImg
      :src="config.public.awsHostBucket + '/' + product.image_relative_url"
      width="200"
      height="200"
      class="rounded"
      preload
    />
    <div class="space-y-0.5">
      <h1 class="text-xl font-semibold truncate">
        {{ product.title }}
      </h1>
      <p class="text-customGray-950 text-md font-medium">
        {{ formatCurrency(product?.summary_inventory?.lowest_price) }}
        <!--        {{-->
        <!--          product.summary_inventory.highest_price > 0 &&-->
        <!--            ' - ' + formatCurrency(product?.summary_inventory?.highest_price)-->
        <!--        }}-->
      </p>
      <p class="text-customGray-800 text-sm">
        {{ product?.shop_name }}
      </p>
    </div>
    <slot name="content" />
  </div>
</template>
