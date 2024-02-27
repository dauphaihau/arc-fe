<script lang="ts" setup>

import { computed } from 'vue';
import { useCartStore } from '~/stores/cart';
import { ORDER_CONFIG } from '~/config/enums/order';
import { ROUTES } from '~/config/enums/routes';

definePageMeta({ layout: 'home' });

const { $api } = useNuxtApp();
const cartStore = useCartStore();

const { pending: pendingGetCart, data: dataGetCart } = await $api.cart.getCart();

onMounted(() => {
  if (dataGetCart.value) {
    cartStore.summaryOrder = dataGetCart.value?.summaryOrder || null;
    cartStore.totalProductsCart = dataGetCart.value?.totalProducts || 0;
    cartStore.itemsCart = dataGetCart.value?.cart?.items;

    dataGetCart.value.cart.items.forEach((item) => {
      cartStore.mapAdditionInfoItems.set(item.shop.id, {
        coupon_codes: [],
        note: '',
      });
    });
  }
});

const itemShops = ref(dataGetCart.value?.cart?.items || []);
const isRedirectCheckout = ref(false);

const isTotalOrderInvalid = computed(() => {
  if (!cartStore.summaryOrder) {
    return true;
  }
  return !(cartStore.summaryOrder.totalPrice < ORDER_CONFIG.MAX_ORDER_TOTAL);
});

const onProductsEmpty = (index: number) => {
  itemShops.value.splice(index, 1);
};

const navigateCheckout = () => {
  isRedirectCheckout.value = true;
  navigateTo(ROUTES.CART + ROUTES.CHECKOUT);
};

onBeforeUnmount(() => {
  if (cartStore.mapAdditionInfoItems.size && !isRedirectCheckout.value) {
    cartStore.mapAdditionInfoItems.clear();
  }
});

</script>


<template>
  <div class="mt-2 py-12">
    <div v-if="pendingGetCart" class="w-full grid place-content-center h-[80vh]">
      <Loading :child-class="'!w-12 !h-12'" />
    </div>
    <div v-else>
      <div v-if="itemShops.length > 0">
        <h1 class="text-2xl font-medium mb-4">
          {{ cartStore.totalProductsCart }} products in your cart
        </h1>

        <div class="grid grid-cols-12 gap-16">
          <div class="col-span-8">
            <div
              v-for="(item, index) of itemShops"
              :key="item.id"
            >
              <ItemCart
                :data="item"
                @on-products-empty="() => onProductsEmpty(index)"
              />
            </div>
          </div>

          <div class="col-span-4 space-y-8">
            <SummaryOrder
              v-if="dataGetCart?.summaryOrder"
              :data="cartStore.summaryOrder || dataGetCart.summaryOrder"
            />

            <div v-if="isTotalOrderInvalid" class="text-red-500">
              The total amount due must be no more than
              {{ formatCurrency(ORDER_CONFIG.MAX_ORDER_TOTAL) }}
            </div>

            <UButton
              class="mx-auto"
              block
              size="xl"
              :disabled="dataGetCart?.totalProducts === 0 || isTotalOrderInvalid"
              :ui="{
                rounded: '!shadow-[0_3px_10px_rgb(0,0,0,0.2)]'
              }"
              @click="navigateCheckout"
            >
              Proceed to checkout
            </UButton>
          </div>
        </div>
      </div>

      <div v-else class="text-center">
        <h3 class="text-3xl text-customGray-950">
          Your cart is empty.
        </h3>
      </div>
    </div>
  </div>
</template>
