<script setup lang="ts">
/*
  use in cart, cart/checkout page
 */
import { ROUTES } from '~/config/enums/routes';
import type { ProductCartPopulated, ResponseGetCart } from '~/types/cart';
import { useCartStore } from '~/stores/cart';
import type { Shop } from '~/types/shop';
import { useDeleteCartProduct } from '~/services/cart';

const props = defineProps<{
  data: ProductCartPopulated
  shopId: Shop['id']
}>();

const emit = defineEmits<{ onDeleteProduct: [] }>();

const cartStore = useCartStore();
const route = useRoute();
const queryClient = useQueryClient();

const {
  mutate: deleteCartProduct,
} = useDeleteCartProduct(props.data.inventory.id, {
  onSuccess(data) {
    cartStore.getCartHeader();
    emit('onDeleteProduct');
    const cacheGetCart = queryClient.getQueryData<ResponseGetCart>(['get-cart']);
    if (cacheGetCart) {
      cacheGetCart.summaryOrder = data.summaryOrder;
      cartStore.stateCheckoutCart.keyRefreshCartSummaryOrderComp++;
    }
  },
});

const goToDetailProduct = () => {
  navigateTo(`${ROUTES.PRODUCTS}/${props.data.inventory.product.id}`);
};
</script>

<template>
  <div
    v-if="props.data?.inventory"
    class="mb-8 flex gap-4"
  >
    <div
      v-if="route.path === ROUTES.CART"
      class="flex flex-col justify-center"
    >
      <CartCheckboxOrderProduct
        :shop-id="shopId"
        :checked="(props.data.is_select_order as boolean)"
        :inventory-id="props.data.inventory.id"
      />
    </div>

    <NuxtImg
      :src="`domainAwsS3/${props.data?.inventory?.product?.images[0]?.relative_url}`"
      width="180"
      height="180"
      class="max-h-[180px] max-w-[180px] cursor-pointer rounded"
      @click="goToDetailProduct"
    />

    <div class="flex w-full justify-between">
      <div class="w-full space-y-2">
        <h1
          class="cursor-pointer text-xl font-semibold"
          @click="goToDetailProduct"
        >
          {{ props.data?.inventory?.product?.title }}
        </h1>

        <CartVariantsProduct
          v-if="props.data?.variant"
          :data="props.data"
        />

        <CartModifyQuantityProduct
          :data="props.data"
          class="w-1/3"
        />

        <div class="flex gap-4">
          <!--          <div class="flex items-center gap-1 cursor-pointer"> -->
          <!--            <Icon name="uil:pen" /> -->
          <!--            <p>Edit</p> -->
          <!--          </div> -->
          <div
            v-if="route.path === ROUTES.CART"
            class="flex cursor-pointer items-center gap-1"
            @click.once="deleteCartProduct()"
          >
            <Icon name="uil:trash" />
            <p>Remove</p>
          </div>
        </div>
      </div>

      <p class="text-xl font-medium text-customGray-950">
        {{ convertCurrency(props.data.inventory.price) }}
      </p>
    </div>
  </div>
</template>
