<script setup lang="ts">

const props = defineProps({
  step: {
    type: Number,
    default: 0,
  },
  steps: {
    type: Array,
    default: () => ['task A', 'task B', 'task C', 'task D'],
  },
});

const widthAddition = 8.5;
const steps = props.steps;
// const steps = ref(props.steps);
const widthPerStep = 100 / steps.length;
const step = ref(props.step);
// const step = ref(1);

// const temp = ref(1);
// const temp = ref(50 + 8.5);
const temp = ref((widthPerStep + widthAddition) * step.value);
// const temp = ref(50);
// const temp = ref(75);
// const temp = ref(100);

// const temp = ref(0);
// const temp = ref(1);
// const temp = ref(4);

// const clickIcon = () => {
//   step.value = 0;
// };

</script>

<template>
  <div :key="step" class="">
    <!--    <UProgress :value="temp" :max="75" class="px-1 relative" size="sm">-->
    <UProgress
      :ui="{
        progress: {
          background: '!bg-[#d9dee3]',
        }
      }"
      :value="temp"
      class="relative"
      size="sm"
    >
      <!--                <UProgress :value="temp" :max="4" class="px-1 relative" size="sm">-->
      <template #indicator="{ percent }">
        <div
          v-for="(title, index) of steps"
          :key="index"
          class="text-right absolute"
          :style="{ width: `${(widthPerStep + widthAddition) * (index)}%` }"
        >
          <div
            class="absolute right-0 -bottom-[14px] z-20 flex justify-center
            items-center w-3.5 h-3.5 sm:w-6 sm:h-6"
          >
            <div v-if="(percent > (widthPerStep + widthAddition) * (index)) || step === index + 1">
              <Icon
                name="material-symbols:check-circle-rounded"
                class="text-primary bg-white rounded rounded-full w-3.5 h-3.5 sm:w-7 sm:h-7"
              />
              <!--                @click="clickIcon"-->
            </div>
            <div
              v-else
              class="text-primary bg-white rounded rounded-full w-3.5 h-3.5 sm:w-5 sm:h-5 ring-2
               ring-primary text-center flex justify-center text-sm font-semibold"
            >
              {{ index + 1 }}
            </div>
            <div class="text-primary center break-keep whitespace-nowrap font-medium">
              {{ title }}
            </div>
          </div>
        </div>
      </template>
    </UProgress>
  </div>
</template>

<style scoped>
.center {
  position: absolute;
  top: 180%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
