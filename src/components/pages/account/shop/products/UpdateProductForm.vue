<script setup lang="ts">
import type { ComputedRef } from 'vue';
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import { updateProductSchema } from '~/schemas/product.schema';
import {
  PRODUCT_VARIANT_TYPES, PRODUCT_CONFIG,
  productWhoMadeOpts, isDigitalOpts
} from '~/config/enums/product';
import { ROUTES } from '~/config/enums/routes';
import type {
  UpdateProductBody,
  Product,
  ProductImage, ProductSingleVariant, ProductCombineVariant
} from '~/types/product';
import type { Override } from '~/types/utils';
import { toastCustom } from '~/config/toast';
import { useGetPresignedUrl } from '~/services/upload';
import { useShopGetDetailProduct, useShopUpdateProduct } from '~/services/shop';

type UpdateProductBodyOverride = Override<UpdateProductBody, {
  who_made: ComputedRef<UpdateProductBody['who_made']>
}>;

export type IOnChangeUpdateVariants = Partial<Pick<UpdateProductBody,
  'update_variants' | 'variant_inventories' |
  'new_single_variants' | 'variant_type' | 'new_combine_variants'
>> & (Omit<ProductSingleVariant, 'variants'> | Omit<ProductCombineVariant, 'variants'>) | null;

export type IOnChangeUpdateImages = {
  fileImages: File[]
  idsImagesForDelete: ProductImage['id'][]
};

const route = useRoute();
const toast = useToast();
const queryClient = useQueryClient();

const selectedWhoMade = ref(productWhoMadeOpts[0]);

const productId = route.params.id as Product['id'];

const {
  data: dataDetailProduct,
} = useShopGetDetailProduct(productId, {
  onResponse: ({ response }) => {
    const detailProduct = response._data.product;
    if (detailProduct) {
      const option = productWhoMadeOpts.find(opt => opt.id === detailProduct.who_made);
      if (option) {
        selectedWhoMade.value = option;
      }
      if (detailProduct.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
        stateSubmit.price = detailProduct.inventory.price;
        stateSubmit.stock = detailProduct.inventory.stock;
        stateSubmit.sku = detailProduct.inventory.sku;
      }
    }
  },
});

const {
  mutateAsync: getPresignedUrl,
} = useGetPresignedUrl();

const {
  mutateAsync: updateProduct,
} = useShopUpdateProduct();

const product = computed(() => {
  const detailProduct = dataDetailProduct.value?.product;
  if (detailProduct) {
    if (detailProduct.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
      return omitFieldsObject(detailProduct, ['category', 'attributes', 'inventory']);
    }
    else {
      return omitFieldsObject(detailProduct, ['category', 'attributes', 'variants']);
    }
  }
  return {};
});

const stateSubmit = reactive<UpdateProductBodyOverride>({
  ...product.value,
  who_made: computed(() => selectedWhoMade.value.id),
  images: [],
});

const fileImages = ref<File[]>([]);
const formRef = ref();
const loadingSubmit = ref(false);
const isVariantProduct = ref(stateSubmit.variant_type !== PRODUCT_VARIANT_TYPES.NONE);
const btnSubmit = ref();
const countValidate = ref(0);
const countValidateInputs = ref(0);
const idsImagesForDelete = ref<ProductImage['id'][]>([]);
const disabledButtonSubmit = ref(true);
const isVariantInputValid = ref(true);
const countValidateVariantsInputs = ref(0);

const onChangeVariants = (values: IOnChangeUpdateVariants) => {
  isVariantInputValid.value = Boolean(values);
  if (!values) return;

  Object.keys(values).forEach((key) => {
    if (!values[key]) {
      return;
    }
    if (Array.isArray(values[key]) && values[key].length === 0) {
      return;
    }
    stateSubmit[key] = values[key];
  });
};

const onChangeImages = (values: IOnChangeUpdateImages) => {
  fileImages.value = values.fileImages;
  idsImagesForDelete.value = values.idsImagesForDelete;
};

