<script setup lang="ts">

import type { IProductInventory, IProductVariant } from '~/interfaces/product';
import { PRODUCT_CONFIG } from '~/config/enums/product';
import { productInventorySchema } from '~/schemas/product.schema';

const props = defineProps<{ countValidate: number }>();

const generateRandomId = () => new Date().getTime();

type VariantOption = { id: number, name: string, errorMsg: string };

type State = {
  variants: VariantOption[]
  subVariants: VariantOption[]
  isActiveSubVariant: boolean
  variantOption: string
  subVariantOption: string
  errorVariantOption: string
  errorSubVariantOption: string
  errorVariantGroupName: string
  errorVariantSubGroupName: string
} & Pick<IProductVariant, 'variant_group_name' | 'sub_variant_group_name'>

type VariantTable = {
  id: number
  sub_variant_name?: string,
  errorPrice: string,
  errorStock: string,
  price?: IProductInventory['price']
} & Pick<IProductVariant, 'variant_name'> &
    Pick<IProductInventory, | 'stock' | 'sku'>

const emit = defineEmits<{ (e: 'onChange', value: any[]): void }>();

const state = reactive<State>({
  variant_group_name: '',
  sub_variant_group_name: '',
  isActiveSubVariant: false,
  variantOption: '',
  errorVariantGroupName: '',
  errorSubVariantOption: '',
  errorVariantSubGroupName: '',
  errorVariantOption: '',
  subVariantOption: '',
  variants: [],
  subVariants: [],
});

const defaultVariantTable: VariantTable = {
  id: 1,
  variant_name: '',
  price: undefined,
  stock: 0,
  sku: '',
  errorPrice: '',
  errorStock: '',
};

const variantsTable = ref<VariantTable[]>([defaultVariantTable]);

function mixVariantsTable() {
  let id = 0;
  const newVariantsTable: VariantTable[] = [];
  state.variants.forEach((stateVariant) => {
    state.subVariants.forEach((stateSubVariant) => {
      id++;
      const result = variantsTable.value.find(
        variant => variant.variant_name === stateVariant.name &&
              variant.sub_variant_name === stateSubVariant.name
      );
      newVariantsTable.push({
        id,
        variant_name: stateVariant.name || '',
        sub_variant_name: stateSubVariant.name || '',
        price: result?.price || undefined,
        stock: result?.stock || 0,
        sku: result?.sku || '',
        errorPrice: '',
        errorStock: '',
      });
    });
  });
  variantsTable.value = newVariantsTable;
}

const addVariant = () => {
  state.variants.push({ id: generateRandomId(), name: state.variantOption, errorMsg: '' });

  // case add variant_name into first element table
  if (variantsTable.value.length === 1 && !variantsTable.value[0].variant_name) {
    variantsTable.value[0].variant_name = state.variantOption;
    state.variantOption = '';
    return;
  }

  // case variantsTable.value.length > 0, add new element into table
  if (!state.subVariants.length) {
    const newVariantTable = {
      ...defaultVariantTable,
      id: variantsTable.value.length + 1,
      variant_name: state.variantOption,
    };

    if (state.isActiveSubVariant) {
      newVariantTable.sub_variant_name = '';
    }
    variantsTable.value.push(newVariantTable);
    state.variantOption = '';
    return;
  }

  // case mix variants & subVariants option into table
  mixVariantsTable();
  state.variantOption = '';
};

const addSubVariant = () => {
  state.subVariants.push({ id: generateRandomId(), name: state.subVariantOption, errorMsg: '' });

  // case add variant_name into first element table at sub variant column
  if (!variantsTable.value[0].sub_variant_name && variantsTable.value.length === 1) {
    variantsTable.value[0].sub_variant_name = state.subVariantOption;
    state.subVariantOption = '';
    return;
  }

  // case variantsTable.value.length > 0, add new element into table
  if (!state.variants.length) {
    const newVariants: VariantTable[] = [];
    state.subVariants.forEach((subVariant, index) => {
      newVariants.push({
        ...defaultVariantTable,
        id: index + 1,
        sub_variant_name: subVariant.name,
      });
    });
    variantsTable.value = newVariants;
    state.subVariantOption = '';
    return;
  }

  // case mix variants & subVariants option into table
  mixVariantsTable();
  state.subVariantOption = '';
};

