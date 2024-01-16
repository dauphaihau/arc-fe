<script lang="ts" setup>

definePageMeta({ layout: 'home' });

const { $api } = useNuxtApp();
const route = useRoute();

const priceVariant = ref(0);

const {
  pending, data, error: notFound,
} = await $api.product.getDetailProduct(route.params.id as string);

if (notFound.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
}

</script>

<template>
  <div class="mt-10">
    <div v-if="pending">
      loading...
    </div>
    <div v-else>
      <div v-if="data?.product" class="flex gap-8">
        <DetailImagesProduct :images="data.product.images" />
        <div class="space-y-6 grow">
          <div class="font-bold text-xl">
            {{ priceVariant || data.product.price }}$
          </div>
          {{ data.product.title }}

          <AddToCartForm
            :product="data.product"
            @on-change-variant="(val) => priceVariant = val"
          />
        </div>
      </div>
      <div v-else>
        product not found
      </div>
    </div>
  </div>
</template>
