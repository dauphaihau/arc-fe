<script setup lang="ts">
import type { IAddress } from '~/interfaces/address';

const { $api } = useNuxtApp();
const cartStore = useCartStore();

const emit = defineEmits<{ (e: 'onAddressEmpty', value: boolean): void }>();

const {
  pending: pendingGetAddresses,
  data: dataAddress,
} = await $api.address.getAddresses({
  select: '-user,-createdAt,-updatedAt',
  sortBy: '-is_primary',
});

// const addressIdSelected = ref()
const dataAddressRef = ref(dataAddress.value?.results || []);

const addressOptions = computed(() => {
  if (dataAddressRef.value.length === 0) {
    emit('onAddressEmpty', true);
    return [];
  }
  emit('onAddressEmpty', false);
  return dataAddressRef.value.map(address => ({
    ...address,
    value: address.id,
  }));
});

const addressIdSelected = ref(addressOptions.value[0].value);

watch(addressOptions, () => {
  cartStore.stateCheckout.address = addressOptions.value[0];
}, { immediate: true });

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

function onCreatedAddress(newAddress: IAddress) {
  dataAddressRef.value.push(newAddress);
}
</script>

<template>
  <UCard>
    <div>
      <div class="mb-2 flex items-center justify-between">
        <legend class="mb-1 text-base font-bold text-gray-700">
          Shipping Address
        </legend>

        <CreateUpdateAddressDialog @on-created-address="onCreatedAddress" />
      </div>

      <div
        v-if="!pendingGetAddresses"
        class="mt-8 gap-x-56 gap-y-16"
      >
        <URadioGroup
          v-model="addressIdSelected"
          :options="addressOptions"
        >
          <template #label="{ option }">
            <div class="mb-6 flex w-full flex-col gap-1 text-customGray-950">
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
