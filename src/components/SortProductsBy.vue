<script setup lang="ts">

const router = useRouter();
const route = useRoute();

const options = [
  { id: null, label: 'Default' },
  { id: 'desc', label: 'Newest' },
  { id: 'priceAsc', label: 'Price: Low to High' },
  { id: 'priceDesc', label: 'Price: High to Low' },
];

const selected = ref(options[0]);

watch(selected, () => {
  const routeQuery = { ...route.query };
  if (selected.value.id) {
    routeQuery.sortBy = selected.value.id;
  } else {
    delete routeQuery.sortBy;
  }
  router.push({ query: routeQuery });
});

</script>

<template>
  <div class="flex gap-2 items-center">
    <div>Sort By:</div>
    <USelectMenu
      v-model="selected"
      :options="options"
      :ui-menu="{
        width: 'w-[10.5rem]',
      }"
    />
  </div>
</template>

<style scoped>

</style>
