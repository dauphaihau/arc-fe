<script setup lang="ts">
import { ROUTES } from '~/config/enums/routes';
import { useGetCart } from '~/services/cart';
import { useGetCurrentUser } from '~/services/user';

const route = useRoute();

// const isDark = useDark();
// const toggleDark = useToggle(isDark);

const {
  data: dataGetCart,
} = useGetCart();

const { data: dataUserAuth } = useGetCurrentUser();

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
  state.lastScrollPosition = window.pageYOffset;
  window.addEventListener('scroll', onScroll);
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1';
  document.head.appendChild(viewportMeta);
});

const totalProductCarts = computed(() => {
  if (
    dataUserAuth.value?.user &&
    dataGetCart.value?.cart && dataGetCart.value.cart?.summary_cart?.total_products > 0
  ) {
    return dataGetCart.value.cart.summary_cart.total_products;
  }
  return 0;
});
</script>

<template>
  <!--  <div class="bg-customGray-100 h-11"> -->
  <!--    <div class=" max-w-market-layout mx-auto flex items-center justify-end text-custom-Gray-950 text-sm h-full font-medium"> -->
  <!--      <div>Join us</div> -->
  <!--      <UDivider orientation="vertical" class="w-6 h-3 border-black" size="xs" :ui="{ border: { base: 'border-black' } }" /> -->
  <!--      <div>Login</div> -->
  <!--    </div> -->
  <!--  </div> -->

  <header
    class="header"
    :class="{ 'hidden-header': !state.showNavbar }"
    @mouseleave="onMouseleave"
  >
    <nav class="max-w-home-layout mx-auto flex justify-between py-3">
      <NuxtLink
        id="brand"
        :to="ROUTES.HOME"
        class="h-fit p-1 text-xl font-bold"
      >
        Arc
      </NuxtLink>

      <div class="mt-1">
        <LayoutMarketHeaderCategories class="mx-3" />
        <LayoutMarketCartMegaMenu
          :show="isShowCart"
          class="mt-8"
        />
        <LayoutMarketSearchAllMegaMenu
          :show="isShowSearch"
          class="mt-8"
        />
      </div>

      <!--      <div class="flex items-center gap-4"> -->
      <!--      <UButton -->
      <!--        color="gray" -->
      <!--        variant="ghost" -->
      <!--        class="icon-button" -->
      <!--        @click="toggleDark()" -->
      <!--      > -->
      <!--        <Icon v-if="!isDark" name="uil:sun" /> -->
      <!--        <Icon v-else name="uil:moon" /> -->
      <!--      </UButton> -->

      <!--        <div v-if="authStore.isLogged" class="flex items-center gap-4"> -->
      <!--        <UTooltip text="Favorites"> -->
      <!--          <UButton -->
      <!--            color="gray" -->
      <!--            variant="ghost" -->
      <!--            class="icon-button" -->
      <!--          > -->
      <!--            <Icon name="uil:heart" /> -->
      <!--          </UButton> -->
      <!--        </UTooltip> -->
      <!--        <UTooltip text="Notifications"> -->
      <!--          <UButton -->
      <!--            color="gray" -->
      <!--            variant="ghost" -->
      <!--            class="icon-button" -->
      <!--          > -->
      <!--            <Icon name="uil:bell" /> -->
      <!--          </UButton> -->
      <!--        </UTooltip> -->
      <!--        <UTooltip text="Shop Manager"> -->
      <!--          <UButton -->
      <!--            :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}`" -->
      <!--            color="gray" -->
      <!--            variant="ghost" -->
      <!--            class="icon-button" -->
      <!--          > -->
      <!--            <Icon name="uil:shop" /> -->
      <!--          </UButton> -->
      <!--        </UTooltip> -->
      <!--        </div> -->

      <!--        <RegisterLoginDialog v-else /> -->

      <div class="relative flex h-fit items-center gap-4">
        <div class="absolute right-12 flex gap-4">
          <UTooltip text="Search">
            <UButton
              color="gray"
              variant="ghost"
              class="icon-button"
              @click="isShowSearch = !isShowSearch"
              @mouseover="isShowCart = false"
            >
              <Icon name="i-uil:search" />
            </UButton>
          </UTooltip>
        </div>

        <UTooltip text="Cart">
          <UChip
            :text="totalProductCarts"
            :show="totalProductCarts > 0"
            class="cursor-pointer"
            size="xl"
            position="bottom-right"
            :ui="{
              position: {
                'bottom-right': 'translate-y-[-5px] translate-x-[-5px]',
              },
            }"
            @click="isShowCart = !isShowCart"
            @mouseover="isShowSearch = false"
          >
            <UButton
              class="icon-button"
              variant="ghost"
              color="gray"
            >
              <Icon name="i-uil:cart" />
            </UButton>
          </UChip>
        </UTooltip>

        <!--        <HeaderUserDropdown /> -->
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
    <div
      v-if="isShowCart || isShowSearch"
      class="overlay"
    />
  </transition>
</template>

<style scoped>
.icon-button {
  padding: 8px;
}

.overlay {
  @apply fixed z-[1] inset-0 transition-opacity
  bg-gray-200/75
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
