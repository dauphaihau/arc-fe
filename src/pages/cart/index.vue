<script lang="ts" setup>
import { StatusCodes } from 'http-status-codes';
import { useCartStore } from '~/stores/cart';
import { useGetCart } from '~/services/cart';
import type { ItemCartPopulated, ResponseGetCart } from '~/types/cart';

definePageMeta({ layout: 'market', middleware: ['auth'] });

const cartStore = useCartStore();

const orderShops = ref<ItemCartPopulated[]>([]);
const wrapperSummaryOrderRef = ref<HTMLDivElement | null>(null);
const contentSummaryOrderRef = ref<HTMLDivElement | null>(null);

const {
  isPending: isPendingGetCart,
  data: dataGetCart,
} = useGetCart({
  onResponse: ({ response }) => {
    const responseGetCart: ResponseGetCart = response._data;
    if (response.status === StatusCodes.OK && responseGetCart) {
      responseGetCart.cart.items.forEach((item) => {
        cartStore.additionInfoOrderShops.set(item.shop.id, {
          coupon_codes: [],
          note: '',
        });
      });

      orderShops.value = responseGetCart.cart.items;
    }
  },
});

const onProductsEmpty = (index: number) => {
  orderShops.value.splice(index, 1);
};

function onScroll() {
  const scrollTop = window.scrollY;
  const viewportHeight = window.innerHeight;

  if (!wrapperSummaryOrderRef.value || !contentSummaryOrderRef.value) {
    return;
  }

  const wrapperContentTop = wrapperSummaryOrderRef.value?.getBoundingClientRect()?.top + window.pageYOffset;
  const contentHeight = contentSummaryOrderRef.value?.getBoundingClientRect().height;

  if (contentHeight && scrollTop >= contentHeight - viewportHeight + wrapperContentTop) {
    contentSummaryOrderRef.value.style.transform = `translateY(-${(contentHeight - viewportHeight + wrapperContentTop)}px)`;
    contentSummaryOrderRef.value.style.position = 'fixed';
  }
  else {
    contentSummaryOrderRef.value.style.transform = '';
    contentSummaryOrderRef.value.style.position = '';
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll);
});


onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <div class="mt-2 py-12">
    <div
      v-if="isPendingGetCart"
      class="grid h-[80vh] w-full place-content-center"
    >
      <LoadingSvg :child-class="'!w-12 !h-12'" />
    </div>
    <div v-else>
      <div v-if="orderShops.length > 0">
        <h1 class="mb-4 text-2xl font-medium">
          {{ dataGetCart?.totalProducts }} products in your cart
        </h1>

        <div class="grid grid-cols-12 gap-16">
          <div class="col-span-8">
            <CartOrderShop
              v-for="(item, index) of orderShops"
              :key="item.id"
              :data="item"
              @on-products-empty="() => onProductsEmpty(index)"
            />
          </div>

          <div ref="wrapperSummaryOrderRef">
            <div
              ref="contentSummaryOrderRef"
              class="w-[400px]"
            >
              <CartSummaryOrder :key="cartStore.stateCheckoutCart.keyRefreshCartSummaryOrderComp" />
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-center"
      >
        <h3 class="text-3xl text-customGray-950">
          Your cart is empty.
        </h3>
      </div>
    </div>
  </div>
</template>
