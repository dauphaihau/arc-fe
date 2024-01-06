<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
// import { productSchema } from '../../schemas/product.schema';
import {
  productAttrColors,
  productCategories,
  PRODUCT_CONFIG,
  PRODUCT_CATEGORIES,
  PRODUCT_WHO_MADE
} from '~/config/enums/product';
import type { CreateProductPayload } from '~/interfaces/product';

const { $api } = useNuxtApp();
const router = useRouter();
const toast = useToast();

const formRef = ref();
const unknownErrorMsg = ref('');
const loading = ref(false);

const state = reactive({
  title: '',
  description: '',
  price: 0,
  quantity: 1,
  sku: '',
  who_made: PRODUCT_WHO_MADE.I_DID,
  category: '',
  is_digital: 0,
  attributes: {
    color: '',
    size: '',
    gender: '',
  },
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

const types = [
  { value: 0, label: 'Physical', help: 'A tangible item that you will ship to buyers.' },
  { value: 1, label: 'Digital', help: 'A digital file that buyers will download.' },
];

const fileInputRef = ref<HTMLInputElement | null>(null);
const fileImages = ref<File[]>([]);
const urlImages = ref<string[]>([]);

const onPickFile = () => {
  fileInputRef?.value?.click();
};

function onFilePicked(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = (target.files as FileList);
  // fileImages.value = files;
  // if (!files || !files.length) {
  //   return;
  // }
  for (let i = 0; i < files.length; i++) {
    fileImages.value.push(files[i]);
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      urlImages.value.push(reader.result as string);
    });
    reader.readAsDataURL(files[i]);
  }
}

const removeImage = (index: number) => {
  fileImages.value.splice(index, 1);
  urlImages.value.splice(index, 1);
};

const productCategoryOpts = productCategories;
const productColorsOpts = productAttrColors;

async function onSubmit(event: FormSubmitEvent<CreateProductPayload>) {
  formRef.value.clear();
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
  // await Promise.all(promises).then(res => console.log('res', res)).catch(err => console.log('promises reject'));
  // try {
  //   await Promise.all(promises);
  // } catch (error) {
  //   console.log('error', error);
  // }

  const { error } = await $api.product.createProduct({
    ...event.data,
    images: keys.map(key => ({ relative_url: key })),
    is_digital: !!event.data.is_digital,
  });
  loading.value = false;
  if (!error.value) {
    router.back();
    toast.add({ title: 'Create product success' });
  }
  // const errorMessage = await authStore.login(event.data);
  // if (errorMessage) {
  //   errorServerMsg.value = errorMessage;
  // }
}

const updateState = (values: object) => {
  state.attributes = { ...state.attributes, ...values };
};

</script>

<template>
  <div class="mt-4">
    <UAlert
      v-if="unknownErrorMsg"
      color="rose"
      variant="solid"
      :close-button="{
        icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link', padded: false,
      }"
      title=""
      :description="unknownErrorMsg"
      class="mb-4"
      @close="unknownErrorMsg = ''"
    />

    <UForm
      ref="formRef"
      :validate-on="['submit']"
      :state="state"
      class="space-y-7"
      @submit="onSubmit"
    >
      <!--      :schema="-->
      <!--        productSchema.omit({-->
      <!--          id: true,-->
      <!--          shop_id: true,-->
      <!--          views: true,-->
      <!--          rating_average: true-->
      <!--        })-->
      <!--      "-->


      <CreateProductCard>
        <template #title>
          Basic info
        </template>
        <template #subtitle>
          <!--          Add as many as you can so buyers can see every detail.-->
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
            :help="`${state.description.length}/${PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION}`"
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

          <UFormGroup label="Photos" name="photos" description="Add up to 10 photos." required>
            <div class="grid grid-cols-6 gap-3">
              <div v-for="(url, index) in urlImages" :key="url">
                <img :src="url" class="w-20 h-20" @click="removeImage(index)">
              </div>

              <UCard
                :ui="{
                  base: 'h-[152px] w-[152px]',
                  body: {
                    base: 'h-[152px] w-[152px] grid place-content-center text-center'
                  },
                }"
                @click="onPickFile"
              >
                <!--              @click="() => this.$refs.inputFile.reset()"-->
                <div class="grid place-content-center text-center">
                  <Icon name="material-symbols:android-camera" class="w-full" />
                  <div>Add a photo</div>
                  <input
                    id="formFile"
                    ref="fileInputRef"
                    class="hidden"
                    type="file"
                    multiple
                    accept="image/*"
                    @change="onFilePicked"
                  >
                </div>
              </UCard>
            </div>
          </UFormGroup>
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
                v-for="type of types"
                :key="type.value"
                v-model="state.is_digital"
                v-bind="type"
              />
              <!--                v-model="selectedType"-->
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

          <UFormGroup
            v-if="state.category"
            label="Color"
            name="color"
            class="mb-4"
            description="Add up to 3 colors."
            required
          >
            <!--                v-model="state.color"-->
            <USelectMenu
              v-model="state.attributes.color"
              searchable
              class="w-full lg:w-40"
              placeholder="Select a colors"
              :options="productColorsOpts"
              size="lg"
              :ui-menu="{
                option: {
                  base: 'capitalize'
                }
              }"
            />
          </UFormGroup>

          <!-- <ProductCategoryClothingForm
            v-if="state.category === PRODUCT_CATEGORIES.CLOTHING"
            :state="state"
          /> -->
          <ProductCategoryClothingForm
            v-if="state.category.toLowerCase() === PRODUCT_CATEGORIES.CLOTHING"
            @state="updateState"
          />
        </template>
      </CreateProductCard>

      <CreateProductCard>
        <template #title>
          Inventory and pricing
        </template>
        <!--        <template #subtitle>-->
        <!--          Tell the world all about your item and why they’ll love it.-->
        <!--        </template>-->
        <template #content>
          <!--          <div class="max-w-[50%]">-->
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
              <!--              type="number"-->

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

      <div class="flex justify-end">
        <UButton :disabled="loading" size="xl" type="submit" class="mt-6">
          Save
        </UButton>
        <!--      <UButton :disabled="loading" size="xl" type="submit" class="mt-6">-->
        <!--        Save & Display-->
        <!--      </UButton>-->
      </div>
    </UForm>
  </div>
</template>
