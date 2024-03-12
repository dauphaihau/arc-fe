<script lang="ts" setup>
definePageMeta({ layout: 'home' });
</script>

<template>
  <div class="py-12 space-y-20">
    <HomeProductsRecentlyViewed />
    <HomeProductsBySubCategory />
    <HomeRecommendedSubCategories />
    <HomeRootCategories />
  </div>
</template>
