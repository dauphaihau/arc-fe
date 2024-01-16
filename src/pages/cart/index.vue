<script lang="ts" setup>

definePageMeta({ layout: 'home' });

const { $api } = useNuxtApp();
const { pending, data, refresh } = await $api.cart.getCart();

</script>


<template>
  <div class="mt-12 py-12">
    <div v-if="pending">
      loading...
    </div>
    <div v-else>
      <div v-if="data?.cart">
        <h1 class="text-2xl font-medium mb-4">
          {{ data.cart.items.length }} items in your card
        </h1>

        <div class="flex gap-4">
          <div class="grow">
            <div
              v-for="(item, index) of data.cart.items"
              :key="index"
            >
              <UCard
                :ui="{ base: 'overflow-visible' }"
                class="mb-4"
              >
                <ItemCard
                  :data="item"
                  @refresh-cart="() => refresh()"
                />
              </UCard>
            </div>
          </div>

          <UCard class="w-1/3">
            temp order
          </UCard>
        </div>
      </div>

      <div v-else>
        Your cart is empty.
      </div>
    </div>
  </div>
</template>
