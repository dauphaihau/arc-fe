<script setup lang="ts">
import type { ResponseGetOrderShops } from '~/types/order';
import { ROUTES } from '~/config/enums/routes';
import type { ElementType } from '~/types/utils';

const { data } = defineProps<{
  data: ElementType<ResponseGetOrderShops['orderShop']['products']>
}>();
</script>

<template>
  <div class="mt-8 flex gap-3">
    <NuxtImg
      :src="data?.image_url"
      width="180"
      height="180"
      class="max-h-[180px] max-w-[180px] cursor-pointer rounded"
    />

    <div class="space-y-4">
      <div class="text-xl font-normal">
        {{ data?.title }}
      </div>
      <div class="flex items-center gap-3">
        <UButton
          :to="`${ROUTES.PRODUCTS}/${data?.product?.id}`"
          size="md"
        >
          Buy this again
        </UButton>
        <div>
          {{ convertCurrency(data?.price) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
