<script setup lang="ts">
import { useGetCountries } from '~/services/address';
import type { ProductStandardShipping } from '~/types/product';
import { PRODUCT_SHIPPING_CHARGE, PRODUCT_SHIPPING_CONFIG, PRODUCT_SHIPPING_SERVICES } from '~/config/enums/product';

const emit = defineEmits<{
  delete: []
  onChange: [value: ProductStandardShipping]
}>();

defineProps<{
  index: number
  disabledDelete: boolean
}>();

const model = defineModel<Partial<ProductStandardShipping>>({
  required: true,
});

const { data: dataGetCountries } = useGetCountries();

// ------------------ Computed ref ( Select Options )
const countriesOptions = computed(() => {
  if (dataGetCountries.value) {
    const result = ['Everywhere else'];
    const mapData = dataGetCountries.value.data.map(co => co.name);
    return [...result, ...mapData];
  }
  return [];
});

const chargeOptions = [
  { id: PRODUCT_SHIPPING_CHARGE.FREE_SHIPPING, label: 'Free shipping' },
  { id: PRODUCT_SHIPPING_CHARGE.FIXED_PRICE, label: 'Fixed price', disabled: true },
];

const shippingServiceOptions = [PRODUCT_SHIPPING_SERVICES.OTHER];

const deliveryTimeOptions = new Array(PRODUCT_SHIPPING_CONFIG.MAX_DAYS_DELIVERY).fill('').map((_, idx) => (idx + 1).toString());

const deliveryTimeToOptions = computed(() => {
  const result = [];
  for (let i = stateDeliveryTime.from + 1; i < PRODUCT_SHIPPING_CONFIG.MAX_DAYS_DELIVERY; i++) {
    result.push(i.toString());
  }
  return result;
});

// ------------------ Models
const charge = computed({
  get() {
    return (model.value?.charge && chargeOptions.find(opt => opt.id === model.value.charge)) || chargeOptions[0];
  },
  set(newValue) {
    model.value.charge = newValue.id;
  },
});

const stateDeliveryTime = reactive({
  from: 0,
  to: 0,
});

// ----------------- Lifecycle Hooks
onMounted(() => {
  if (model.value.delivery_time) {
    const [from, to] = model.value.delivery_time.split('-');
    stateDeliveryTime.from = Number(from);
    stateDeliveryTime.to = Number(to);
  }
});

// ----------------- Side effects
watch(stateDeliveryTime, () => {
  if (stateDeliveryTime.from && stateDeliveryTime.to) {
    model.value.delivery_time = `${stateDeliveryTime.from}-${stateDeliveryTime.to}`;
  }
});
</script>

<template>
  <div class="rounded-md border-2 border-dashed p-4 px-5">
    <div class="mb-2 flex justify-between">
      <div class="text-lg font-medium">
        {{ model.country }}
      </div>
      <UButton
        v-if="!disabledDelete"
        variant="ghost"
        icon="i-heroicons-x-mark"
        color="gray"
        @click="emit('delete')"
      />
    </div>
    <UFormGroup
      v-if="!model.country"
      required
      label="Country"
      :name="`standard_shipping.${index}.country`"
      class="mb-4"
    >
      <USelectMenu
        v-model="model.country"
        :options="countriesOptions"
        size="xl"
      />
    </UFormGroup>

    <UFormGroup
      required
      label="Shipping service"
      :name="`standard_shipping.${index}.service`"
      class="mb-4"
    >
      <USelectMenu
        v-model="model.service"
        :options="shippingServiceOptions"
        size="xl"
      />
    </UFormGroup>
    <UFormGroup
      required
      label="Delivery time"
      :name="`standard_shipping.${index}.delivery_time`"
      description="Business days"
      class="mb-4 w-1/2"
    >
      <div class="flex items-center gap-3">
        <USelectMenu
          v-model="stateDeliveryTime.from"
          class="w-1/2"
          :options="deliveryTimeOptions"
          size="xl"
        />
        <div>to</div>
        <USelectMenu
          v-model="stateDeliveryTime.to"
          class="w-1/2"
          :options="deliveryTimeToOptions"
          size="xl"
        />
      </div>
    </UFormGroup>
    <UFormGroup
      required
      label="What you'll charge"
      name="charge"
      class="mb-4"
    >
      <USelectMenu
        v-model="charge"
        :options="chargeOptions"
        size="xl"
      />
    </UFormGroup>
  </div>
</template>

<style scoped>

</style>
