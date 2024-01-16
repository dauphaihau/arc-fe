<script setup lang="ts">
import type { IProduct } from '~/interfaces/product';
import { ROUTES } from '~/config/enums/routes';
import type { IProductCart } from '~/interfaces/cart';

const { prod } = defineProps<{
  prod: IProductCart
}>();

const emit = defineEmits<{(e: 'refreshCart'): void }>();

const { $api } = useNuxtApp();
const toast = useToast();
const config = useRuntimeConfig();

const goToDetailProduct = (id: IProduct['id']) => {
  navigateTo(`${ROUTES.PRODUCTS}/${id}`);
};

const removeProduct = async (id: IProduct['id']) => {
  const { error } = await $api.cart.deleteProduct(id);
  if (!error.value) {
    emit('refreshCart');
  } else {
    toast.add({ title: 'Something Wrong' });
  }
};

</script>

<template>
  <div class="flex gap-4 mb-8">
    <div class="flex flex-col justify-center">
      <CheckboxOrderProdCart
        :checked="(prod.is_select_order as boolean)"
        :product-id="prod.product.id"
      />
    </div>

    <NuxtImg
      :src="config.public.awsHostBucket + '/' + prod.product.images[0].relative_url"
      width="180"
      height="180"
      class="rounded max-w-[180px] max-h-[180px]"
      @click="() => goToDetailProduct(prod.product.id)"
    />

    <div class="flex justify-between w-full">
      <div class="space-y-3 w-full">
        <h1
          class="text-xl font-semibold"
          @click="() => goToDetailProduct(prod.product.id)"
        >
          {{ prod.product.title }}
        </h1>
        <VariantsProdCart v-if="prod?.product_variant" :data="prod" />

        <SelectQuantityProdCart :data="prod" class="w-1/6" />

        <div class="flex gap-4">
          <div class="flex items-center gap-1" @click="removeProduct(prod.product.id)">
            <Icon name="uil:pen" />
            <p>Edit</p>
          </div>
          <div class="flex items-center gap-1" @click="removeProduct(prod.product.id)">
            <Icon name="uil:trash" />
            <p>Remove</p>
          </div>
        </div>
      </div>

      <p class="text-customGray-950 text-xl font-medium">
        {{ prod.product_variant?.price || prod.product.price }}$
      </p>
    </div>
  </div>
</template>
