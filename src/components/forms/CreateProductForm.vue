<script setup lang="ts">
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import { productSchema } from '~/schemas/product.schema';
import {
  PRODUCT_CONFIG,
  PRODUCT_CATEGORIES,
  PRODUCT_WHO_MADE,
  PRODUCT_STATES,
  PRODUCT_ATTR_COLORS
} from '~/config/enums/product';
import type { CreateProductPayload } from '~/interfaces/product';

const { $api } = useNuxtApp();
const router = useRouter();
const toast = useToast();

const fileImages = ref<File[]>();
const formRef = ref();
const isDraftProd = ref(false);
const loading = ref(false);
const errorImageField = ref(false);
const btnSubmit = ref();

const state = reactive<CreateProductPayload>({
  title: '',
  description: '',
  who_made: PRODUCT_WHO_MADE.I_DID,
  is_digital: false,
  state: PRODUCT_STATES.ACTIVE,
  attributes: {
    colors: [],
  },
  price: 0,
  quantity: 1,
  sku: '',
});

const productWhoMadeOpts = [
  {
    id: PRODUCT_WHO_MADE.I_DID,
    label: 'I did',
  },
  {
    id: PRODUCT_WHO_MADE.COLLECTIVE,
    label: 'Collective',
  },
  {
    id: PRODUCT_WHO_MADE.SOMEONE_ELSE,
    label: 'Someone else',
  },
];

const selectedWhoMade = ref(productWhoMadeOpts[0]);

const isDigitalOpts = [
  { value: false, label: 'Physical', help: 'A tangible item that you will ship to buyers.' },
  { value: true, label: 'Digital', help: 'A digital file that buyers will download.' },
];

const productCategoryOpts = Object.values(PRODUCT_CATEGORIES);
const productAttrColorsOpts = mapKeysEnum(PRODUCT_ATTR_COLORS);

const validate = (state: CreateProductPayload): FormError[] => {
  let errors: FormError[] = [];

  const data = {
    ...state,
    images: fileImages.value && fileImages.value.length > 0 ? [{ relative_url: 'shop' }] : [],
    is_digital: !!state.is_digital,
  };
  if (data?.attributes) {
    data.attributes.category = state.category;
    data.attributes.colors = state.attributes.colors;
  }

  const result = productSchema.omit({
    id: true,
    shop_id: true,
    views: true,
    rating_average: true,
  }).safeParse(data);

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

async function onSubmit(event: FormSubmitEvent<CreateProductPayload>) {
  if (isDraftProd.value) {
    event.data.state = PRODUCT_STATES.DRAFT;
  }

  formRef.value.clear();
  errorImageField.value = false;
  loading.value = true;

  if (!fileImages.value) {
    return;
  }
  const promises = [];
  const keys = [];
  for (let i = 0; i < fileImages.value.length; i++) {
    const { data } = await $api.upload.getPresignedUrl();
    if (!data.value) {
      return;
    }
    const presignedUrl = data.value.presignedUrl;
    if (!presignedUrl) {
      toast.add({ title: 'Something wrong' });
      return;
    }
    keys.push(data.value.key);
    const promise = useFetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileImages.value[i].type,
      },
      body: fileImages.value[i],
    });
    promises.push(promise);
  }
  await Promise.all(promises);

  delete event.data.category;
  const { error } = await $api.product.createProduct({
    ...event.data,
    images: keys.map(key => ({ relative_url: key })),
    is_digital: !!event.data.is_digital,
  });
  loading.value = false;
  if (!error.value) {
    router.back();
    toast.add({ title: 'Create product success' });
  } else {
    toast.add({ title: 'Create product failed' });
  }
}

