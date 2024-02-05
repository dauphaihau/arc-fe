<script lang="ts" setup>
definePageMeta({ layout: 'shop' });

</script>

<template>
  <div class="pb-20">
    <div class="flex justify-between">
      <h1 class="shop-dashboard-title">
        Create a coupon
      </h1>
    </div>
    <div class="max-w-[1150px] mx-auto mt-4">
      <CreateCouponForm />
    </div>
  </div>
</template>
