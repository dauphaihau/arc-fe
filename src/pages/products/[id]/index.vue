<script lang="ts" setup>
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';
import { useGetDetailProduct } from '~/services/product';

definePageMeta({ layout: 'market' });

const route = useRoute();
const marketStore = useMarketStore();

const {
  data,
  isPending: isPendingGetDetailProduct,
} = useGetDetailProduct(route.params.id as string, {
  onResponse: ({ response }) => {
    if (response.status === 200 && response._data?.product) {
      marketStore.userActivities.categoryIdProductVisited = response._data.product.category;
    }
    else {
      throw showError({
        statusCode: 404,
        statusMessage: 'Product Not Found',
        fatal: true,
      });
    }
  },
});

const priceVariantSelected = ref(0);

const summaryInventory = computed(() => {
  const summary = {
    lowestPrice: 0,
    highestPrice: 0,
    stock: 0,
  };
  if (data.value) {
    const product = data.value.product;
    const variant_type = product.variant_type;

    if (variant_type === PRODUCT_VARIANT_TYPES.NONE) {
      summary.lowestPrice = product.inventory.price;
      return summary;
    }

    if (variant_type === PRODUCT_VARIANT_TYPES.SINGLE) {
      product.variants && product.variants.forEach((variant, indexVariant) => {
        summary.stock += variant.inventory.stock;
        if (indexVariant === 0 || (variant.inventory.price < summary.lowestPrice)) {
          summary.lowestPrice = variant.inventory.price;
        }
        if (indexVariant === 0 || (variant.inventory.price > summary.highestPrice)) {
          summary.highestPrice = variant.inventory.price;
        }
      });
    }

    if (variant_type === PRODUCT_VARIANT_TYPES.COMBINE) {
      product.variants && product.variants.forEach((variant) => {
        variant.variant_options.forEach((varOpt, indexVarOpt) => {
          summary.stock += varOpt.inventory.stock;
          if (indexVarOpt === 0 || (varOpt.inventory.price < summary.lowestPrice)) {
            summary.lowestPrice = varOpt.inventory.price;
          }
          if (indexVarOpt === 0 || (varOpt.inventory.price > summary.highestPrice)) {
            summary.highestPrice = varOpt.inventory.price;
          }
        });
      });
    }
  }
  return summary;
});
</script>

<template>
  <div class="mt-24">
    <div
      v-if="isPendingGetDetailProduct"
      class="grid h-[80vh] w-full place-content-center"
    >
      <LoadingSvg :child-class="'!w-12 !h-12'" />
    </div>
    <div
      v-else-if="data?.product"
      class="space-y-20"
    >
      <div class="mb-20 grid grid-cols-10">
        <DetailProductImages
          :images="data.product.images"
          class="col-span-6"
        />
        <div class="col-span-4 space-y-6">
          <!--            <div class="text-red-800 text-md font-semibold"> -->
          <!--              Only 6 left and in 7 baskets -->
          <!--            </div> -->
          <div
            v-if="data.product.variant_type === PRODUCT_VARIANT_TYPES.NONE"
            class="text-xl font-bold"
          >
            {{ convertCurrency(summaryInventory.lowestPrice) }}
          </div>
          <div
            v-else
            class="text-xl font-bold"
          >
            {{ priceVariantSelected
              ? convertCurrency(priceVariantSelected)
              : summaryInventory.lowestPrice === summaryInventory.highestPrice
                ? `${convertCurrency(summaryInventory.lowestPrice)}`
                : `${convertCurrency(summaryInventory.lowestPrice)} -
                ${convertCurrency(summaryInventory.highestPrice)}`
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
      <DetailProductMoreProductsByShop
        :shop-id="data.product.shop.id"
        class="mb-16"
      />
      <DetailProductMoreProductsByCategory :category-id="data.product.category" />
    </div>
  </div>
</template>
