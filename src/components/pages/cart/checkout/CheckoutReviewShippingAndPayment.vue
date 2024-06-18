<script lang="ts" setup>
import { useCartStore } from '~/stores/cart';

const cartStore = useCartStore();
</script>

<template>
  <UCard>
    <div class="flex flex-col gap-4">
      <legend class="mb-1 text-xl font-bold text-gray-700 dark:text-gray-200">
        Shipping & Payment
      </legend>

      <div class="grid grid-cols-4">
        <div>
          <div class="mb-1 font-semibold">
            Shipping address
          </div>

          <div class="my-2 flex flex-col">
            <div class="">
              {{ cartStore.stateCheckout.address.full_name }}
            </div>
            <div class="">
              {{ cartStore.stateCheckout.address.address1 }}
            </div>
            <div class="flex gap-2">
              <div>{{ cartStore.stateCheckout.address.city }}</div>
              <div>{{ cartStore.stateCheckout.address.zip }}</div>
            </div>
            <div class="">
              {{ cartStore.stateCheckout.address.country }}
            </div>
          </div>

          <UButton
            :padded="false"
            variant="link"
          >
            Change
          </UButton>
        </div>

        <div>
          <div class="mb-1 font-semibold">
            Payment method
          </div>
          <div class="my-2 flex flex-col gap-4">
            <div class="capitalize">
              {{ cartStore.stateCheckout.payment_type }}
            </div>
          </div>

          <UButton
            :padded="false"
            variant="link"
          >
            Change
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>

</style>
