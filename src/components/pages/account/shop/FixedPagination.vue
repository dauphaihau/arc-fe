<script lang="ts" setup>

const { page, pageCount, total = 0 } = defineProps<{
  page: number
  pageCount: number
  total: number | undefined
}>();

const emit = defineEmits<{(e: 'onChangePage', value: number): void }>();

const isBottomPage = ref(false);
const pageRef = ref(page);

onMounted(() => {
  window.addEventListener('scroll', onScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});

function onScroll() {
  const { scrollTop, offsetHeight } = document.documentElement;
  isBottomPage.value = scrollTop + window.innerHeight >= offsetHeight;
}

watch(pageRef, () => {
  emit('onChangePage', pageRef.value);
});

</script>

<template>
  <div
    class="bg-white w-full flex justify-end pb-2"
    :class="{ 'fixed-pagination w-shop-layout-content': !isBottomPage || total <= pageCount }"
  >
    <div class="border-t border-gray-200 w-full flex justify-between items-center pt-2">
      <div v-if="total > pageCount" class="text-customGray-850 text-base">
        Viewing
        <span class="text-customGray-950 font-medium">
          {{ pageCount * (page - 1) + 1 }} - {{ pageCount * page }}
        </span>
        of
        <span class="text-customGray-950 font-medium">
          {{ total }}
        </span>
        results
      </div>
      <div v-else class="text-customGray-850 text-md">
        <span class="text-customGray-950 font-medium">
          {{ total }}
        </span> results
      </div>
      <UPagination
        v-if="total > pageCount"
        v-model="pageRef"
        :total="total ?? 0"
        :page-count="pageCount"
        :inactive-button="{ color: 'gray' }"
      />
    </div>
  </div>
</template>


<style scoped>

.fixed-pagination {
 @apply flex fixed z-[2] bottom-0 pr-20 2xl:pr-12;
}

</style>
