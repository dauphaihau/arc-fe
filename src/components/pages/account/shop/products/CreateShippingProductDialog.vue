<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { useGetCountries } from '~/services/address';
import { ADDRESS_CONFIG } from '~/config/enums/address';
import type { CreateProductShipping, ProductShipping, ProductStandardShipping } from '~/types/product';
import { PRODUCT_SHIPPING_CHARGE, PRODUCT_SHIPPING_SERVICES } from '~/config/enums/product';
import { createProductShippingSchema } from '~/schemas/product-shipping.schema';

type TStateSubmit = Partial<Pick<ProductShipping, 'country' | 'zip' | 'process_time'>> & {
  standard_shipping: Partial<ProductStandardShipping>[]
};

const emit = defineEmits<{
  apply: [value: CreateProductShipping]
}>();

const props = defineProps<{
  initData?: CreateProductShipping
}>();

const { data: dataGetCountries } = useGetCountries();
const modal = useModal();
const autoStore = useAuthStore();

const processTimeOptions = [
  {
    id: '1d',
    label: '1 day',
  },
  {
    id: '1-2d',
    label: '1-2 days',
  },
];

const countriesOptions = computed(() => {
  if (dataGetCountries.value) {
    return dataGetCountries.value.data.map(co => co.name);
  }
  return [];
});

const stateSubmit = reactive<TStateSubmit>({
  process_time: processTimeOptions[0].id,
  standard_shipping: [],
});

const keyAnotherLocationList = ref(0);
const keyValidateLocations = ref(0);
const formRef = ref();

onMounted(() => {
  if (props.initData) {
    Object.assign(stateSubmit, props.initData);
    return;
  }
  if (autoStore?.user?.market_preferences?.region) {
    stateSubmit.country = autoStore.user.market_preferences.region;
    stateSubmit.standard_shipping.push({
      country: stateSubmit.country,
      service: PRODUCT_SHIPPING_SERVICES.OTHER,
    });
  }
});

const addLocation = () => {
  stateSubmit.standard_shipping.push({
    service: PRODUCT_SHIPPING_SERVICES.OTHER,
    charge: PRODUCT_SHIPPING_CHARGE.FREE_SHIPPING,
  });
};

const deleteLocation = (idx: number) => {
  stateSubmit.standard_shipping = stateSubmit.standard_shipping.filter((_value, index) => index !== idx);
  keyAnotherLocationList.value++;
  keyValidateLocations.value = 0;
};

function onSubmit(event: FormSubmitEvent<CreateProductShipping>) {
  emit('apply', event.data);
  modal.close();
}

const processTime = computed({
  get() {
    return processTimeOptions[0];
  },
  set(newValue) {
    stateSubmit.process_time = newValue.id;
  },
});
</script>

<template>
  <UModal
    :ui="{
      margin: '!mb-72',
      width: 'w-full sm:max-w-xl',
    }"
  >
    <div class="space-y-5 p-8">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-bold">
          Add custom shipping settings
        </h1>
        <div>
          We use these settings to calculate shipping costs and estimated delivery dates for buyers.
          Learn about shipping settings and estimated delivery dates.
        </div>
      </div>

      <UForm
        ref="formRef"
        :validate-on="['submit']"
        :state="stateSubmit"
        class="space-y-4"
        :schema="createProductShippingSchema"
        @submit="onSubmit"
      >
        <UFormGroup
          required
          label="Country of origin"
          name="country"
          description="The country you're shipping from"
          class="mb-4 flex w-full justify-between"
          :ui="{ container: 'w-3/5', description: 'w-36 text-xs' }"
        >
          <USelectMenu
            v-model="stateSubmit.country"
            :options="countriesOptions"
            size="xl"
          />
        </UFormGroup>
        <UFormGroup
          required
          label="Origin postal code"
          description="Where will your orders ship from—home, the post office, or another location?"
          name="zip"
          class="mb-4 flex w-full gap-[62px]"
          :ui="{ container: 'w-1/4', description: 'w-36 text-xs' }"
        >
          <UInput
            v-model="stateSubmit.zip"
            :maxlength="ADDRESS_CONFIG.MAX_CHAR_ZIP"
            size="xl"
            @keypress="keyPressIsNumber($event)"
          />
        </UFormGroup>
        <UFormGroup
          required
          label="Processing time"
          description="How much time do you need to prepare an order and put it in the mail? "
          name="process_time"
          class="mb-4 flex w-full gap-[62px]"
          :ui="{ container: 'w-1/3', description: 'w-36 text-xs' }"
        >
          <USelectMenu
            v-model="processTime"
            :options="processTimeOptions"
            size="xl"
          />
        </UFormGroup>

        <UDivider />

        <UFormGroup
          required
          label="Standard shipping"
          description="Where will you ship to? We’ll show your listings to shoppers in the countries you add here. Estimate your shipping costsOpens a new tab"
          class="mb-4"
        />

        <div
          :key="keyAnotherLocationList"
          class="space-y-5"
        >
          <div
            v-for="(_item, idx) of stateSubmit.standard_shipping"
            :key="idx"
          >
            <LocationShipping
              v-model="stateSubmit.standard_shipping[idx]"
              :key-validate="keyValidateLocations"
              :index="idx"
              :disabled-delete="idx === 0"
              @delete="deleteLocation(idx)"
            />
          </div>
        </div>
        <UButton
          color="gray"
          icon="i-heroicons-plus"
          @click="addLocation"
        >
          Add another location
        </UButton>
      </UForm>

      <div class="flex items-center justify-end gap-2">
        <UButton
          size="sm"
          color="gray"
          @click="modal.close"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          size="sm"
          @click="formRef?.submit"
        >
          Apply
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<style scoped>
</style>
