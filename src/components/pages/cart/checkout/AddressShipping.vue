<script setup lang="ts">

const { $api } = useNuxtApp();
const cartStore = useCartStore();

const {
  pending: pendingGetAddresses,
  data: dataAddress,
} = await $api.address.getAddresses({
  select: '-user,-createdAt,-updatedAt',
  sortBy: '-is_primary',
});

const addressIdSelected = ref();

const addressOptions = computed(() => {
  if (!dataAddress.value || dataAddress.value.results.length === 0) {
    return [];
  }
  const result = dataAddress.value.results.map(address => ({
    ...address,
    value: address.id,
  }));
  addressIdSelected.value = result[0].value;
  cartStore.stateCheckout.address = result[0];
  return result;
});

watch(() => addressIdSelected.value, () => {
  if (dataAddress.value) {
    const address = dataAddress.value.results.find((item) => {
      return item.id === addressIdSelected.value;
    });
    if (address) {
      cartStore.stateCheckout.address = address;
    }
  }
});

</script>

<template>
  <UCard>
    <div>
      <div class="flex justify-between items-center mb-2">
        <legend class="text-gray-700 mb-1 text-base font-bold">
          Shipping Address
        </legend>

        <CreateUpdateAddressDialog />
      </div>

      <div v-if="!pendingGetAddresses" class="mt-8 gap-x-56 gap-y-16">
        <URadioGroup v-model="addressIdSelected" :options="addressOptions">
          <template #label="{ option }">
            <div class="flex flex-col gap-1 w-full text-customGray-950 mb-6">
              <div class="">
                {{ option.full_name }} |
                <span class="font-normal">{{ option.phone }}</span>
              </div>
              <div class="">
                {{ option.address1 }}, {{ option.city }}, {{ option.zip }}, {{ option.country }}
              </div>
            </div>
          </template>
        </URadioGroup>
      </div>
    </div>
  </UCard>
</template>
