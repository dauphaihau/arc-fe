<script setup lang="ts">
import { ROUTES } from '~/config/enums/routes';

const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();

// const isDark = useDark();
// const toggleDark = useToggle(isDark);

const isShowCart = ref(false);
const isShowSearch = ref(false);

watch(() => [route.path, route.query], () => {
  isShowSearch.value = false;
  isShowCart.value = false;
});

const onMouseleave = () => {
  isShowSearch.value = false;
  isShowCart.value = false;
};

onMounted(async () => {
  if (authStore.isLogged) {
    await cartStore.getCartHeader();
  }
});

</script>

<template>
  <header
    class="fixed top-0 z-20 bg-white w-full border-b border-b-zinc-200"
    @mouseleave="onMouseleave"
  >
    <div class="max-w-[1300px] mx-auto flex justify-between py-3">
      <NuxtLink id="brand" :to="ROUTES.HOME" class="font-bold text-xl h-fit p-1">
        Arc
      </NuxtLink>

      <div>
        <HeaderCategories class="mx-3" />
        <CartMegaMenu :show="isShowCart" class="mt-8" />
        <SearchAllMegaMenu :show="isShowSearch" class="mt-8" />
      </div>

      <!--      <div class="flex items-center gap-4">-->
      <!--    <HeaderLangDropdown/>-->

      <!--      <UButton-->
      <!--        color="gray"-->
      <!--        variant="ghost"-->
      <!--        class="icon-button"-->
      <!--        @click="toggleDark()"-->
      <!--      >-->
      <!--        <Icon v-if="!isDark" name="uil:sun" />-->
      <!--        <Icon v-else name="uil:moon" />-->
      <!--      </UButton>-->

      <!--        <div v-if="authStore.isLogged" class="flex items-center gap-4">-->
      <!--        <UTooltip text="Favorites">-->
      <!--          <UButton-->
      <!--            color="gray"-->
      <!--            variant="ghost"-->
      <!--            class="icon-button"-->
      <!--          >-->
      <!--            <Icon name="uil:heart" />-->
      <!--          </UButton>-->
      <!--        </UTooltip>-->
      <!--        <UTooltip text="Notifications">-->
      <!--          <UButton-->
      <!--            color="gray"-->
      <!--            variant="ghost"-->
      <!--            class="icon-button"-->
      <!--          >-->
      <!--            <Icon name="uil:bell" />-->
      <!--          </UButton>-->
      <!--        </UTooltip>-->
      <!--        <UTooltip text="Shop Manager">-->
      <!--          <UButton-->
      <!--            :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}`"-->
      <!--            color="gray"-->
      <!--            variant="ghost"-->
      <!--            class="icon-button"-->
      <!--          >-->
      <!--            <Icon name="uil:shop" />-->
      <!--          </UButton>-->
      <!--        </UTooltip>-->
      <!--        <HeaderUserDropdown />-->
      <!--        </div>-->

      <!--        <RegisterLoginDialog v-else />-->

      <!--      <UTooltip text="Cart">-->
      <!--        <UButton-->
      <!--          :to="ROUTES.CART"-->
      <!--          color="gray"-->
      <!--          variant="ghost"-->
      <!--          class="icon-button"-->
      <!--        >-->
      <!--          <Icon name="uil:cart" />-->
      <!--        </UButton>-->
      <!--      </UTooltip>-->
      <!--      </div>-->

      <div class="flex items-center gap-4 h-fit">
        <UTooltip text="Search">
          <UButton
            color="gray"
            variant="ghost"
            class="icon-button"
            @click="isShowSearch = !isShowSearch"
            @mouseover="isShowCart = false"
          >
            <Icon name="uil:search" />
          </UButton>
        </UTooltip>

        <UTooltip text="Cart">
          <UChip
            :text="cartStore.getCountAllProducts"
            :show="authStore.isLogged && cartStore.getCountAllProducts > 0"
            class="cursor-pointer"
            size="xl"
            position="bottom-right"
            :ui="{
              position: {
                'bottom-right': 'translate-y-[-5px] translate-x-[-5px]'
              }
            }"
            @click="isShowCart = !isShowCart"
            @mouseover="isShowSearch = false"
          >
            <UButton
              class="icon-button"
              variant="ghost"
              color="gray"
            >
              <Icon name="uil:cart" />
            </UButton>
          </UChip>
        </UTooltip>
      </div>
    </div>
  </header>

  <transition
    enter-class="ease-out duration-500"
    enter-to-class="opacity-100"
    enter-active-class="opacity-0"
    leave-class="ease-in duration-500"
    leave-ative-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isShowCart || isShowSearch" class="overlay" />
  </transition>
</template>

<style scoped>

.icon-button {
  padding: 8px;
}

.overlay {
  @apply fixed z-10 inset-0 transition-opacity
  bg-gray-200/75 dark:bg-gray-800/75
}

</style>
