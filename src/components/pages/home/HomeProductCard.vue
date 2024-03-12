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
    class="flex flex-col gap-2 cursor-pointer relative"
    @click="() => router.push(`${ROUTES.PRODUCTS}/${product.id}`)"
  >
    <NuxtImg
      :src="config.public.awsHostBucket + '/' + product.image_relative_url"
      width="250"
      height="160"
      class="rounded-lg w-full h-full"
      preload
    />
    <div class="space-y-0.5 absolute left-3 bottom-3 bg-white rounded-lg py-1 px-2.5">
      <p class="text-customGray-950 text-md font-medium">
        {{ formatCurrency(product?.summary_inventory?.lowest_price) }}
      </p>
    </div>
    <slot name="content" />
  </div>
</template>
