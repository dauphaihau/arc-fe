<script setup lang="ts">

const primaryLinks = [
  {
    title: 'Shop',
    links: [
      {
        title: 'Gift cards',
        link: '/',
      },
      {
        title: 'Arc Registry',
        link: '/',
      },
      {
        title: 'Sitemap',
        link: '/',
      },
      {
        title: 'Arc blog',
        link: '/',
      },
      {
        title: 'Arc United Kingdom',
        link: '/',
      },
      {
        title: 'Arc Germany',
        link: '/',
      },
      {
        title: 'Arc Canada',
        link: '/',
      },
    ],
  },
  {
    title: 'Sell',
    links: [
      {
        title: 'Seller handbook',
        link: '/',
      },
      {
        title: 'Teams',
        link: '/',
      },
      {
        title: 'Forums',
        link: '/',
      },
      {
        title: 'Affiliates & Creators',
        link: '/',
      },
    ],
  },
  {
    title: 'About',
    links: [
      {
        title: 'Arc, Inc.',
        link: '/',
      },
      {
        title: 'Policies',
        link: '/',
      },
      {
        title: 'News',
        link: '/',
      },
      {
        title: 'Investors',
        link: '/',
      },
      {
        title: 'Careers',
        link: '/',
      },
    ],
  },
  {
    title: 'Support',
    links: [
      {
        title: 'Order status',
        link: '/',
      },
      {
        title: 'Delivery',
        link: '/',
      },
      {
        title: 'Returns',
        link: '/',
      },
      {
        title: 'Payment options',
        link: '/',
      },
      {
        title: 'Contact us',
        link: '/',
      },
    ],
  },
];

const secondaryLinks = [
  {
    title: 'Guides',
    link: '/',
  },
  {
    title: 'Terms of Sale',
    link: '/',
  },
  {
    title: 'Terms of Use',
    link: '/',
  },
  {
    title: 'Arc Privacy Policy',
    link: '/',
  },
];

</script>

<template>
  <footer class="footer">
    <div class="max-w-home-layout mx-auto">
      <div class="grid grid-cols-5 gap-32 py-8">
        <div class="text-custom-Gray-950 font-semibold text-xl">
          Arc
        </div>
        <div v-for="(item, idx) of primaryLinks" :key="idx">
          <div class="text-sm text-custom-Gray-950 font-semibold mb-3">
            {{ item.title }}
          </div>

          <div class="space-y-3">
            <div v-for="(linkItem, idxLink) of item.links" :key="idxLink">
              <ULink
                :to="linkItem.link"
                class="text-sm text-customGray-950
                 hover:underline hover:opacity-50 transition-all duration-200"
              >
                {{ linkItem.title }}
              </ULink>
            </div>
          </div>
        </div>
      </div>
      <UDivider />
      <div class="flex items-center justify-between py-4">
        <div class="flex gap-6 items-center">
          <div class="flex items-center gap-5">
            <div
              class="flex items-center gap-3 text-xs hover:bg-customGray-200/50
             transition-all duration-200 px-3 py-2 rounded-md cursor-pointer"
            >
              <div class="flex items-center gap-2 text-xs text-nowrap">
                <UIcon name="i-heroicons-map-pin" />
                United State
              </div>
              <UDivider
                orientation="vertical"
                size="xl"
                class="h-5 w-2"
                :ui="{
                  border: { size : { vertical: 'border-s-[1.5px]'}}
                }"
              />
              <div class="text-nowrap">
                English (US)
              </div>
              <UDivider
                orientation="vertical"
                size="xl"
                class="h-5 w-2"
                :ui="{
                  border: { size : { vertical: 'border-s-[1.5px]'}}
                }"
              />
              <div class="text-nowrap">
                $ (USD)
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-xs pt-1">
            © {{ new Date().getFullYear() }} Arc Inc.
          </div>
          <div v-for="item in secondaryLinks" :key="item.title">
            <ULink
              :to="item.link"
              class="text-xs text-customGray-950
              hover:opacity-50 transition-all duration-200"
            >
              {{ item.title }}
            </ULink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  @apply absolute bottom-0 w-full bg-customGray-100
}
</style>
