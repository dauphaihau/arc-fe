<script setup lang="ts">
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import { createProductSchema } from '~/schemas/product.schema';
import {
  PRODUCT_VARIANT_TYPES, PRODUCT_CONFIG, PRODUCT_STATES,
  productWhoMadeOpts, isDigitalOpts
} from '~/config/enums/product';
import { ROUTES } from '~/config/enums/routes';
import type {
  CreateProductBody,
  ProductCombineVariant,
  ProductSingleVariant
} from '~/types/product';
import { toastCustom } from '~/config/toast';
import { CreateShippingProductDialog } from '#components';
import { useShopCreateProduct } from '~/services/shop';
import { useGetPresignedUrl } from '~/services/upload';

export type IOnChangeCreateVariant = Pick<CreateProductBody, 'variant_type' | 'new_variants'> &
  (Omit<ProductSingleVariant, 'variants'> | Omit<ProductCombineVariant, 'variants'>) | null;

const router = useRouter();
const toast = useToast();
const modal = useModal();

const fileImages = ref<File[]>([]);
const formRef = ref();
const isDraftProduct = ref(false);
const isVariantProduct = ref(false);
const loadingSubmit = ref(false);
const btnSubmitRef = ref();
const enabledButtonSubmit = ref(false);
const countValidate = ref(0);

const selectedWhoMade = ref(productWhoMadeOpts[0]);

const state = reactive<Partial<CreateProductBody>>({
  title: '',
  description: '',
  who_made: computed(() => selectedWhoMade.value.id),
  is_digital: false,
  state: PRODUCT_STATES.ACTIVE,
  new_variants: [],
  variant_type: PRODUCT_VARIANT_TYPES.NONE,
  price: undefined,
  stock: 1,
  sku: '',
  category: '',
  images: [],
  tags: [],
  attributes: [],
});

const {
  mutateAsync: createProduct,
  isPending: isPendingCreateProduct,
} = useShopCreateProduct();

const {
  mutateAsync: getPresignedUrl,
} = useGetPresignedUrl();

const showCreateShippingProductDialog = () => {
  modal.open(CreateShippingProductDialog, {
    initData: state.shipping,
    onApply(val) {
      state.shipping = val;
    },
  });
};

const onChangeVariants = (values: IOnChangeCreateVariant) => {
  if (!values) return;
  Object.keys(values).forEach((key) => {
    state[key] = values[key];
  });
};

const validateForm = (values: CreateProductBody): FormError[] => {
  let errors: FormError[] = [];
  countValidate.value++;

  const result = createProductSchema
    .omit({
      variants: true,
      images: true,
      price: isVariantProduct.value || undefined,
      stock: isVariantProduct.value || undefined,
      sku: isVariantProduct.value || undefined,
    }).safeParse(values);

  if (!result.success) {
    errors = result.error.issues.map((detail) => {
      const path = detail.path.at(-1);
      return {
        path: typeof path === 'string' ? path : '',
        message: detail.message,
      };
    });
  }
  return errors;
};

async function onSubmit(event: FormSubmitEvent<CreateProductBody>) {
  // const dataSubmit = { ...event.data };
  const dataSubmit = event.data;

  if (isDraftProduct.value) {
    dataSubmit.state = PRODUCT_STATES.DRAFT;
  }
  if (isVariantProduct.value && dataSubmit?.new_variants?.length === 0) {
    return;
  }
  if (!fileImages.value || fileImages.value.length === 0) {
    return;
  }
  // if (dataSubmit.variant_type !== PRODUCT_VARIANT_TYPES.NONE) {
  //   delete dataSubmit.price;
  //   delete dataSubmit.sku;
  //   delete dataSubmit.stock;
  // }

  loadingSubmit.value = true;

  const promisesUploadImages = [];
  const keys = [];

  for (let i = 0; i < fileImages.value.length; i++) {
    const { presignedUrl, key } = await getPresignedUrl();

    if (!presignedUrl || !key) {
      toast.add({
        ...toastCustom.error,
        title: 'Oops',
        description: 'Something wrong',
      });
      return;
    }

    keys.push(key);

    const promise = useFetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileImages.value[i].type,
      },
      body: fileImages.value[i],
    });

    promisesUploadImages.push(promise);
  }

  await Promise.all(promisesUploadImages);

  try {
    await createProduct({
      ...dataSubmit,
      images: keys.map((key, index) => ({ relative_url: key, rank: index + 1 })),
      is_digital: !!dataSubmit.is_digital,
    });
    toast.add({
      ...toastCustom.success,
      title: 'Create product success',
    });
    await router.push(ROUTES.ACCOUNT + ROUTES.SHOP + ROUTES.PRODUCTS);
  }
  catch (error) {
    toast.add({
      ...toastCustom.error,
      title: 'Create product failed',
    });
  }
}