const onChangeVariantType = () => {
  isVariantProduct.value = !isVariantProduct.value;
  stateSubmit.variant_type = isVariantProduct.value ? PRODUCT_VARIANT_TYPES.SINGLE : PRODUCT_VARIANT_TYPES.NONE;
};

const validateForm = (values: UpdateProductBody): FormError[] => {
  let errors: FormError[] = [];
  countValidate.value++;

  const result = updateProductSchema
    .omit({
      variants: true,
      images: true,
      price: isVariantProduct.value || undefined,
      stock: isVariantProduct.value || undefined,
      sku: isVariantProduct.value || undefined,
      variant_group_name: true,
      variant_sub_group_name: true,
    })
    .optional()
    .safeParse(values);

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

async function onSubmit(event: FormSubmitEvent<UpdateProductBody>) {
  if (isVariantProduct.value && !isVariantInputValid.value) return;

  const eventDataTemp = { ...event.data };

  const exceptKeys = ['id', 'variant_type', 'attributes', 'tags'];

  Object.keys(eventDataTemp).forEach((key) => {
    if (
      dataDetailProduct.value &&
      eventDataTemp[key] === dataDetailProduct.value.product[key] &&
      !exceptKeys.includes(key)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete eventDataTemp[key];
    }
  });

  loadingSubmit.value = true;

  if (eventDataTemp.images) {
    if (idsImagesForDelete.value && idsImagesForDelete.value.length > 0) {
      const idsImages = idsImagesForDelete.value.map(id => ({ id }));
      eventDataTemp.images = [...idsImages];
    }

    if (fileImages.value && fileImages.value?.length > 0) {
      const keys = [];
      const promisesUploadImages = [];
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

      const relative_urls = keys.map(key => ({ relative_url: key }));
      eventDataTemp.images = [...eventDataTemp.images, ...relative_urls];
    }
  }

  if (!eventDataTemp.images || eventDataTemp.images.length === 0) {
    delete eventDataTemp.images;
  }

  try {
    await updateProduct(eventDataTemp);
    queryClient.removeQueries({
      queryKey: ['shop-get-detail-product', productId],
    });
    toast.add({
      ...toastCustom.success,
      title: 'Update product success',
    });
  }
  catch (error) {
    toast.add({
      ...toastCustom.error,
      title: 'Update product failed',
    });
  }
  loadingSubmit.value = false;
}

function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id);
  element?.focus();
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

watch(() => stateSubmit.category, () => {
  stateSubmit.attributes = [];
});

watch(() => [stateSubmit.stock, stateSubmit.price], () => {
  if (stateSubmit.price && stateSubmit.price > PRODUCT_CONFIG.MAX_PRICE) {
    stateSubmit.price = PRODUCT_CONFIG.MAX_PRICE;
  }
  if (stateSubmit.stock && stateSubmit.stock > PRODUCT_CONFIG.MAX_STOCK) {
    stateSubmit.stock = PRODUCT_CONFIG.MAX_STOCK;
  }
  if (!stateSubmit.stock) {
    stateSubmit.stock = 0;
  }
});

