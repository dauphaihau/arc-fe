<script lang="ts" setup>

import type { IProduct } from '~/interfaces/product';

const { images } = defineProps<{
  images: IProduct['images']
}>();

const config = useRuntimeConfig();

const selectedImg = ref(0);

</script>

<template>
  <div class="flex gap-2">
    <div class="flex flex-col gap-3 w-fit">
      <div v-for="(image, index) of images" :key="image.id">
        <NuxtImg
          preload
          :src="config.public.awsHostBucket + '/' + image.relative_url"
          width="100"
          height="100"
          :class="[
            'rounded cursor-pointer',
            {
              'rounded ring ring-primary': selectedImg === index,
            }]"
          @click="() => selectedImg = index"
        />
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div
        class="arrow"
        @click="selectedImg--"
      >
        <Icon name="i-material-symbols:arrow-back-ios-new-rounded" color="black" />
      </div>
      <NuxtImg
        preload
        :src="config.public.awsHostBucket + '/' + images[selectedImg].relative_url"
        width="575"
        height="575"
        class="rounded"
      />
      <div
        class="arrow"
        @click="selectedImg++"
      >
        <Icon name="i-material-symbols:arrow-forward-ios" color="black" />
      </div>
    </div>
  </div>
</template>

<style scoped>

.arrow {
  @apply cursor-pointer bg-white rounded-full p-4
  shadow-[0_3px_10px_rgb(0,0,0,0.2)]
  h-10 w-10 grid place-content-center;
}

</style>
