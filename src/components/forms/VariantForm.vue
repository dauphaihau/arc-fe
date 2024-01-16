<script setup lang="ts">

const props = defineProps<{
  submit: boolean
}>();

interface State {
  variants: { name: string }[]
  subVariants: { name: string }[]
  variant_group_name: string,
  sub_variant_group_name: string,
  isActiveSubVariant: boolean,
  variantOption: string,
  subVariantOption: string,
}

interface Variant {
  id: number
  variant_name: string,
  sub_variant_name?: string,
  price: number,
  quantity: number,
  sku: string,
}

const state = reactive<State>({
  variant_group_name: '',
  sub_variant_group_name: '',
  isActiveSubVariant: false,
  variantOption: '',
  subVariantOption: '',
  variants: [],
  subVariants: [],
});

const variants = ref<Variant[]>([
  {
    id: 1,
    variant_name: '',
    price: 0,
    quantity: 0,
    sku: '',
  },
]);

const addVariant = () => {
  state.variants.push({ name: state.variantOption });

  if (variants.value.length === 1 && !variants.value[0].variant_name) {
    variants.value[0].variant_name = state.variantOption;
    state.variantOption = '';
    return;
  }

  if (!state.subVariants.length) {
    const variantToAdd: Variant = {
      id: variants.value.length + 1,
      variant_name: state.variantOption,
      price: 0,
      quantity: 0,
      sku: '',
    };

    if (state.isActiveSubVariant) {
      variantToAdd.sub_variant_name = '';
    }
    variants.value.push(variantToAdd);
    state.variantOption = '';
    return;
  }

  // console.log(`case subVariants > 0`);
  const newVariants: Variant[] = [];
  let id = 0;
  state.variants.forEach((stateVariant) => {
    state.subVariants.forEach((stateSubVariant) => {
      id++;

      const result = variants.value.find(
        vari => vari.variant_name === stateVariant.name &&
              vari.sub_variant_name === stateSubVariant.name
      );

      newVariants.push({
        id,
        variant_name: stateVariant.name || '',
        sub_variant_name: stateSubVariant.name || '',
        price: result?.price || 0,
        quantity: result?.quantity || 0,
        sku: result?.sku || '',
      });
    });
  });
  variants.value = newVariants;
  state.variantOption = '';
};

const removeVariant = (variantName: Variant['variant_name']) => {
  state.variants = state.variants.filter(vari => vari.name !== variantName);
  variants.value = variants.value.filter(vari => vari.variant_name !== variantName);
};

const removeSubVariant = (subVariantName: Variant['sub_variant_name']) => {
  state.subVariants = state.subVariants.filter(vari => vari.name !== subVariantName);
  variants.value = variants.value.filter(vari => vari.sub_variant_name !== subVariantName);
};

const updateVariantName = (e: Event) => {
  const { name, value } = e.target as HTMLInputElement;
  state.variants = state.variants.map((vari) => {
    if (vari.name === name) {
      return { name: value };
    }
    return vari;
  });
  variants.value = variants.value.map(vari =>
    vari.variant_name === name ? { ...vari, variant_name: value } : vari);
};

const updateSubVariantName = (e: Event) => {
  const { name, value } = e.target as HTMLInputElement;
  state.subVariants = state.subVariants.map((vari) => {
    if (vari.name === name) {
      return { name: value };
    }
    return vari;
  });
  variants.value = variants.value.map((vari) => {
    if (vari.sub_variant_name === name) {
      return { ...vari, sub_variant_name: value };
    }
    return vari;
  });
};

const addSubVariant = () => {
  state.subVariants.push({ name: state.subVariantOption });

  if (!variants.value[0].sub_variant_name && variants.value.length === 1) {
    variants.value[0].sub_variant_name = state.subVariantOption;
    state.subVariantOption = '';
    return;
  }

  if (!state.variants.length) {
    const newVariants: Variant[] = [];
    // console.log('case variants empty');
    state.subVariants.forEach((subv, index) => {
      newVariants.push({
        id: index + 1,
        variant_name: '',
        sub_variant_name: subv.name,
        price: 0,
        quantity: 0,
        sku: '',
      });
    });
    variants.value = newVariants;
    state.subVariantOption = '';
    return;
  }

  // console.log('case variants > 0');
  const newVariants: Variant[] = [];
  let id = 0;
  state.variants.forEach((stateVariant) => {
    state.subVariants.forEach((stateSubVariant) => {
      id++;

      const result = variants.value.find(
        vari => vari.variant_name === stateVariant.name &&
                vari.sub_variant_name === stateSubVariant.name
      );

      newVariants.push({
        id,
        variant_name: stateVariant.name || '',
        sub_variant_name: stateSubVariant.name || '',
        price: result?.price || 0,
        quantity: result?.quantity || 0,
        sku: result?.sku || '',
      });
    });
  });
  variants.value = newVariants;
  state.subVariantOption = '';
};

const columnsRef = ref([
  {
    key: 'variant_name',
    label: state.variant_group_name || 'Group variant 1',
  }, {
    key: 'price',
    label: 'Price',
  }, {
    key: 'quantity',
    label: 'Quantity',
  }, {
    key: 'sku',
    label: 'SKU',
  },
]);