const removeVariant = ({ id, name }: VariantOption) => {
  state.variants = state.variants.filter(variant => variant.id !== id);
  variantsTable.value = variantsTable.value.filter(variant => variant.variant_name !== name);
};

const removeSubVariant = ({ id, name }: VariantOption) => {
  state.subVariants = state.subVariants.filter(variant => variant.id !== id);
  variantsTable.value = variantsTable.value.filter((variant) => {
    return variant.sub_variant_name !== name;
  });
};

const updateVariantName = (currentVariant: VariantOption, e: Event) => {
  const { id, name } = currentVariant;
  const newVariantName = (e.target as HTMLInputElement).value;

  state.variants = state.variants.map((variant) => {
    if (variant.id === id) {
      return { ...variant, name: newVariantName };
    }
    return variant;
  });

  variantsTable.value = variantsTable.value.map((variant) => {
    if (variant.variant_name === name) {
      return { ...variant, variant_name: newVariantName };
    }
    return variant;
  });
};

const updateSubVariantName = (currentVariant: VariantOption, e: Event) => {
  const { id, name } = currentVariant;
  const newSubVariantName = (e.target as HTMLInputElement).value;
  state.subVariants = state.subVariants.map((variant) => {
    if (variant.id === id) {
      return { ...variant, name: newSubVariantName };
    }
    return variant;
  });
  variantsTable.value = variantsTable.value.map((variant) => {
    if (variant.sub_variant_name === name) {
      return { ...variant, sub_variant_name: newSubVariantName };
    }
    return variant;
  });
};