function onErrorFrom(event: FormErrorEvent) {
  event.errors.sort((a, b) => {
    const sortingArr = ['description', 'title'];
    return sortingArr.indexOf(b.path) - sortingArr.indexOf(a.path);
  });
  const element = document.getElementById(event.errors[0].id);
  element?.focus();
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

watch(() => state.category, () => {
  state.attributes = [];
});

watchDebounced(
  () => [state, fileImages.value],
  () => {
    const result = createProductSchema
      .omit({
        variants: true,
        images: true,
        shipping: true,
        price: isVariantProduct.value || undefined,
        stock: isVariantProduct.value || undefined,
        sku: isVariantProduct.value || undefined,
      }).safeParse(state);
    const conditions = [result.success, fileImages.value.length > 0, state.shipping];
    enabledButtonSubmit.value = conditions.every(Boolean);
  },
  { debounce: 500, maxWait: 1000, deep: true }
);

watch(isVariantProduct, () => {
  if (isVariantProduct.value) {
    formRef.value.clear('price');
    formRef.value.clear('stock');
    state.price = undefined;
    state.stock = 1;
  }
  state.variant_type = isVariantProduct.value ?
    PRODUCT_VARIANT_TYPES.SINGLE :
    PRODUCT_VARIANT_TYPES.NONE;
});

watch(() => [state.stock, state.price], () => {
  if (state.price && state.price > PRODUCT_CONFIG.MAX_PRICE) {
    state.price = PRODUCT_CONFIG.MAX_PRICE;
  }
  if (state.stock && state.stock > PRODUCT_CONFIG.MAX_STOCK) {
    state.stock = PRODUCT_CONFIG.MAX_STOCK;
  }
  if (!state.stock) {
    state.stock = 0;
  }
});
</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :validate="validateForm"
    :state="state"
    class="space-y-7"
    @error="onErrorFrom"
    @submit="onSubmit"
  >
    <WrapperFormGroupCard>
      <template #title>
        Basic info
      </template>
      <template #content>
        <CreateProductImagesInput
          v-model="fileImages"
          class="mb-4"
        />
        <UFormGroup
          label="Title"
          name="title"
          class="mb-4"
          description="Include keywords that buyers would use to search for your product."
          required
        >
          <UInput
            v-model="state.title"
            :disabled="loadingSubmit"
            size="lg"
            @keydown.space.prevent="false"
          />
        </UFormGroup>
        <UFormGroup
          label="Description"
          name="description"
          :help="state.description
            && `${state.description.length}/${PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION}`
          "
          required
        >
          <UTextarea
            v-model="state.description"
            autoresize
            :maxlength="PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION"
            :rows="5"
            :disabled="loadingSubmit"
            size="lg"
          />
        </UFormGroup>
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Details
      </template>
      <template #subtitle>
        Share a few more specifics about your product to make
        it easier to find in search, and to help buyers know what
        to expect.
      </template>
      <template #content>
        <div>
          <UFormGroup
            label="Type"
            name="is_digital"
            class="mb-4"
          >
            <div class="flex gap-16">
              <URadio
                v-for="type of isDigitalOpts"
                :key="type.value.toString()"
                v-model="state.is_digital"
                :disabled="loadingSubmit"
                v-bind="type"
              />
            </div>
          </UFormGroup>

          <div class="grid grid-cols-4">
            <UFormGroup
              label="Who made it?"
              name="who_made"
              required
              class="mb-4 max-w-[218px]"
            >
              <USelectMenu
                v-model="selectedWhoMade"
                size="lg"
                :disabled="loadingSubmit"
                :options="productWhoMadeOpts"
              />
            </UFormGroup>
            <!--          <UFormGroup -->
            <!--            v-if="selectedWhoMade.id === PRODUCT_WHO_MADE.SOMEONE_ELSE" -->
            <!--            class="mb-4" -->
            <!--            label="Brand" -->
            <!--            name="attributes.brand" -->
            <!--          > -->
            <!--            <UInput v-model="state.attributes.brand"
            :disabled="loadingSubmit" size="lg" /> -->
            <!--          </UFormGroup> -->
            <!--            <UFormGroup -->
            <!--              label="What is it?" -->
            <!--              name="description" -->
            <!--              class="mb-4" -->
            <!--            > -->
            <!--              <USelectMenu -->
            <!--                v-model="selected" -->
            <!--                size="lg" -->
            <!--                :options="productWhoMadeOpts" -->
            <!--              /> -->
            <!--            </UFormGroup> -->
            <!--            <UFormGroup -->
            <!--              label="When did you make it?" -->
            <!--              name="description" -->
            <!--              class="mb-4" -->
            <!--            > -->
            <!--              <USelectMenu -->
            <!--                v-model="selected" -->
            <!--                size="lg" -->
            <!--                :options="productWhoMadeOpts" -->
            <!--              /> -->
            <!--            </UFormGroup> -->
          </div>

          <UpdateCreateProductSearchCategoryInput
            v-model="state.category"
            :title="state.title"
          />

          <UpdateCreateProductSelectAttributesInput
            v-if="state.category"
            :key="state.category"
            v-model="state.attributes"
            :category-id="state.category"
          />

          <UpdateCreateProductTagsInput
            v-model="state.tags"
            :count-validate="countValidate"
          />
        </div>
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Shipping
      </template>
      <template #subtitle>
        Give shoppers clear expectations about delivery time and cost by
        making sure your shipping info is accurate,
        including the shipping profile and your order processing schedule.
      </template>
      <template #content>
        <div>
          <UFormGroup
            class="mb-4"
            label="Shipping option"
            name="shipping"
            required
          >
            <div class="flex items-center gap-3">
              <div
                v-if="state.shipping"
                class="text-gray-600"
              >
                {{ state.shipping.process_time }} processing time, from {{ state.shipping.zip }}
              </div>
              <UButton
                color="gray"
                variant="solid"
                @click="showCreateShippingProductDialog"
              >
                {{ state.shipping ? 'Edit' : 'Add' }} shipping
              </UButton>
            </div>
          </UFormGroup>
        </div>
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Inventory and pricing
      </template>
      <template #content>
        <div>
          <UButton
            class="mb-4"
            color="gray"
            variant="solid"
            @click="() => isVariantProduct = !isVariantProduct"
          >
            {{ !isVariantProduct ? 'Add variantions' : 'Remove variantions' }}
          </UButton>
          <CreateProductVariantInput
            v-if="isVariantProduct"
            :count-validate="countValidate"
            @on-change="onChangeVariants"
          />

          <div
            v-else
            class="max-w-[40%]"
          >
            <UFormGroup
              class="mb-4"
              label="Price"
              name="price"
              required
            >
              <UInput
                v-model.number="state.price"
                v-max-number="PRODUCT_CONFIG.MAX_PRICE"
                v-numeric
                :disabled="loadingSubmit"
                size="lg"
                type="number"
                class="w-1/2"
              >
                <template #trailing>
                  <span class="text-xs text-gray-500">USD</span>
                </template>
              </UInput>
            </UFormGroup>
            <UFormGroup
              class="mb-4"
              label="Stock"
              name="stock"
              required
            >
              <UInput
                v-model.number="state.stock"
                v-max-number="PRODUCT_CONFIG.MAX_STOCK"
                v-numeric
                :disabled="loadingSubmit"
                size="lg"
                type="number"
                class="w-1/2"
              />
            </UFormGroup>
            <UFormGroup
              description="SKUs are for your use only—buyers won’t see them."
              class="mb-4"
              label="SKU"
              name="sku"
            >
              <UInput
                v-model="state.sku"
                v-uppercase
                v-alphanumeric
                :maxlength="PRODUCT_CONFIG.MAX_CHAR_SKU"
                :disabled="loadingSubmit"
                size="lg"
                :ui="{ base: 'uppercase' }"
                class="w-1/2"
              />
            </UFormGroup>
          </div>
        </div>
      </template>
    </WrapperFormGroupCard>

    <button
      ref="btnSubmitRef"
      type="submit"
      class="hidden"
    />
  </UForm>

  <div class="fixed-actions-form">
    <UButton
      :disabled="loadingSubmit"
      size="md"
      color="gray"
      :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.PRODUCTS}`"
    >
      Cancel
    </UButton>
    <UButton
      :disabled="!enabledButtonSubmit"
      :loading="isPendingCreateProduct"
      size="md"
      type="submit"
      variant="soft"
      @click="() => {
        btnSubmitRef.click();
        isDraftProduct = true
      }"
    >
      Save
    </UButton>
    <UButton
      :disabled="!enabledButtonSubmit"
      :loading="isPendingCreateProduct"
      size="md"
      type="submit"
      @click="() => btnSubmitRef.click()"
    >
      Save & Display
    </UButton>
  </div>
</template>

<style scoped>
@import url("~/assets/css/layout-shop.css");
</style>
