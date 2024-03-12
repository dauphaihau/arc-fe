<script lang="ts" setup>
definePageMeta({ layout: 'shop', middleware: ['auth'] });

</script>

<template>
  <LayoutShopWrapperContent>
    <template #title>
      Create a coupon
    </template>
    <template #description>
      A promo code is an easy way to share a discount with anyone you choose.
      It can also be a great way to encourage purchases and build loyalty.
    </template>
    <template #content>
      <div class="mb-20">
        <CreateCouponForm />
      </div>
    </template>
  </LayoutShopWrapperContent>
</template>