watchDebounced(
  () => [stateSubmit, fileImages.value, idsImagesForDelete.value, countValidateVariantsInputs.value],
  () => {
    countValidateInputs.value++;

    const result = updateProductSchema
      .omit({
        variants: true,
        images: true,
        variant_group_name: true,
        variant_sub_group_name: true,
        price: isVariantProduct.value || undefined,
        stock: isVariantProduct.value || undefined,
        sku: isVariantProduct.value || undefined,
      }).safeParse(stateSubmit);

    const isEmptyImages = idsImagesForDelete.value.length === dataDetailProduct.value?.product.images.length &&
      fileImages.value.length === 0;

    disabledButtonSubmit.value = countValidateInputs.value === 1 ||
    !result.success ||
    isEmptyImages ||
    countValidateVariantsInputs.value === 1;
  },
  { debounce: 500, maxWait: 1000, deep: true }
);
</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :validate="validateForm"
    :state="stateSubmit"
    class="space-y-7"
    @error="onError"
    @submit="onSubmit"
  >
    <WrapperFormGroupCard>
      <template #title>
        Basic info
      </template>
      <template #content>
        <UpdateProductImagesInput
          class="mb-4"
          :images="dataDetailProduct?.product.images"
          :loading="loadingSubmit"
          :count-validate="countValidate"
          @on-change="onChangeImages"
        />
        <UFormGroup
          label="Title"
          name="title"
          class="mb-4"
          description="Include keywords that buyers would use to search for your product."
          required
        >
          <UInput
            v-model="stateSubmit.title"
            :disabled="loadingSubmit"
            size="lg"
          />
        </UFormGroup>
        <UFormGroup
          label="Description"
          name="description"
          :help="stateSubmit.description
            && `${stateSubmit.description.length}/${PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION}`
          "
          required
        >
          <UTextarea
            v-model="stateSubmit.description"
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
        <UFormGroup
          label="Type"
          name="is_digital"
          class="mb-4"
        >
          <div class="flex gap-16">
            <URadio
              v-for="options of isDigitalOpts"
              :key="options.value.toString()"
              v-model="stateSubmit.is_digital"
              v-bind="options"
            />
          </div>
        </UFormGroup>

        <div class="grid grid-cols-4 gap-4">
          <UFormGroup
            label="Who made it?"
            name="who_made"
            class="mb-4"
            required
          >
            <USelectMenu
              v-model="selectedWhoMade"
              size="lg"
              :options="productWhoMadeOpts"
            />
          </UFormGroup>
        </div>

        <UpdateCreateProductSearchCategoryInput
          v-model="stateSubmit.category"
          :category="dataDetailProduct?.product.category"
          :title="stateSubmit.title"
        />

        <UpdateCreateProductSelectAttributesInput
          :key="stateSubmit.category"
          v-model="stateSubmit.attributes"
          :category-id="stateSubmit.category || dataDetailProduct?.product.category.id"
          :attributes-selected="dataDetailProduct?.product.attributes"
        />

        <UpdateCreateProductTagsInput
          v-if="stateSubmit.tags"
          v-model="stateSubmit.tags"
          :count-validate="countValidate"
        />
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Inventory and pricing
      </template>
      <template #content>
        <div class="">
          <UButton
            class="mb-4"
            color="gray"
            variant="solid"
            @click="onChangeVariantType"
          >
            {{ !isVariantProduct ? 'Add variations' : 'Remove variations' }}
          </UButton>

          <UpdateProductVariantInput
            v-if="isVariantProduct && dataDetailProduct"
            :product="dataDetailProduct.product"
            :count-validate="countValidate"
            @on-change="onChangeVariants"
            @is-variants-updated="(count) => countValidateVariantsInputs = count"
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
                v-model.number="stateSubmit.price"
                v-max-number="PRODUCT_CONFIG.MAX_PRICE"
                v-numeric
                :disabled="loadingSubmit"
                size="lg"
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
                v-model.number="stateSubmit.stock"
                v-max-number="PRODUCT_CONFIG.MAX_STOCK"
                v-numeric
                :disabled="loadingSubmit"
                size="lg"
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
                v-model="stateSubmit.sku"
                v-alphanumeric
                v-uppercase
                :maxlength="PRODUCT_CONFIG.MAX_CHAR_SKU"
                :disabled="loadingSubmit"
                size="lg"
                class="w-1/2"
              />
            </UFormGroup>
          </div>
        </div>
      </template>
    </WrapperFormGroupCard>

    <button
      ref="btnSubmit"
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
      :disabled="loadingSubmit || disabledButtonSubmit"
      :loading="loadingSubmit"
      size="md"
      type="submit"
      @click="() => btnSubmit.click()"
    >
      Update
    </UButton>
  </div>
</template>

<style scoped>
@import url("~/assets/css/layout-shop.css");
</style>
