<script setup lang="ts">
import type { IProductInventory } from '~/interfaces/product';
import { ROUTES } from '~/config/enums/routes';
import type { IProductCartPopulated } from '~/interfaces/cart';
import { useCartStore } from '~/stores/cart';
import type { IShop } from '~/interfaces/shop';
import { toastCustom } from '~/config/toast';

const props = defineProps<{
  data: IProductCartPopulated
  shopId: IShop['id']
}>();

const emit = defineEmits<{ (e: 'onDeleteProduct'): void }>();

const cartStore = useCartStore();
const { $api } = useNuxtApp();
const toast = useToast();
const config = useRuntimeConfig();
const route = useRoute();

const goToDetailProduct = () => {
  navigateTo(`${ROUTES.PRODUCTS}/${props.data.inventory.product.id}`);
};

const removeProduct = async (id: IProductInventory['id']) => {
  const { error, data } = await $api.cart.deleteProduct(id);
  if (error.value) {
    toast.add({
      ...toastCustom.error,
      title: 'Delete product cart failed',
    });
  }
  else {
    emit('onDeleteProduct');
    await cartStore.getCartHeader();
    cartStore.summaryOrder = data.value?.summaryOrder || null;
    cartStore.totalProductsCart--;
  }
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
      :src="config.public.awsHostBucket + '/' + props.data?.inventory?.product?.images[0]?.relative_url"
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
            @click="removeProduct(props.data.inventory.id)"
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
