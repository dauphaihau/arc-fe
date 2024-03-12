<script lang="ts" setup>

import { useSessionStorage } from '@vueuse/core';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { IUserActivitiesSessionStorage } from '~/interfaces/common';

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

onMounted(() => {
  if (data.value) {
    const userActivities = parseJSON<IUserActivitiesSessionStorage>(
      sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES
      ));
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES);

    useSessionStorage(
      SESSION_STORAGE_KEYS.USER_ACTIVITIES,
      { ...userActivities, categoryProductVisited: data.value.product.category }
    );
  }
});

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
  <div class="mt-24">
    <div v-if="pending" class="w-full grid place-content-center h-[80vh]">
      <Loading :child-class="'!w-12 !h-12'" />
    </div>
    <div v-else class="space-y-20">
      <div v-if="data?.product">
        <div class="grid grid-cols-7 mb-20">
          <DetailProductImages :images="data.product.images" class="col-span-4" />
          <div class="space-y-6 col-span-2">
            <!--            <div class="text-red-800 text-md font-semibold">-->
            <!--              Only 6 left and in 7 baskets-->
            <!--            </div>-->
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
              {{ priceVariantSelected ?
                formatCurrency(priceVariantSelected) :
                summaryInventory.lowestPrice === summaryInventory.highestPrice ?
                  `${formatCurrency(summaryInventory.lowestPrice)}` :
                  `${formatCurrency(summaryInventory.lowestPrice)} -
                ${formatCurrency(summaryInventory.highestPrice)}`
              }}
            </div>

            {{ data.product.title }}

            <DetailProductAddToCartForm
              :product="data.product"
              @on-change-variant="(val) => priceVariantSelected = val"
            />
            <DetailProductInformation
              :product="data.product"
            />
          </div>
        </div>
        <DetailProductMoreProductsByShop :shop-id="data.product.shop.id" class="mb-16" />
        <DetailProductMoreProductsByCategory :category-id="data.product.category" />
      </div>
    </div>
  </div>
</template>
