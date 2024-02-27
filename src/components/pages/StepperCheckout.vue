<script setup lang="ts">

const props = defineProps({
  step: {
    type: Number,
    default: 0,
  },
  steps: {
    type: Array,
    default: () => ['task A', 'task B', 'task C'],
  },
});

// const emit = defineEmits<{(e: 'onChangeStep', value: number): void }>();

const widthAddition = 17.2;
const steps = props.steps;
const widthPerStep = 100 / steps.length;

const step = computed(() => {
  if (props.step > steps?.length) {
    return steps?.length;
  }
  return props.step;
});

const valueProgress = computed(() => {
  return (widthPerStep + widthAddition) * step.value;
});

// const clickStepDone = (index?: number) => {
//   console.log('index', index);
//   step.value = index;
//   emit('onChangeStep', index)
// };

</script>

<template>
  <div :key="step" class="">
    <UProgress
      :ui="{
        progress: {
          background: '!bg-[#d9dee3]',
        }
      }"
      :value="valueProgress"
      class="relative"
      size="sm"
    >
      <template #indicator="{ percent }">
        <div
          v-for="(title, index) of steps"
          :key="index"
          class="text-right absolute"
          :style="{ width: `${(widthPerStep + widthAddition) * (index)}%` }"
        >
          <div
            class="absolute right-0 -bottom-[14px] z-[2] flex justify-center
            items-center w-3.5 h-3.5 sm:w-6 sm:h-6"
          >
            <div v-if="(percent > (widthPerStep + widthAddition) * (index)) || step === index + 1">
              <Icon
                name="material-symbols:check-circle-rounded"
                class="done"
              />
              <!--                @click="() => clickStepDone(index)"-->
            </div>

            <div
              v-else-if="step + 1 === index + 1"
              class="active"
            >
              {{ index + 1 }}
            </div>

            <div
              v-else
              class="inactive"
            >
              {{ index + 1 }}
            </div>

            <div
              :class="[
                'center-title break-keep whitespace-nowrap font-medium',
                step === index + 1 || step + 1 === index + 1 || step > index + 1
                  ? 'text-primary' : 'text-customGray-900',
                ( step - 1 === index || step > index + 1 ) && 'cursor-pointer',
              ]"
            >
              {{ title }}
            </div>
          </div>
        </div>
      </template>
    </UProgress>
  </div>
</template>

<style scoped>

.center-title {
  position: absolute;
  top: 180%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.base {
  @apply rounded rounded-full w-5 h-5 ring-[3px]
  flex justify-center text-sm font-semibold;
}

.done {
 @apply text-primary bg-white w-6 h-6 cursor-pointer;
}

.active {
  @apply base text-primary bg-white ring-primary;
}

.inactive {
 @apply base text-customGray-900 bg-[#d9dee3] ring-[#d9dee3];
}

</style>
