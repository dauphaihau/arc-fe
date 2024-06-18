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
    class="flex cursor-pointer flex-col gap-2"
    @click="() => router.push(`${ROUTES.PRODUCTS}/${product.id}`)"
  >
    <NuxtImg
      :src="config.public.awsHostBucket + '/' + product.image_relative_url"
      width="200"
      height="200"
      class="size-full rounded"
      preload
    />
    <div class="space-y-1">
      <h1 class="truncate text-xl font-semibold">
        {{ product.title }}
      </h1>
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-base font-medium text-customGray-950">
          {{
            product?.summary_inventory?.sale_price
              ? convertCurrency(product?.summary_inventory?.sale_price)
              : convertCurrency(product?.summary_inventory?.lowest_price)
          }}
        </p>
        <p
          v-if="product?.summary_inventory?.sale_price"
          class="text-sm font-medium text-customGray-950 line-through decoration-1"
        >
          {{ convertCurrency(product?.summary_inventory.lowest_price) }}
        </p>
        <p
          v-if="product?.summary_inventory?.sale_price"
          class="text-sm text-green-500"
        >
          ({{ product?.summary_inventory.percent_off }}% off)
        </p>
      </div>
      <p class="text-sm text-customGray-800">
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