function onError(event: FormErrorEvent) {
  errorImageField.value = event.errors.some(item => item.path === 'images');

  const element = document.getElementById(event.errors[0].id);
  element?.focus();
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const onChangeAttributes = (values: any) => {
  state.attributes = { ...state.attributes, ...values };
};

const onChangeImages = (values: File[]) => {
  fileImages.value = values;
};

watch(() => state.category, () => {
  state.attributes = {
    colors: [],
  };
});

</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :validate="validate"
    :state="state"
    class="space-y-7"
    @error="onError"
    @submit="onSubmit"
  >
    <CreateProductCard>
      <template #title>
        Basic info
      </template>
      <template #content>
        <UFormGroup
          label="Title"
          name="title"
          class="mb-4"
          description="Include keywords that buyers would use to search for your item."
          required
        >
          <UInput v-model="state.title" :disabled="loading" size="lg" />
        </UFormGroup>
        <UFormGroup
          label="Description"
          name="description"
          class="mb-4"
          :help="
            state.description &&
              `${state.description.length}/${PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION}`
          "
          required
        >
          <UTextarea
            v-model="state.description"
            autoresize
            :maxlength="PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION"
            :rows="5"
            :disabled="loading"
            size="lg"
          />
        </UFormGroup>
        <ProductImagesForm
          :error-image-field="errorImageField"
          @on-change-images="onChangeImages"
        />
      </template>
    </CreateProductCard>

    <CreateProductCard>
      <template #title>
        Details
      </template>
      <template #subtitle>
        Share a few more specifics about your item to make
        it easier to find in search, and to help buyers know what
        to expect.
      </template>
      <template #content>
        <UFormGroup label="Type" name="is_digital" class="mb-4">
          <div class="flex gap-16">
            <URadio
              v-for="type of isDigitalOpts"
              :key="type.value.toString()"
              v-model="state.is_digital"
              v-bind="type"
            />
          </div>
        </UFormGroup>

        <div class="grid grid-cols-4 gap-4">
          <UFormGroup label="Who made it?" name="who_made" class="mb-4">
            <USelectMenu v-model="selectedWhoMade" size="lg" :options="productWhoMadeOpts" />
          </UFormGroup>
          <!--            <UFormGroup-->
          <!--              label="What is it?"-->
          <!--              name="description"-->
          <!--              class="mb-4"-->
          <!--            >-->
          <!--              <USelectMenu-->
          <!--                v-model="selected"-->
          <!--                size="lg"-->
          <!--                :options="productWhoMadeOpts"-->
          <!--              />-->
          <!--            </UFormGroup>-->
          <!--            <UFormGroup-->
          <!--              label="When did you make it?"-->
          <!--              name="description"-->
          <!--              class="mb-4"-->
          <!--            >-->
          <!--              <USelectMenu-->
          <!--                v-model="selected"-->
          <!--                size="lg"-->
          <!--                :options="productWhoMadeOpts"-->
          <!--              />-->
          <!--            </UFormGroup>-->
        </div>

        <UFormGroup label="Category" name="category" class="mb-4" required>
          <USelectMenu
            v-model="state.category"
            clear-search-on-close
            class="w-full lg:w-40"
            placeholder="Select a category"
            searchable
            searchable-placeholder="Search a category..."
            :options="productCategoryOpts"
            size="lg"
            :ui-menu="{
              option: {
                base: 'capitalize'
              }
            }"
          />
        </UFormGroup>

        <div v-if="state.category">
          <UFormGroup
            label="Color"
            name="colors"
            class="mb-4"
            description="Add up to 3 colors."
            required
          >
            <USelectMenu
              v-model="state.attributes.colors"
              searchable
              multiple
              class="w-full lg:w-40"
              placeholder="Select a colors"
              :options="productAttrColorsOpts"
              size="lg"
            />
          </UFormGroup>

          <ProductCategoryElectronicForm
            v-if="state.category.toLowerCase() === PRODUCT_CATEGORIES.ELECTRONIC"
            @on-change-attributes="onChangeAttributes"
          />
          <ProductCategoryClothingForm
            v-if="state.category.toLowerCase() === PRODUCT_CATEGORIES.CLOTHING"
            @on-change-attributes="onChangeAttributes"
          />
        </div>
      </template>
    </CreateProductCard>

    <CreateProductCard>
      <template #title>
        Inventory and pricing
      </template>
      <template #content>
        <div class="">
          <UFormGroup
            description="Remember to factor in the costs of
              materials, labor, and other business expenses.
              If you offer free shipping,
              make sure to include the cost of shipping so it doesn't eat into your profits."
            class="mb-4"
            label="Price"
            name="price"
            required
          >
            <UInput v-model="state.price" :disabled="loading" size="lg" type="number" />
          </UFormGroup>
          <UFormGroup class="mb-4" label="Quantity" name="quantity" required>
            <UInput v-model="state.quantity" :disabled="loading" size="lg" />
          </UFormGroup>
          <UFormGroup
            description="SKUs are for your use only—buyers won’t see them."
            class="mb-4"
            label="SKU"
            name="sku"
          >
            <UInput v-model="state.sku" :disabled="loading" size="lg" />
          </UFormGroup>
        </div>
      </template>
    </CreateProductCard>

    <button ref="btnSubmit" type="submit" class="hidden" />
  </UForm>

  <div
    class="flex justify-end items-center gap-2
       fixed bottom-0 bg-white w-full left-0 pr-8 py-2.5 border-t"
  >
    <UButton
      :disabled="loading"
      size="md"
      type="submit"
      variant="outline"
      @click="() => {
        btnSubmit.click();
        isDraftProd = true
      }"
    >
      Save
    </UButton>
    <UButton
      :disabled="loading"
      size="md"
      type="submit"
      @click="() => btnSubmit.click()"
    >
      Save & Display
    </UButton>
  </div>
</template>