const columnsRef = ref([
  {
    key: 'variant_name',
    label: state.variant_group_name || 'Group variant 1',
  }, {
    key: 'price',
    label: 'Price',
  }, {
    key: 'stock',
    label: 'Stock',
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

const onChangeInputTable = (event: Event, row: VariantTable) => {
  const target = event.target as HTMLInputElement;
  const name = target.name;
  let value: string | number = target.value;

  if (name === 'price' || name === 'stock') {
    value = Number(value);
  }
  console.log('row', row);
  if (row.id) {
    console.log('variants-table', variantsTable.value);
    variantsTable.value[row.id - 1][name] = value;
  }
};

const openSubVariant = () => {
  state.isActiveSubVariant = true;

  columns.value = insert(columns.value, {
    key: 'sub_variant_name',
    label: 'Group variant 2',
  }, 1);

  if (state.variants.length) {
    variantsTable.value = state.variants.map((variant) => {
      return { ...defaultVariantTable, variant_name: variant.name, sub_variant_name: '' };
    });
  } else {
    variantsTable.value[0].sub_variant_name = '';
  }
};

const closeSubVariant = () => {
  state.isActiveSubVariant = false;

  columns.value = columns.value.filter(col => col.key !== 'sub_variant_name');

  if (state.variants.length) {
    variantsTable.value = state.variants.map((variant, index) => {
      return {
        ...defaultVariantTable,
        id: index + 1,
        variant_name: variant.name,
      };
    });
  } else {
    variantsTable.value[0].variant_name = '';
  }
};

const rowsTable = computed(() => variantsTable.value);

watch(() => [state.variant_group_name, state.sub_variant_group_name], () => {
  columns.value[0].label = state.variant_group_name || 'Group variant 1';
  if (state.isActiveSubVariant) {
    columns.value[1].label = state.sub_variant_group_name || 'Group variant 2';
  }
});

watch(() => props.countValidate, () => {
  state.errorVariantGroupName = !state.variant_group_name ? 'Required' : '';
  state.errorVariantOption = state.variants.length === 0 ? 'Required at least 1 variant' : '';
  if (state.isActiveSubVariant) {
    state.errorVariantSubGroupName = !state.sub_variant_group_name ? 'Required' : '';
    state.errorSubVariantOption = state.subVariants.length === 0 ? 'Required at least 1 variant' : '';
  }

  // validate duplicate variant name
  const variantNameMap = new Map<string, number>();
  const errorMsg = 'Duplicate';
  let isAnyDuplicateVariantName = false;
  state.variants.forEach((variant, idx) => {
    variant.errorMsg = '';
    const isHasVariantName = variantNameMap.has(variant.name);

    if (!isHasVariantName) {
      variantNameMap.set(variant.name, idx);
    } else {
      const indexInMap = variantNameMap.get(variant.name);
      variant.errorMsg = errorMsg;
      isAnyDuplicateVariantName = true;
      if (indexInMap || indexInMap === 0) {
        state.variants[indexInMap].errorMsg = errorMsg;
      }
    }
  });

  // validate price, stock, sku in table
  const variantsTableForParse: Pick<VariantTable, 'price' | 'stock' | 'sku'>[] = [];
  variantsTable.value.forEach((vb) => {
    vb.errorPrice = '';
    vb.errorStock = '';
    const { stock, price, sku } = vb;
    variantsTableForParse.push({ stock, price, sku });
  });

  const parsedVariantsTable = productInventorySchema
    .pick({ price: true, stock: true, sku: true })
    .array()
    .safeParse(variantsTableForParse);

  if (!parsedVariantsTable.success) {
    parsedVariantsTable.error.issues.forEach((detail) => {
      const index = detail.path[0];
      const name = detail.path[1];
      if (name === 'price') {
        variantsTable.value[index].errorPrice = detail.message;
      }
      if (name === 'stock') {
        variantsTable.value[index].errorStock = detail.message;
      }
    });
  }

  if (
    state.variants.length > 0 &&
      (state.isActiveSubVariant ? state.subVariants.length > 0 : true) &&
      !isAnyDuplicateVariantName &&
      parsedVariantsTable.success
  ) {
    emitVariantsTable();
  } else {
    emit('onChange', []);
  }
});

function emitVariantsTable() {
  if (state.isActiveSubVariant) {
    const groupedVariants = Object.entries(
      variantsTable.value.reduce((acc, variant) => {
        const {
          price, sku, stock, variant_name, sub_variant_name,
        } = variant;

        if (!acc[variant_name]) {
          acc[variant_name] = [];
        }
        acc[variant_name].push({
          price,
          sku,
          stock,
          variant_name: sub_variant_name,
        });
        return acc;
      }, {})
    ).map(([variant_name, variant_options]) => ({
      variant_group_name: state.variant_group_name,
      sub_variant_group_name: state.sub_variant_group_name,
      variant_name,
      variant_options,
    }));
    emit('onChange', groupedVariants);
    return;
  }

  const groupedVariants = Object.entries(
    variantsTable.value.reduce((acc, variant) => {
      const {
        price, sku, stock, variant_name,
      } = variant;
      if (!acc[variant_name]) {
        acc[variant_name] = {};
      }
      acc[variant_name] = {
        price, sku, stock, variant_name,
      };
      return acc;
    }, {})
  ).map(([variant_name, resValuesVariant]) => ({
    ...resValuesVariant as object,
    variant_group_name: state.variant_group_name,
    variant_name,
  }));
  emit('onChange', groupedVariants);
}

watchDebounced(
  () => state.variantOption,
  () => {
    state.errorVariantOption = '';
    if (state.variants.length > 0) {
      state.variants.forEach((variant) => {
        variant.errorMsg = '';
        if (variant.name === state.variantOption) {
          variant.errorMsg = 'Duplicate';
          state.errorVariantOption = 'Duplicate';
        }
      });
    }
  },
  { debounce: 500, maxWait: 1000 }
);

watchDebounced(
  () => state.subVariantOption,
  () => {
    state.errorSubVariantOption = '';
    if (state.subVariants.length > 0) {
      state.subVariants.forEach((variant) => {
        variant.errorMsg = '';
        if (variant.name === state.subVariantOption) {
          variant.errorMsg = 'Duplicate';
          state.errorSubVariantOption = 'Duplicate';
        }
      });
    }
  },
  { debounce: 500, maxWait: 1000 }
);


</script>

<template>
  <div>
    <div class="flex gap-20">
      <!--   Group variant 1   -->
      <div class="w-1/5">
        <UFormGroup
          class="mb-4"
          label="Group variant 1"
          required
          :error="state.errorVariantGroupName ?? ''"
        >
          <template #hint>
            <span class="hint-text-input">
              {{ state.variant_group_name.length ?? 0 }}/
              {{ PRODUCT_CONFIG.MAX_CHAR_VARIANT_GROUP_NAME }}
            </span>
          </template>
          <UInput
            v-model="state.variant_group_name"
            :maxlength="PRODUCT_CONFIG.MAX_CHAR_VARIANT_GROUP_NAME"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup
          class="mb-4"
          label="Name the option"
          required
          :error="state.errorVariantOption ?? ''"
        >
          <template #hint>
            <span class="hint-text-input">
              {{ state.variantOption.length ?? 0 }}/
              {{ PRODUCT_CONFIG.MAX_CHAR_VARIANT_NAME }}
            </span>
          </template>

          <UButtonGroup size="lg" orientation="horizontal">
            <UInput
              v-model="state.variantOption"
              :maxlength="PRODUCT_CONFIG.MAX_CHAR_VARIANT_NAME"
            />
            <!--              :disabled="!state.variantOption"-->
            {{ state.errorVariantOption }}
            <UButton
              :disabled="!state.variantOption || !!state.errorVariantOption"
              color="gray"
              variant="solid"
              @click="addVariant"
            >
              Add
            </UButton>
          </UButtonGroup>
        </UFormGroup>

        <div v-if="state.variants.length > 0">
          <div v-for="option of state.variants" :key="option.id">
            <UFormGroup :error="option?.errorMsg ?? ''" class="mb-4">
              <UButtonGroup
                v-if="option"
                size="lg"
                orientation="horizontal"
              >
                <UInput
                  :model-value="option.name"
                  :maxlength="PRODUCT_CONFIG.MAX_CHAR_VARIANT_NAME"
                  @change="(e: Event) => updateVariantName(option, e)"
                />

                <UButton
                  :disabled="state.variants.length === 1"
                  icon="i-heroicons-x-mark"
                  color="gray"
                  @click="() => removeVariant(option)"
                />
              </UButtonGroup>
            </UFormGroup>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <UDivider color="gray" orientation="vertical" class="w-fit" />
      </div>

      <!--   Group variant 2   -->
      <div class="w-1/5 relative">
        <UButton
          v-if="!state.isActiveSubVariant"
          class="mb-4"
          icon="i-heroicons-plus"
          color="gray"
          variant="solid"
          @click="openSubVariant"
        >
          Add a variation
        </UButton>
        <div v-else>
          <UButton
            class="absolute -top-4 -right-20"
            variant="ghost"
            icon="i-heroicons-x-mark"
            color="gray"
            @click="closeSubVariant"
          />

          <UFormGroup
            class="mb-4"
            label="Group variant 2"
            required
            name="sub_variant_group_name"
            :error="state.errorVariantSubGroupName ?? ''"
          >
            <UInput
              v-model="state.sub_variant_group_name"
              size="lg"
              :maxlength="PRODUCT_CONFIG.MAX_CHAR_VARIANT_GROUP_NAME"
            />
            <template #hint>
              <span class="hint-text-input">
                {{ state.sub_variant_group_name?.length ?? 0 }}/
                {{ PRODUCT_CONFIG.MAX_CHAR_VARIANT_GROUP_NAME }}
              </span>
            </template>
          </UFormGroup>
          <UFormGroup
            class="mb-4"
            label="Name the option"
            required
            :error="state.errorSubVariantOption ?? ''"
          >
            <template #hint>
              <span class="hint-text-input">
                {{ state.subVariantOption.length ?? 0 }}/
                {{ PRODUCT_CONFIG.MAX_CHAR_VARIANT_NAME }}
              </span>
            </template>
            <UButtonGroup size="lg" orientation="horizontal">
              <UInput v-model="state.subVariantOption" />

              <UButton
                :disabled="!state.subVariantOption || !!state.errorSubVariantOption"
                color="gray"
                variant="solid"
                @click="addSubVariant"
              >
                Add
              </UButton>
            </UButtonGroup>
          </UFormGroup>

          <div v-if="state.subVariants.length > 0">
            <div v-for="option of state.subVariants" :key="option.id">
              <UFormGroup :error="option?.errorMsg ?? ''" class="mb-4">
                <UButtonGroup
                  v-if="option"
                  size="lg"
                  orientation="horizontal"
                >
                  <UInput
                    :model-value="option.name"
                    @change="(e: Event) => updateSubVariantName(option, e)"
                  />
                  <UButton
                    :disabled="state.subVariants.length === 1"
                    icon="i-heroicons-x-mark"
                    color="gray"
                    @click="() => removeSubVariant(option)"
                  />
                </UButtonGroup>
              </UFormGroup>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UTable
      :rows="rowsTable"
      :columns="columns"
      class="mt-5"
      :ui="{
        th: { base : 'max-w-28 truncate'},
      }"
    >
      <template #variant_name-data="{ row }">
        <div class="min-w-44 max-w-44 truncate">
          {{ row.variant_name || '-' }}
        </div>
      </template>

      <template #sub_variant_name-data="{ row }">
        <div class="min-w-44 max-w-44 truncate">
          {{ row.sub_variant_name || '-' }}
        </div>
      </template>

      <template #price-data="{ row }">
        <UFormGroup class="mt-6" :error="row.errorPrice ?? ''">
          <UInput
            v-model.number="row.price"
            size="lg"
            name="price"
            :maxlength="PRODUCT_CONFIG.MAX_PRICE.toString().length"
            @change="(e: Event) => onChangeInputTable(e, row)"
            @keypress="keyPressIsNumber($event)"
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400 text-xs">USD</span>
            </template>
          </UInput>
          <template #error="{ error }">
            <p class="error-message">
              {{ error ?? '' }}
            </p>
          </template>
        </UFormGroup>
      </template>

      <template #stock-data="{ row }">
        <UFormGroup class="mt-6" :error="row.errorStock ?? ''">
          <UInput
            v-model.number="row.stock"
            name="stock"
            size="lg"
            :maxlength="PRODUCT_CONFIG.MAX_QUANTITY.toString().length"
            @change="(e: Event) => onChangeInputTable(e, row)"
            @keypress="keyPressIsNumber($event)"
          />
          <template #error="{ error }">
            <p class="error-message">
              {{ error ?? '' }}
            </p>
          </template>
        </UFormGroup>
      </template>

      <template #sku-data="{ row }">
        <UFormGroup class="mt-6">
          <UInput
            v-model="row.sku"
            :maxlength="PRODUCT_CONFIG.MAX_CHAR_SKU"
            name="sku"
            size="lg"
            @change="(e: Event) => onChangeInputTable(e, row)"
          />
          <template #error="{ error }">
            <p class="error-message">
              {{ error ?? '' }}
            </p>
          </template>
        </UFormGroup>
      </template>
    </UTable>
  </div>
</template>

<style scoped>

.hint-text-input {
  @apply text-gray-500 text-xs;
}

.error-message {
  @apply mt-2 text-red-500 dark:text-red-400 text-sm h-[18px];
}

</style>
