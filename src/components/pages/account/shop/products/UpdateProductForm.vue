<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import { updateProductSchema } from '~/schemas/request/shop-product.schema';
import {
  PRODUCT_VARIANT_TYPES, PRODUCT_CONFIG,
  productWhoMadeOpts
} from '~/config/enums/product';
import { ROUTES } from '~/config/enums/routes';
import type {
  Product,
  ProductImage, ProductSingleVariant, ProductCombineVariant
} from '~/types/product';
import { toastCustom } from '~/config/toast';
import { useGetPresignedUrl } from '~/services/upload';
import { useShopGetDetailProduct, useShopUpdateProduct } from '~/services/shop';
import type {
  NoneVariant,
  RequestUpdateProductBody,
  ResponseShopGetDetailProduct,
  UpdateProductBody
} from '~/types/request-api/shop-product';
import type { NoUndefinedField } from '~/types/utils';

export type IOnChangeUpdateVariants = Partial<Pick<UpdateProductBody,
  'update_variants' | 'variant_inventories' |
  'new_single_variants' | 'variant_type' | 'new_combine_variants'
>> & (Omit<ProductSingleVariant, 'variants'> | Omit<ProductCombineVariant, 'variants'>) | null;

const route = useRoute();
const toast = useToast();
const queryClient = useQueryClient();

const productId = route.params.id as Product['id'];

const {
  data: dataDetailProduct,
} = useShopGetDetailProduct(productId);

const {
  mutateAsync: getPresignedUrl,
} = useGetPresignedUrl();

const {
  mutateAsync: updateProduct,
} = useShopUpdateProduct();

const noneVariant = reactive<Partial<NoneVariant>>({
  variant_type: PRODUCT_VARIANT_TYPES.NONE,
});

const stateSubmit = reactive<UpdateProductBody>({});

const formRef = ref();
const loadingSubmit = ref(false);
const isVariantProduct = computed(() => stateSubmit.variant_type !== PRODUCT_VARIANT_TYPES.NONE);
const btnSubmit = ref();
const disabledButtonSubmit = ref(true);
const isVariantInputValid = ref(true);
const countValidate = ref(0);
const countValidateInputs = ref(0);
const countValidateVariantsInputs = ref(0);

const fileImages = ref<File[]>([]);
const idsImageForDelete = ref<Pick<ProductImage, 'id'>[]>([]);
const images = ref<NonNullable<RequestUpdateProductBody['images']>>([]);

const cacheAttrsSubmit = ref();

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

const onChangeVariantType = () => {
  isVariantProduct.value = !isVariantProduct.value;
  stateSubmit.variant_type = isVariantProduct.value ? PRODUCT_VARIANT_TYPES.SINGLE : PRODUCT_VARIANT_TYPES.NONE;
};

