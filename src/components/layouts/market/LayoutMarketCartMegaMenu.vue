<script lang="ts" setup>
import { ROUTES } from '~/config/enums/routes';
import { RegisterLoginDialog } from '#components';
import { useLogout } from '~/services/auth';

const { show } = defineProps<{ show: boolean }>();

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const modal = useModal();

const {
  mutate: logout,
  isPending: isPendingLogout,
} = useLogout();

const showRegisterLoginDialog = () => {
  modal.open(RegisterLoginDialog);
};

const handleLogout = () => {
  if (isPendingLogout.value) return;
  logout();
};
</script>

<template>
  <transition name="slide-down">
    <div v-if="show">
      <div class="mx-auto ml-5 pb-12">
        <div class="mb-4 flex justify-between gap-3">
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
              <div class="mb-6 space-y-8">
                <div
                  v-for="(prod, index) in cartStore.cartHeader.products"
                  :key="index"
                >
                  <div
                    class="flex cursor-pointer items-center gap-6"
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
              <div
                v-if="cartStore.cartHeader.restProducts > 0"
                class="text-customGray-950"
              >
                {{ cartStore.cartHeader.restProducts }} more product in your Cart
              </div>
            </div>
            <div
              v-else
              class="text-customGray-950"
            >
              Your cart is empty.
            </div>
          </div>

          <div
            v-else
            class="flex items-center gap-1"
          >
            <UButton
              size="sm"
              variant="link"
              label="Log in"
              :trailing="false"
              :ui="{
                base: 'underline',
                padding: {
                  sm: 'p-0',
                },
              }"
              @click="showRegisterLoginDialog"
            />

            <span class=" text-sm text-customGray-950">
              to see products you added into cart
            </span>
          </div>
        </div>

        <div v-if="authStore.isLogged">
          <div class="mb-2 text-customGray-950">
            My Profile
          </div>
          <div class="flex flex-col gap-2">
            <div
              class="item-profile"
              @click="() => router.push(ROUTES.ORDERS)"
            >
              <UIcon
                name="i-heroicons-cube"
                color="gray"
              />
              Orders
            </div>
            <div
              class="item-profile"
              @click="() => router.push(ROUTES.ACCOUNT)"
            >
              <UIcon
                name="i-heroicons-user"
                color="gray"
              />
              Account
            </div>
            <div
              class="item-profile"
              @click="() => router.push(ROUTES.ACCOUNT + ROUTES.SHOP)"
            >
              <UIcon
                name="i-heroicons-building-storefront"
                color="gray"
              />
              Manage Shop
            </div>
            <div
              class="item-profile"
              @click="handleLogout"
            >
              <UIcon
                name="i-heroicons-arrow-left-start-on-rectangle"
                color="gray"
              />
              Logout {{ authStore?.user?.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.3s ease-in-out;
}

.slide-down-enter-to,
.slide-down-leave-from {
  overflow: hidden;
  max-height: 500px;
}

.slide-down-enter-from,
.slide-down-leave-to {
  overflow: hidden;
  max-height: 0;
}

.item-profile {
  @apply font-medium flex items-center gap-2 cursor-pointer opacity-70 hover:opacity-100
  hover:bg-gray-100 px-2 py-1 rounded-md
}
</style>
