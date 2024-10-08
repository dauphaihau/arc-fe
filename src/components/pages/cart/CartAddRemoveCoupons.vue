<script setup lang="ts">
/*
  use in cart, cart/checkout page
 */

import { StatusCodes } from 'http-status-codes';
import { FetchError } from 'ofetch';
import { consola } from 'consola';
import { type AdditionInfoShopCarts, useCartStore } from '~/stores/cart';
import { COUPON_CONFIG } from '~/config/enums/coupon';
import type { Shop } from '~/types/shop';
import { useUpdateCart } from '~/services/cart';
import { toastCustom } from '~/config/toast';
import type { Coupon } from '~/types/coupon';
import type { ResponseGetCart } from '~/types/request-api/cart';

const { shopId } = defineProps<{
  shopId: Shop['id']
}>();

const cartStore = useCartStore();
const queryClient = useQueryClient();
const toast = useToast();

const state = reactive({
  showAddCouponCodeInput: false,
  code: '',
  codes: [] as Coupon['code'][],
  invalidCodes: [] as Coupon['code'][],
  errorMsg: '',
});

onMounted(() => {
  const additionInfoOrderShop = cartStore.additionInfoShopCarts.get(shopId);
  if (additionInfoOrderShop && additionInfoOrderShop.promo_codes.length > 0) {
    state.codes = additionInfoOrderShop.promo_codes;
    state.showAddCouponCodeInput = true;
  }
});

const {
  mutateAsync: updateCart,
  isPending: isPendingUpdateCart,
} = useUpdateCart({ onError: undefined });

const addCoupon = async () => {
  state.errorMsg = '';

  if (state.invalidCodes.length > 0 && state.invalidCodes.includes(state.code)) {
    state.errorMsg = 'Coupon code not found';
    return;
  }

  // clone additionInfoShopCarts, if request 200 assign clone to additionInfoShopCarts
  const tempAdditionInfoShopCarts = new Map<AdditionInfoShopCarts['key'], AdditionInfoShopCarts['value']>(
    JSON.parse(JSON.stringify([...cartStore.additionInfoShopCarts]))
  );

  const tempAdditionInfoOrderShop = tempAdditionInfoShopCarts.get(shopId);
  if (!tempAdditionInfoOrderShop) {
    consola.error('tempAdditionInfoOrderShop be undefined');
    return;
  }
  tempAdditionInfoOrderShop.promo_codes.push(state.code);

  const addition_info_shop_carts = Array.from(tempAdditionInfoShopCarts)
    .map(([keyShopId, value]) => ({
      shop_id: keyShopId,
      promo_codes: value.promo_codes,
    }))
    .filter(item => item.promo_codes.length > 0);

  try {
    const data = await updateCart({
      addition_info_shop_carts,
    });

    queryClient.setQueryData<ResponseGetCart>(['get-cart', 'my-cart'], (oldData) => {
      if (!oldData || !oldData.cart) return oldData;
      if (!data.cart) return { ...oldData, cart: data.cart };
      const foundShopCart = data.cart.shop_carts.find(sc => sc.shop.id === shopId);
      if (!foundShopCart) return oldData;

      const shopCartsUpdated = oldData.cart.shop_carts.map((sc) => {
        if (sc.shop.id === shopId) {
          return {
            ...sc,
            total_shipping_fee: foundShopCart.total_shipping_fee,
          };
        }
        return sc;
      });
      return {
        ...oldData,
        cart: {
          ...oldData.cart,
          shop_carts: shopCartsUpdated,
        },
        summary_order: data.summary_order,
      };
    });

    cartStore.additionInfoShopCarts.set(shopId, tempAdditionInfoOrderShop);
    state.codes = tempAdditionInfoOrderShop.promo_codes;
    state.code = '';
  }
  catch (error) {
    if (error instanceof FetchError) {
      switch (error.status) {
        case StatusCodes.NOT_FOUND:
          state.errorMsg = 'Coupon code not found';
          state.invalidCodes.push(state.code);
          break;
        case StatusCodes.UNPROCESSABLE_ENTITY:
          toast.add({
            ...toastCustom.error,
            title: error.data.message,
          });
          break;
        default:
          toast.add({
            ...toastCustom.error,
            title: 'Add coupon failed',
          });
      }
    }
  }
};

const deleteCoupon = async (code: Coupon['code']) => {
  const tempAdditionInfoShopCarts = new Map<AdditionInfoShopCarts['key'], AdditionInfoShopCarts['value']>(
    JSON.parse(JSON.stringify([...cartStore.additionInfoShopCarts]))
  );
  const tempAdditionInfoOrderShop = tempAdditionInfoShopCarts.get(shopId);

  if (!tempAdditionInfoOrderShop) {
    consola.error('tempAdditionInfoOrderShop be undefined');
    return;
  }
  tempAdditionInfoOrderShop.promo_codes = tempAdditionInfoOrderShop.promo_codes.filter(c => c !== code);

  const addition_info_shop_carts = Array.from(tempAdditionInfoShopCarts).map(([keyShopId, value]) => ({
    shop_id: keyShopId,
    promo_codes: value.promo_codes,
  }));

  try {
    const data = await updateCart({
      addition_info_shop_carts,
    });

    // update cache get cart
    queryClient.setQueryData<ResponseGetCart>(['get-cart', 'my-cart'], (oldData) => {
      if (!oldData || !oldData.cart) return oldData;
      if (!data.cart) return { ...oldData, cart: data.cart };
      const foundShopCart = data.cart.shop_carts.find(sc => sc.shop.id === shopId);
      if (!oldData || !foundShopCart) return oldData;

      // update total_shipping_fee field
      const shopCartsUpdated = oldData.cart.shop_carts.map((sc) => {
        if (sc.shop.id === shopId) {
          return {
            ...sc,
            total_shipping_fee: foundShopCart.total_shipping_fee,
          };
        }
        return sc;
      });
      return {
        ...oldData,
        cart: {
          ...oldData.cart,
          shop_carts: shopCartsUpdated,
        },
        summary_order: data.summary_order,
      };
    });

    const additionInfoOrderShop = tempAdditionInfoShopCarts.get(shopId);
    if (!additionInfoOrderShop) {
      consola.error('additionInfoOrderShop be undefined', additionInfoOrderShop);
      throw new Error();
    }
    cartStore.additionInfoShopCarts.set(shopId, additionInfoOrderShop);
    state.codes = tempAdditionInfoOrderShop.promo_codes;
  }
  catch (e) {
    toast.add({
      ...toastCustom.error,
      title: 'Delete coupon failed',
    });
  }
};