const validateForm = (values: UpdateProductBody): FormError[] => {
  let errors: FormError[] = [];
  countValidate.value++;

  const result = updateProductSchema
    .omit({
      // price: isVariantProduct.value || undefined,
      // stock: isVariantProduct.value || undefined,
      // sku: isVariantProduct.value || undefined,
      // variant_group_name: true,
      // variant_sub_group_name: true,
    })
    // .optional()
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

async function uploadImage() {
  if (fileImages.value.length === 0) return;

  const keys = [];
  const uploadImagesPromises = [];

  for (let i = 0; i < fileImages.value.length; i++) {
    const { presigned_url, key } = await getPresignedUrl();
    if (!presigned_url || !key) {
      toast.add({
        ...toastCustom.error,
        title: 'Oops',
        description: 'Something wrong',
      });
      throw new Error();
    }

    keys.push(key);

    const promise = useFetch(presigned_url, {
      method: 'PUT',
      headers: {
        'Content-Type': fileImages.value[i].type,
      },
      body: fileImages.value[i],
    });
    uploadImagesPromises.push(promise);
  }
  await Promise.all(uploadImagesPromises);

  const relative_urls = keys.map(key => ({ relative_url: key }));
  return relative_urls;
}

async function onSubmit(event: FormSubmitEvent<UpdateProductBody>) {
  if (isVariantProduct.value && !isVariantInputValid.value) return;

  let dataSubmit = { ...event.data };

  // const exceptKeys = ['id', 'variant_type', 'attributes', 'tags'];
  // const exceptKeys = ['id', 'variant_type'];
  // const exceptKeys = ['id'];
  // console.log('event-data-temp', dataSubmit);
  // console.log('data-detail-product-value-product', dataDetailProduct.value?.product);

  Object.keys(dataSubmit).forEach((key) => {
    if (
      dataDetailProduct.value &&
      JSON.stringify(dataSubmit[key]) === JSON.stringify(dataDetailProduct.value.product[key])
      // !exceptKeys.includes(key)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete dataSubmit[key];
    }
  });

  if (dataSubmit.category_id === dataDetailProduct.value?.product.category.id) {
    delete dataSubmit.category_id;
  }

  // if (!dataSubmit.images || dataSubmit.images.length === 0) {
  //   delete dataSubmit.images;
  // }

  if (dataDetailProduct.value?.product.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
    const inventory = dataDetailProduct.value.product.inventory;
    const tempNoneVariant = { ...noneVariant };
    Object.keys(tempNoneVariant).forEach((key) => {
      if (tempNoneVariant[key] === inventory[key]) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete tempNoneVariant[key];
      }
    });
    if (Object.keys(tempNoneVariant).length > 1) {
      dataSubmit = {
        ...dataSubmit,
        ...tempNoneVariant,
      };
    }
  }

  loadingSubmit.value = true;

  // if (idsImageForDelete.value && idsImageForDelete.value.length > 0) {
  // const idsImages = idsImageForDelete.value.map(id => ({ id }));
  // dataSubmit.images = [...idsImages];
  // images = [...idsImageForDelete.value];
  // }


  try {
    if (fileImages.value.length > 0) {
      const relative_urls = await uploadImage();
      images.value = [...images.value, ...relative_urls || []];
    }

    await updateProduct({
      ...dataSubmit,
      images: images.value,
      id: productId,
    });

    if (dataSubmit.attributes) {
      cacheAttrsSubmit.value = dataSubmit.attributes;
    }

    // queryClient.removeQueries({
    //   queryKey: ['shop-get-detail-product', productId],
    // });

    queryClient.setQueryData<ResponseShopGetDetailProduct>(['shop-get-detail-product', productId], (oldData) => {
      if (!oldData) return oldData;
      const dataNoUndefinedField = dataSubmit as NoUndefinedField<UpdateProductBody>;
      return {
        ...oldData,
        product: {
          ...oldData.product,
          ...pick(dataNoUndefinedField, ['title', 'description', 'is_digital', 'who_made', 'tags']),
          // attributes: dataSubmit.attributes ? dataSubmit.attributes.map(({attribute_id, selected}) => ({ attribute: attribute_id, selected})) : oldData.product.attributes,
        },
      };
    });
    toast.add({
      ...toastCustom.success,
      title: 'Update product success',
    });
    // Object.assign(prevStateSubmit, dataSubmit);
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

// init data
watch(() => dataDetailProduct.value, () => {
  const detailProduct = dataDetailProduct.value?.product;
  if (detailProduct) {
    const base = pick(detailProduct, ['title', 'description', 'is_digital', 'who_made', 'tags', 'variant_type']);
    Object.keys(base).forEach((key) => {
      stateSubmit[key] = base[key];
    });
    stateSubmit.category_id = detailProduct.category.id;

    if (detailProduct.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
      noneVariant.price = detailProduct.inventory.price;
      noneVariant.stock = detailProduct.inventory.stock;
      noneVariant.sku = detailProduct.inventory.sku;
    }
  }
}, { immediate: true });

watch(() => stateSubmit.category_id, () => {
  stateSubmit.attributes = [];
});

watchDebounced(
  () => [stateSubmit, fileImages.value, idsImageForDelete.value, countValidateVariantsInputs.value],
  () => {
    countValidateInputs.value++;

    const result = updateProductSchema
      .omit({
        // variant_group_name: true,
        // variant_sub_group_name: true,
        // price: isVariantProduct.value || undefined,
        // stock: isVariantProduct.value || undefined,
        // sku: isVariantProduct.value || undefined,
      }).safeParse(stateSubmit);

    const isEmptyImages = idsImageForDelete.value.length === dataDetailProduct.value?.product.images.length &&
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
          v-model:new-file-images="fileImages"
          v-model:ids-image-delete="images"
          class="mb-4"
          :images="dataDetailProduct?.product.images"
          :loading="loadingSubmit"
          :count-validate="countValidate"
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
        <!--        <UFormGroup -->
        <!--          label="Type" -->
        <!--          name="is_digital" -->
        <!--          class="mb-4" -->
        <!--        > -->
        <!--          <div class="flex gap-16"> -->
        <!--            <URadio -->
        <!--              v-for="options of isDigitalOpts" -->
        <!--              :key="options.value.toString()" -->
        <!--              v-model="stateSubmit.is_digital" -->
        <!--              v-bind="options" -->
        <!--            /> -->
        <!--          </div> -->
        <!--        </UFormGroup> -->

        <div class="grid grid-cols-4 gap-4">
          <UFormGroup
            label="Who made it?"
            name="who_made"
            class="mb-4"
            required
          >
            <USelectMenu
              v-model="stateSubmit.who_made"
              size="lg"
              :options="productWhoMadeOpts"
              value-attribute="id"
            />
          </UFormGroup>
        </div>

        {{ stateSubmit.category_id }}

        <UpdateCreateProductSearchCategoryInput
          v-model="stateSubmit.category_id"
          :category="dataDetailProduct?.product.category"
          :title="stateSubmit.title"
        />

        <UpdateCreateProductSelectAttributesInput
          :key="stateSubmit.category_id"
          v-model="stateSubmit.attributes"
          :category-id="stateSubmit.category_id || dataDetailProduct?.product.category.id"
          :attributes-selected="dataDetailProduct?.product.attributes"
        />

        <UpdateCreateProductTagsInput v-model="stateSubmit.tags" />
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
          <UpdateCreateProductNoneVariantInput
            v-else
            v-model:none-variant="noneVariant"
            class="max-w-[40%]"
          />
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
    <!--      :disabled="loadingSubmit || disabledButtonSubmit" -->
    <UButton
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
