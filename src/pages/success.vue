<script lang="ts" setup>
import { ROUTES } from '~/config/enums/routes';
import { useGetOrderShopsByCheckoutSession } from '~/services/order';

definePageMeta({ layout: 'market' });

const route = useRoute();
const cartStore = useCartStore();

const session_id = route.query['session_id'] as string;

if (!session_id && cartStore.orderShops.length === 0) {
  throw showError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
}

const {
  data: dataGetOrderShopsByCheckoutSession,
  isLoading: isLoadingGetOrderShopsByCheckoutSession,
} = useGetOrderShopsByCheckoutSession(session_id, {
  onResponseError: () => {
    throw showError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true,
    });
  },
});

const orderShops = computed(() => {
  if (dataGetOrderShopsByCheckoutSession.value?.order_shops) {
    return dataGetOrderShopsByCheckoutSession.value.order_shops;
  }
  else if (cartStore.orderShops.length > 0) {
    return cartStore.orderShops;
  }
  return [];
});

onUnmounted(() => {
  if (cartStore.orderShops) {
    cartStore.orderShops = [];
  }
});
</script>

<template>
  <div
    v-if="isLoadingGetOrderShopsByCheckoutSession && cartStore.orderShops.length === 0"
    class="grid h-[80vh] w-full place-content-center"
  >
    <LoadingSvg :child-class="'!w-12 !h-12'" />
  </div>
  <div
    v-else-if="orderShops.length > 0"
    class="mt-20 grid place-content-center text-center"
  >
    <div class="mb-4 text-center text-3xl font-medium">
      Your order is confirmed.
    </div>
    <div class=" space-y-4 text-zinc-600">
      <div>
        <span
          v-for="(item, idx) of orderShops"
          :key="idx"
        >
          <span v-if="idx > 0">, </span>
          <span class="underline underline-offset-2">
            {{ item.shop.shop_name }}
          </span>
        </span>
        will start working on this right away.<br>
        We'll email you as soon as it ships.
      </div>
      <div>
        <UButton
          size="lg"
          :to="ROUTES.ORDERS"
        >
          View your order
        </UButton>
      </div>
      <div class="">
        Delivery times are estimated. If you're experiencing difficulty with this order, please <br>
        <span class="underline underline-offset-2">contact the seller</span>. See <span class="underline underline-offset-2">more info</span>.
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
