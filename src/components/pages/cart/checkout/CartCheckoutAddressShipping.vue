<script setup lang="ts">
import { useGetUserAddresses } from '~/services/user';
import { CreateUserAddressDialog } from '#components';

const cartStore = useCartStore();
const dialog = useModal();

const {
  isPending: isPendingGetUserAddresses,
  data: dataUserAddress,
} = useGetUserAddresses({
  select: '-user,-createdAt,-updatedAt',
  sortBy: '-is_primary',
});

const addressRadioOptions = computed(() => {
  if (dataUserAddress.value?.results && dataUserAddress.value.results.length > 0) {
    return dataUserAddress.value.results.map(address => ({
      ...address,
      value: address.id,
    }));
  }
  return [];
});


const addressIdSelected = ref();

watch(addressRadioOptions, () => {
  if (addressRadioOptions.value.length > 0) {
    addressIdSelected.value = addressRadioOptions.value[0].value;
    cartStore.stateCheckoutCart.address = addressRadioOptions.value[0];
  }
}, { immediate: true });

watch(() => addressIdSelected.value, () => {
  if (dataUserAddress.value) {
    const address = dataUserAddress.value.results.find((item) => {
      return item.id === addressIdSelected.value;
    });
    if (address) {
      cartStore.stateCheckoutCart.address = address;
    }
  }
});

const showCreateDialog = () => {
  dialog.open(CreateUserAddressDialog);
};
</script>

<template>
  <UCard>
    <div>
      <div class="mb-2 flex items-center justify-between">
        <legend class="mb-1 text-base font-bold text-gray-700">
          Shipping UserAddress
        </legend>
        <UButton
          color="primary"
          variant="solid"
          :disabled="isPendingGetUserAddresses"
          @click="showCreateDialog"
        >
          Add a new address
        </UButton>
      </div>

      <div
        v-if="isPendingGetUserAddresses"
        class="grid h-80 w-full place-content-center"
      >
        <LoadingSvg :child-class="'!w-10 !h-10'" />
      </div>
      <div
        v-else
        class="mt-8 gap-x-56 gap-y-16"
      >
        <URadioGroup
          v-model="addressIdSelected"
          :options="addressRadioOptions"
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