const columns = computed({
  get() {
    return columnsRef.value;
  },
  set(val) {
    columnsRef.value = val;
  },
});

const onChangeInputTable = (event: Event, row: Variant) => {
  const target = event.target as HTMLInputElement;
  const name = target.name;
  let value: string | number = target.value;
  if (name === 'price' || name === 'quantity') {
    value = Number(value);
  }
  // let { name, value } = event.target as HTMLInputElement;
  // if (name === 'price' || name === 'quantity') {
  //   value = Number(value);
  // }
  variants.value[row.id - 1][name] = value;
};

const activeSubVariant = () => {
  state.isActiveSubVariant = true;

  columns.value = insert(columns.value, {
    key: 'sub_variant_name',
    label: 'Group variant 2',
  }, 1);

  if (state.variants.length) {
    variants.value = state.variants.map((variant, index) => {
      return {
        id: index + 1,
        variant_name: variant.name,
        sub_variant_name: '',
        price: 0,
        quantity: 0,
        sku: '',
      };
    });
  } else {
    variants.value[0].sub_variant_name = '';
  }
};

const rowsTable = computed(() => variants.value);

watch(() => [state.variant_group_name, state.sub_variant_group_name], () => {
  columns.value[0].label = state.variant_group_name || 'Group variant 1';
  if (state.isActiveSubVariant) {
    columns.value[1].label = state.sub_variant_group_name || 'Group variant 2';
  }
});

watch(props, () => {
  // console.log('subbmiiti');
}, { deep: true, immediate: true });


</script>

<template>
  <div class="">
    <!--    <div class="max-w-[42%]">-->
    <!--        <div class="flex gap-2 w-full">-->
    <div class="grid grid-cols-3">
      <div class="">
        <UFormGroup
          class="mb-4"
          label="Group variant 1"
          required
        >
          <UInput
            v-model="state.variant_group_name"
            size="lg"
          />
        </UFormGroup>
        <UFormGroup
          class="mb-4"
          label="Name the option"
          required
        >
          <UButtonGroup size="lg" orientation="horizontal">
            <UInput v-model="state.variantOption" />
            <UButton color="gray" variant="solid" @click="addVariant">
              Add
            </UButton>
          </UButtonGroup>
        </UFormGroup>
        <div v-if="state.variants.length > 0">
          <div v-for="(option, index) of state.variants" :key="option.name">
            <UButtonGroup
              v-if="option"
              size="lg"
              orientation="horizontal"
              class="mb-4"
            >
              <UInput
                :model-value="option.name"
                :name="option.name"
                @change="updateVariantName"
              />
              <UButton
                :disabled="index === 0"
                icon="i-heroicons-x-mark"
                color="gray"
                @click="() => removeVariant(option.name)"
              />
            </UButtonGroup>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <UDivider color="gray" orientation="vertical" class="w-fit" />
      </div>

      <div class="">
        <UButton
          v-if="!state.isActiveSubVariant"
          class="mb-4"
          icon="i-heroicons-plus"
          color="gray"
          variant="solid"
          @click="activeSubVariant"
        >
          Add a variation
        </UButton>
        <div v-else>
          <UFormGroup
            class="mb-4"
            label="Group variant 2"
            required
          >
            <UInput
              v-model="state.sub_variant_group_name"
              size="lg"
            />
          </UFormGroup>
          <UFormGroup
            class="mb-4"
            label="Name the option"
            required
          >
            <UButtonGroup size="lg" orientation="horizontal">
              <UInput v-model="state.subVariantOption" />
              <UButton color="gray" variant="solid" @click="addSubVariant">
                Add
              </UButton>
            </UButtonGroup>
          </UFormGroup>

          <div v-if="state.subVariants.length > 0">
            <div v-for="(option, index) of state.subVariants" :key="option.name">
              <UButtonGroup
                v-if="option"
                size="lg"
                orientation="horizontal"
                class="mb-4"
              >
                <UInput
                  :model-value="option.name"
                  :name="option.name"
                  @change="updateSubVariantName"
                />
                <UButton
                  :disabled="index === 0"
                  icon="i-heroicons-x-mark"
                  color="gray"
                  @click="() => removeSubVariant(option.name)"
                />
              </UButtonGroup>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UTable
      :rows="rowsTable"
      :columns="columns"
      class="mt-5"
    >
      <!--      <template #variant_group_name-data="{ row }">-->
      <!--        <UInput-->
      <!--          v-model="state.variant_group_name"-->
      <!--          size="lg"-->
      <!--        />-->
      <!--      </template>-->
      <template #price-data="{ row }">
        <UInput
          v-model="row.price"
          size="lg"
          name="price"
          @change="(e: Event) => onChangeInputTable(e, row)"
        >
          <template #trailing>
            <span class="text-gray-500 dark:text-gray-400 text-xs">USD</span>
          </template>
        </UInput>
      </template>
      <template #quantity-data="{ row }">
        <UInput
          v-model="row.quantity"
          name="quantity"
          size="lg"
          @change="(e: Event) => onChangeInputTable(e, row)"
        />
      </template>
      <template #sku-data="{ row }">
        <UInput
          v-model="row.sku"
          name="sku"
          size="lg"
          @change="(e: Event) => onChangeInputTable(e, row)"
        />
      </template>
    </UTable>
  </div>
</template>
