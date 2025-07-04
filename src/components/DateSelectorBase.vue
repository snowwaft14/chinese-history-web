<template>
  <div class="date-selector-base w-full">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { CalendarType, type HistoricalDate, HistoricalDateSchema } from "@/connects/common_pb";
import { create } from "@bufbuild/protobuf";

// Props
interface Props {
  value: HistoricalDate;
  calendarType: CalendarType;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "update:value": [value: HistoricalDate];
}>();

// 基础响应式数据
const year = ref<number>();
const month = ref<number>();
const day = ref<number>();
const isLeapMonth = ref(false);

// 计算属性
const isValidDate = computed(() => {
  return year.value !== undefined && year.value > 0;
});

// 方法
const updateValue = () => {
  if (!isValidDate.value) return;

  const newDate = create(HistoricalDateSchema, {
    ...props.value,
    calendarType: props.calendarType,
    year: year.value || 0,
    month: month.value || 0,
    day: day.value || 0,
    isLeapMonth: isLeapMonth.value,
  });

  emit("update:value", newDate);
};

// 初始化数据
const initializeData = () => {
  const value = props.value;
  if (!value) return;

  if (value.calendarType === props.calendarType) {
    year.value = Math.abs(value.year);
    month.value = value.month;
    day.value = value.day;
    isLeapMonth.value = value.isLeapMonth;
  }
};

// 暴露给子组件的方法和数据
defineExpose({
  year,
  month,
  day,
  isLeapMonth,
  updateValue,
  initializeData,
});

// 监听props变化
watch(() => props.value, initializeData, { immediate: true });

// 组件挂载时初始化
onMounted(() => {
  initializeData();
});
</script>

<style scoped>
.date-selector-base {
  /* 基础样式 */
}
</style> 