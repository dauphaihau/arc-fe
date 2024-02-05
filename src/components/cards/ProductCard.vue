<script setup lang="ts">
import type { IProduct } from '~/interfaces/product';

const { product } = defineProps<{
  product: IProduct
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
        {{ product?.inventory?.price || 0 }}$
      </p>
      <p class="text-customGray-800 text-sm">
        {{ product?.shop?.shop_name }}
      </p>
    </div>
    <slot name="content" />
  </div>
</template>
