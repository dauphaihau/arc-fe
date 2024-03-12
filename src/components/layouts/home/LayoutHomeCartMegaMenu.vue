<script lang="ts" setup>

import { ROUTES } from '~/config/enums/routes';

const { show } = defineProps<{ show: boolean }>();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const router = useRouter();
const cartStore = useCartStore();

</script>

<template>
  <transition name="slide-down">
    <div v-if="show">
      <div class="mx-auto pb-12 ml-5">
        <div class="flex gap-3 justify-between mb-4">
          <div class="text-2xl font-semibold">
            Cart
          </div>
          <UButton
            v-if="authStore.isLogged"
            :to="ROUTES.CART"
            label="Review Cart"
          >
            <template #trailing>
              <UIcon name="i-heroicons-arrow-right-20-solid" />
            </template>
          </UButton>
        </div>

        <div class="mb-10">
          <div v-if="authStore.isLogged">
            <div v-if="cartStore.cartHeader.products.length > 0">
              <div class="space-y-8 mb-6">
                <div v-for="(prod, index) in cartStore.cartHeader.products" :key="index">
                  <div
                    class="flex items-center gap-6 cursor-pointer"
                    @click="() => router.push(`${ROUTES.PRODUCTS}/${prod.id}`)"
                  >
                    <NuxtImg
                      :src="prod.image_url"
                      width="64"
                      height="64"
                      class="rounded"
                    />
                    <div class="text-xl font-medium">
                      {{ prod.title }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="cartStore.cartHeader.restProducts > 0" class="text-customGray-950">
                {{ cartStore.cartHeader.restProducts }} more product in your Cart
              </div>
            </div>
            <div v-else class="text-customGray-950">
              Your cart is empty.
            </div>
          </div>

          <div v-else class="flex items-center gap-1">
            <UButton
              size="sm"
              variant="link"
              label="Log in"
              :trailing="false"
              :ui="{
                base: 'underline',
                padding: {
                  sm: 'p-0'
                }
              }"
              @click="authStore.showLoginDialog = true"
            />

            <span class=" text-sm text-customGray-950">
              to see products you added into cart
            </span>
          </div>
        </div>

        <div v-if="authStore.isLogged">
          <div class="text-customGray-950 mb-2">
            My Profile
          </div>
          <div class="flex flex-col gap-2">
            <div
              class="item-profile"
              @click="() => router.push(ROUTES.ORDERS)"
            >
              <UIcon name="i-heroicons-cube" color="gray" />
              Orders
            </div>
            <div
              class="item-profile"
              @click="() => router.push(ROUTES.ACCOUNT)"
            >
              <UIcon name="i-heroicons-user" color="gray" />
              Account
            </div>
            <div
              class="item-profile"
              @click="() => router.push(ROUTES.ACCOUNT + ROUTES.SHOP)"
            >
              <UIcon name="i-heroicons-building-storefront" color="gray" />
              Manage Shop
            </div>
            <div
              class="item-profile"
              @click="authStore.logout()"
            >
              <UIcon name="i-heroicons-arrow-left-start-on-rectangle" color="gray" />
              Logout {{ user?.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>

.item-profile {
  @apply font-medium flex items-center gap-2 cursor-pointer opacity-70 hover:opacity-100
}

</style>
