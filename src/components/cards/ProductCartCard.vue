<script setup lang="ts">
import type { IProductInventory } from '~/interfaces/product';
import { ROUTES } from '~/config/enums/routes';
import type { IProductCart } from '~/interfaces/cart';
import { useCartStore } from '~/stores/cart';


const { data, index } = defineProps<{
  data: IProductCart,
  index: number
}>();

const emit = defineEmits<{(e: 'onDeleteProduct', value: number): void }>();

const cartStore = useCartStore();
const { $api } = useNuxtApp();
const toast = useToast();
const config = useRuntimeConfig();

const goToDetailProduct = () => {
  navigateTo(`${ROUTES.PRODUCTS}/${data.inventory.product.id}`);
};

const removeProduct = async (id: IProductInventory['id']) => {
  const { error, data } = await $api.cart.deleteProduct(id);
  if (!error.value) {
    emit('onDeleteProduct', index);
    cartStore.tempOrder = data.value?.tempOrder || null;
  } else {
    toast.add({ title: 'Something Wrong' });
  }
};

</script>

<template>
  <div v-if="data?.inventory" class="flex gap-4 mb-8">
    <div class="flex flex-col justify-center">
      <CheckboxOrderProdCart
        :checked="(data.is_select_order as boolean)"
        :inventory-id="data.inventory.id"
      />
    </div>

    <NuxtImg
      :src="config.public.awsHostBucket + '/' + data?.inventory?.product?.images[0]?.relative_url"
      width="180"
      height="180"
      class="rounded max-w-[180px] max-h-[180px]"
      @click="goToDetailProduct"
    />

    <div class="flex justify-between w-full">
      <div class="space-y-2 w-full">
        <h1
          class="text-xl font-semibold"
          @click="goToDetailProduct"
        >
          {{ data?.inventory?.product?.title }}
        </h1>

        <VariantsProdCart v-if="data?.variant" :data="data" />

        <SelectQuantityProdCart :data="data" class="w-1/6" />

        <div class="flex gap-4">
          <div class="flex items-center gap-1 cursor-pointer">
            <Icon name="uil:pen" />
            <p>Edit</p>
          </div>
          <div
            class="flex items-center gap-1 cursor-pointer"
            @click="removeProduct(data.inventory.id)"
          >
            <Icon name="uil:trash" />
            <p>Remove</p>
          </div>
        </div>
      </div>

      <p class="text-customGray-950 text-xl font-medium">
        {{ data.inventory.price }}$
      </p>
    </div>
  </div>
</template>
