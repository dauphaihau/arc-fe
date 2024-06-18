<script lang="ts" setup>
definePageMeta({ layout: 'market' });
</script>

<template>
  <div class="space-y-20 py-12">
    <HomeProductsRecentlyViewed />
    <HomeProductsBySubCategory />
    <HomeRecommendedSubCategories />
    <HomeRootCategories />
  </div>
</template>
