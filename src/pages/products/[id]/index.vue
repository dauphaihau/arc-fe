<script lang="ts" setup>

import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';

definePageMeta({ layout: 'home' });

const { $api } = useNuxtApp();
const route = useRoute();

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

const priceVariantSelected = ref(0);

const summaryInventory = computed(() => {
  const summary = {
    lowestPrice: 0,
    highestPrice: 0,
    stock: 0,
  };
  if (data.value) {
    const { variant_type, variants } = data.value.product;
    variants && variants.forEach((variant, indexVariant) => {
      if (variant_type === PRODUCT_VARIANT_TYPES.SINGLE && variant?.inventory?.price) {
        summary.stock += variant.inventory.stock;

        if (indexVariant === 0 || (variant.inventory.price < summary.lowestPrice)) {
          summary.lowestPrice = variant.inventory.price;
        }
        if (indexVariant === 0 || (variant.inventory.price > summary.highestPrice)) {
          summary.highestPrice = variant.inventory.price;
        }
      }

      if (variant_type === PRODUCT_VARIANT_TYPES.COMBINE) {
        variant.variant_options.forEach((varOpt, indexVarOpt) => {
          summary.stock += varOpt.inventory.stock;
          if (indexVarOpt === 0 || (varOpt.inventory.price < summary.lowestPrice)) {
            summary.lowestPrice = varOpt.inventory.price;
          }
          if (indexVarOpt === 0 || (varOpt.inventory.price > summary.highestPrice)) {
            summary.highestPrice = varOpt.inventory.price;
          }
        });
      }
    });
  }
  return summary;
});

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
          <div
            v-if="data.product.variant_type === PRODUCT_VARIANT_TYPES.NONE"
            class="font-bold text-xl"
          >
            {{ formatCurrency(data.product.inventory?.price) }}
          </div>
          <div
            v-else
            class="font-bold text-xl"
          >
            {{ priceVariantSelected ? formatCurrency(priceVariantSelected) :
              `${formatCurrency(summaryInventory.lowestPrice)} -
             ${formatCurrency(summaryInventory.highestPrice)}`
            }}
          </div>

          {{ data.product.title }}

          <AddToCartForm
            :product="data.product"
            @on-change-variant="(val) => priceVariantSelected = val"
          />
        </div>
      </div>
      <div v-else>
        product not found
      </div>
    </div>
  </div>
</template>
