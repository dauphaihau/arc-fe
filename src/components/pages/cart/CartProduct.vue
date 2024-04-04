<script setup lang="ts">
import type { IProductInventory } from '~/interfaces/product';
import { ROUTES } from '~/config/enums/routes';
import type { IProductCartPopulated } from '~/interfaces/cart';
import { useCartStore } from '~/stores/cart';
import type { IShop } from '~/interfaces/shop';
import { toastCustom } from '~/config/toast';

const { data, shopId } = defineProps<{
  data: IProductCartPopulated,
  shopId: IShop['id']
}>();

const emit = defineEmits<{(e: 'onDeleteProduct'): void }>();

const cartStore = useCartStore();
const { $api } = useNuxtApp();
const toast = useToast();
const config = useRuntimeConfig();
const route = useRoute();

const goToDetailProduct = () => {
  navigateTo(`${ROUTES.PRODUCTS}/${data.inventory.product.id}`);
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
  <div v-if="data?.inventory" class="flex gap-4 mb-8">
    <div
      v-if="route.path === ROUTES.CART"
      class="flex flex-col justify-center"
    >
      <CartCheckboxOrderProduct
        :shop-id="shopId"
        :checked="(data.is_select_order as boolean)"
        :inventory-id="data.inventory.id"
      />
    </div>

    <NuxtImg
      :src="config.public.awsHostBucket + '/' + data?.inventory?.product?.images[0]?.relative_url"
      width="180"
      height="180"
      class="rounded max-w-[180px] max-h-[180px] cursor-pointer"
      @click="goToDetailProduct"
    />

    <div class="flex justify-between w-full">
      <div class="space-y-2 w-full">
        <h1
          class="text-xl font-semibold cursor-pointer"
          @click="goToDetailProduct"
        >
          {{ data?.inventory?.product?.title }}
        </h1>

        <CartVariantsProduct v-if="data?.variant" :data="data" />

        <CartModifyQuantityProduct :data="data" class="w-1/3" />

        <div class="flex gap-4">
          <!--          <div class="flex items-center gap-1 cursor-pointer">-->
          <!--            <Icon name="uil:pen" />-->
          <!--            <p>Edit</p>-->
          <!--          </div>-->
          <div
            v-if="route.path === ROUTES.CART"
            class="flex items-center gap-1 cursor-pointer"
            @click="removeProduct(data.inventory.id)"
          >
            <Icon name="uil:trash" />
            <p>Remove</p>
          </div>
        </div>
      </div>

      <p class="text-customGray-950 text-xl font-medium">
        {{ convertCurrency(data.inventory.price) }}
      </p>
    </div>
  </div>
</template>