const toggleShowAddCouponInput = async () => {
  state.showAddCouponCodeInput = !state.showAddCouponCodeInput;
  if (!state.showAddCouponCodeInput) {
    const tempAdditionInfoShopCarts = new Map<AdditionInfoShopCarts['key'], AdditionInfoShopCarts['value']>(
      JSON.parse(JSON.stringify([...cartStore.additionInfoShopCarts]))
    );
    const tempAdditionInfoOrderShop = tempAdditionInfoShopCarts.get(shopId);

    if (!tempAdditionInfoOrderShop) {
      consola.error('tempAdditionInfoOrderShop be undefined');
      return;
    }
    if (tempAdditionInfoOrderShop.promo_codes.length === 0) {
      return;
    }
    tempAdditionInfoOrderShop.promo_codes = [];

    const addition_info_shop_carts = Array.from(tempAdditionInfoShopCarts).map(([keyShopId, value]) => ({
      shop_id: keyShopId,
      promo_codes: value.promo_codes,
    }));

    try {
      const data = await updateCart({
        addition_info_shop_carts,
      });

      // update cache get cart
      queryClient.setQueryData<ResponseGetCart>(['get-cart', 'my-cart'], (oldData) => {
        if (!oldData || !oldData.cart) return oldData;
        if (!data.cart) return { ...oldData, cart: data.cart };
        const foundShopCart = data.cart.shop_carts.find(sc => sc.shop.id === shopId);
        if (!oldData || !foundShopCart) return oldData;

        // update total_shipping_fee field
        const shopCartsUpdated = oldData.cart.shop_carts.map((sc) => {
          if (sc.shop.id === shopId) {
            return {
              ...sc,
              total_shipping_fee: foundShopCart.total_shipping_fee,
            };
          }
          return sc;
        });
        return {
          ...oldData,
          cart: {
            ...oldData.cart,
            shop_carts: shopCartsUpdated,
          },
          summary_order: data.summary_order,
        };
      });
      const additionInfoOrderShop = tempAdditionInfoShopCarts.get(shopId);
      if (!additionInfoOrderShop) {
        consola.error('additionInfoOrderShop be undefined', additionInfoOrderShop);
        throw new Error();
      }
      cartStore.additionInfoShopCarts.set(shopId, additionInfoOrderShop);
      state.codes = [];
    }
    catch (error) {
      toast.add({
        ...toastCustom.error,
        title: 'Delete all coupons failed',
      });
    }
  }
};

const disabledAddBtn = computed(() => {
  return isPendingUpdateCart.value ||
    state.codes.length === COUPON_CONFIG.MAX_USE_PER_ORDER ||
    state.codes.includes(state.code) ||
    !state.code;
});
</script>

<template>
  <div>
    <UButton
      variant="ghost"
      icon="i-heroicons-ticket"
      color="gray"
      class="mb-1 w-fit"
      :disabled="cartStore.stateCheckoutCart.isPendingCreateOrder"
      @click="toggleShowAddCouponInput"
    >
      Apply shop coupon codes
    </UButton>

    <div
      v-if="state.showAddCouponCodeInput"
      class="flex gap-3"
    >
      <UFormGroup
        required
        name="code"
        :error="state.errorMsg"
      >
        <UButtonGroup
          size="lg"
          orientation="horizontal"
        >
          <UInput
            v-model.trim="state.code"
            v-uppercase
            :disabled="state.codes.length === COUPON_CONFIG.MAX_USE_PER_ORDER"
          />
          <UButton
            color="gray"
            variant="solid"
            :disabled="disabledAddBtn || cartStore.stateCheckoutCart.isPendingCreateOrder"
            @click="addCoupon"
          >
            Add
          </UButton>
        </UButtonGroup>
      </UFormGroup>

      <div
        v-if="state.codes && state.codes.length > 0"
        class="flex gap-3"
      >
        <div
          v-for="(code, index) of state.codes"
          :key="index"
        >
          <div class="relative">
            <UButton
              color="gray"
              size="lg"
            >
              {{ code }}
            </UButton>
            <UButton
              class="absolute -right-2 -top-3 z-[1]"
              size="2xs"
              color="gray"
              variant="solid"
              :disabled="isPendingUpdateCart || cartStore.stateCheckoutCart.isPendingCreateOrder"
              icon="i-heroicons-x-mark-20-solid"
              :ui="{ rounded: 'rounded-full' }"
              @click="() => deleteCoupon(code)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
