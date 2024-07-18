<script setup lang="ts">
import { ROUTES } from '~/config/enums/routes';
import { COUPON_TYPES } from '~/config/enums/coupon';
import type { ResponseGetProducts } from '~/types/product';

const { product } = defineProps<{
  product: ResponseGetProducts
}>();

const router = useRouter();
const lowStock = 5;
</script>

<template>
  <div
    class="flex cursor-pointer flex-col gap-2"
    @click="() => router.push(`${ROUTES.PRODUCTS}/${product?.id}`)"
  >
    <NuxtImg
      :src="`domainAwsS3/${product?.image_relative_url}`"
      width="200"
      height="200"
      class="size-full rounded"
    />

    <div class="space-y-1">
      <h1 class="truncate text-xl font-semibold">
        {{ product?.title }}
      </h1>
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-base font-medium text-customGray-950">
          {{ convertCurrency(product.inventory.price) }}
        </p>
        <p
          v-if="product?.inventory?.origin_price"
          class="text-sm font-medium text-customGray-950 line-through decoration-1"
        >
          {{ convertCurrency(product.inventory.origin_price) }}
        </p>
        <p
          v-if="product?.coupon?.percent_off"
          class="text-sm text-green-500"
        >
          ({{ product?.coupon?.percent_off }}% off)
        </p>
      </div>
      <p class="text-sm text-customGray-800">
        {{ product?.shop.shop_name }}
      </p>
      <UBadge
        v-if="product.coupon?.types.includes(COUPON_TYPES.FREE_SHIP)"
        color="green"
        variant="solid"
      >
        Free delivery
      </UBadge>
      <p
        v-if="product.inventory.stock < lowStock"
        class="text-[13px] text-red-600"
      >
        Only {{ product.inventory.stock }} left - order soon
      </p>
    </div>
    <slot name="content" />
  </div>
</template>
