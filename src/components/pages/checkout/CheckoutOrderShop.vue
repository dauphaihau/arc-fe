<script setup lang="ts">
import { ORDER_CONFIG } from '~/config/enums/order';
import { useCartStore } from '~/stores/cart';
import type { ResponseGetDetailProduct } from '~/types/product';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';

const cartStore = useCartStore();
const queryClient = useQueryClient();

const cacheGetDetailProduct = queryClient.getQueryData<ResponseGetDetailProduct>(
  ['get-detail-product', cartStore.stateCheckoutNow.product.id]
);

const showNoteInput = ref(!!cartStore.stateCheckoutNow.product.note);

const decreaseQty = () => {
  if (cartStore.stateCheckoutNow.product.quantity === 1) {
    return;
  }
  cartStore.stateCheckoutNow.product.quantity--;
};

watchDebounced(
  () => cartStore.stateCheckoutNow.product.quantity,
  () => {
    const product = cartStore.stateCheckoutNow.product;
    if (product?.stock && product.quantity > product.stock) {
      product.quantity = product.stock;
    }
  },
  { debounce: 500, maxWait: 1000 }
);
</script>

<template>
  <UCard
    v-if="cacheGetDetailProduct?.product"
    :ui="{ base: 'overflow-visible' }"
    class="mb-4"
  >
    <div class="flex flex-col">
      <h3 class="mb-3 text-lg font-medium">
        {{ cacheGetDetailProduct?.product.shop?.shop_name }}
      </h3>

      <div class="mb-8 flex gap-4">
        <NuxtImg
          :src="`domainAwsS3/${cacheGetDetailProduct?.product.images[0].relative_url}`"
          width="180"
          height="180"
          class="max-h-[180px] max-w-[180px] cursor-pointer rounded"
        />

        <div class="flex w-full justify-between">
          <div class="space-y-2">
            <h1 class="cursor-pointer text-xl font-semibold">
              {{ cacheGetDetailProduct?.product?.title }}
            </h1>

            <div class="flex flex-col gap-1">
              <div
                v-if="
                  cacheGetDetailProduct.product.variant_type === PRODUCT_VARIANT_TYPES.SINGLE
                    || cacheGetDetailProduct.product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE
                "
                class="text-lg text-zinc-500"
              >
                {{ cacheGetDetailProduct?.product.variant_group_name }}:
                {{ cartStore.stateCheckoutNow.product.variantName1 }}
              </div>
              <div
                v-if="cacheGetDetailProduct.product.variant_type === PRODUCT_VARIANT_TYPES.COMBINE"
                class="text-lg text-zinc-500"
              >
                {{ cacheGetDetailProduct?.product.variant_sub_group_name }}:
                {{ cartStore.stateCheckoutNow.product.variantName2 }}
              </div>
            </div>

            <div class="w-1/2">
              <UButtonGroup
                size="lg"
                orientation="horizontal"
              >
                <UButton
                  icon="i-heroicons-minus"
                  color="white"
                  class="rounded-l-md rounded-r-none"
                  @click="decreaseQty"
                />
                <UInput
                  v-model.number="cartStore.stateCheckoutNow.product.quantity"
                  class="rounded-l-none"
                  type="number"
                  :ui="{ base: 'text-center rounded-l-none' }"
                  @keypress="keyPressIsNumber($event)"
                />
                <UButton
                  icon="i-heroicons-plus"
                  color="white"
                  class="rounded-l-none rounded-r-md"
                  @click="() => cartStore.stateCheckoutNow.product.quantity++"
                />
              </UButtonGroup>
            </div>
          </div>

          <p
            :key="cartStore.stateCheckoutNow.countRefreshConvertCurrency"
            class="text-xl font-medium text-customGray-950"
          >
            {{ convertCurrency(cartStore.stateCheckoutNow.product.price) }}
          </p>
        </div>
      </div>

      <UDivider />

      <div class="mt-6 flex w-fit flex-col gap-4">
        <CheckoutAddRemoveCoupons />
        <div>
          <UButton
            variant="ghost"
            icon="i-heroicons-clipboard-document-list"
            color="gray"
            class="mb-3 w-fit"
            @click="showNoteInput = !showNoteInput"
          >
            Add a note to {{ cacheGetDetailProduct?.product.shop.shop_name }}
          </UButton>

          <UTextarea
            v-if="showNoteInput"
            v-model="cartStore.stateCheckoutNow.product.note"
            autoresize
            :maxlength="ORDER_CONFIG.MAX_CHAR_NOTE"
            :rows="3"
            size="lg"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>

</style>
