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

const OFFSET = 60;

const state = reactive({
  showNavbar: true,
  lastScrollPosition: 0,
  scrollValue: 0,
});

function onScroll() {
  if (window.pageYOffset < 0) {
    return;
  }
  if (Math.abs(window.pageYOffset - state.lastScrollPosition) < OFFSET) {
    return;
  }
  state.showNavbar = window.pageYOffset < state.lastScrollPosition;
  state.lastScrollPosition = window.pageYOffset;
}

onMounted(async () => {
  if (authStore.isLogged) {
    await cartStore.getCartHeader();
  }

  state.lastScrollPosition = window.pageYOffset;
  window.addEventListener('scroll', onScroll);
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1';
  document.head.appendChild(viewportMeta);
});

</script>

<template>
  <header
    class="header "
    :class="{ 'hidden-header': !state.showNavbar }"
    @mouseleave="onMouseleave"
  >
    <nav class="max-w-home-layout mx-auto flex justify-between py-3">
      <NuxtLink id="brand" :to="ROUTES.HOME" class="font-bold text-xl h-fit p-1">
        Arc
      </NuxtLink>

      <div>
        <LayoutHomeHeaderCategories class="mx-3" />
        <LayoutHomeCartMegaMenu :show="isShowCart" class="mt-8" />
        <LayoutHomeSearchAllMegaMenu :show="isShowSearch" class="mt-8" />
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
    </nav>
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
  @apply fixed z-[1] inset-0 transition-opacity
  bg-gray-200/75 dark:bg-gray-800/75
}

.header {
  @apply fixed top-0 z-[3] bg-white w-screen border-b border-b-zinc-200;
  transform: translate3d(0, 0, 0);
  transition: 0.1s all ease-out;
}

.header.hidden-header {
  transform: translate3d(0, -100%, 0);
}

</style>
