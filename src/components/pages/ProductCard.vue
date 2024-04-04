<script setup lang="ts">
import type { ResponseGetProducts } from '~/interfaces/product';
import { ROUTES } from '~/config/enums/routes';
import { COUPON_TYPES } from '~/config/enums/coupon';

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
      class="rounded w-full h-full"
      preload
    />
    <div class="space-y-1">
      <h1 class="text-xl font-semibold truncate">
        {{ product.title }}
      </h1>
      <div class="flex flex-wrap gap-2 items-center">
        <p class="text-customGray-950 text-base font-medium">
          {{
            product?.summary_inventory?.sale_price ?
              convertCurrency(product?.summary_inventory?.sale_price) :
              convertCurrency(product?.summary_inventory?.lowest_price)
          }}
        </p>
        <p
          v-if="product?.summary_inventory?.sale_price"
          class="text-customGray-950 text-sm font-medium line-through decoration-1"
        >
          {{ convertCurrency(product?.summary_inventory.lowest_price) }}
        </p>
        <p
          v-if="product?.summary_inventory?.sale_price"
          class="text-green-500 text-sm"
        >
          ({{ product?.summary_inventory.percent_off }}% off)
        </p>
      </div>
      <p class="text-customGray-800 text-sm">
        {{ product?.shop_name }}
      </p>
      <UBadge
        v-if="
          product.summary_inventory.discount_types.includes(COUPON_TYPES.FREE_SHIP)"
        color="green"
        variant="solid"
      >
        Free delivery
      </UBadge>
    </div>
    <slot name="content" />
  </div>
</template>
