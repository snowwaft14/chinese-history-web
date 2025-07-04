<template>
  <div class="gregorian-date-selector w-full">
    <div class="flex items-center gap-2 w-full">

      <!-- 公元前选项 -->
      <div class="form-control w-fit">
        <label class="label cursor-pointer p-0 gap-2">
          <input
            type="checkbox"
            v-model="isBC"
            @change="onBCChange"
            class="toggle toggle-sm toggle-primary"
          />
          <span class="label-text text-sm">公元前</span>
        </label>
      </div>

      <!-- 年份输入 -->
      <div class="flex items-center gap-1">
        <input
          type="number"
          :value="year"
          @input="onYearChange"
          @focus="handleInputFocus"
          placeholder="年"
          min="1"
          :max="yearMax"
          class="input input-bordered input-sm text-center w-20"
        />
        <span class="text-sm font-medium text-base-content">年</span>
      </div>

      <!-- 月份输入 -->
      <div class="flex items-center gap-1">
        <input
          type="number"
          :value="month"
          @input="onMonthChange"
          @focus="handleInputFocus"
          placeholder="月"
          min="1"
          max="12"
          class="input input-bordered input-sm text-center w-20"
        />
        <span class="text-sm font-medium text-base-content">月</span>
      </div>

      <!-- 日期输入 -->
      <div class="flex items-center gap-1">
        <input
          type="number"
          :value="day"
          @input="onDayChange"
          @focus="handleInputFocus"
          placeholder="日"
          min="1"
          max="31"
          class="input input-bordered input-sm text-center flex-1 w-20"
        />
        <span class="text-sm font-medium text-base-content">日</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { CalendarType, type HistoricalDate, HistoricalDateSchema } from "@/connects/common_pb";
import { create } from "@bufbuild/protobuf";

// Props
interface Props {
  value: HistoricalDate;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "update:value": [value: HistoricalDate];
}>();

// 响应式数据
const year = ref<number>();
const month = ref<number>();
const day = ref<number>();
const isBC = ref(false);

// 计算属性
const yearMax = computed(() => (isBC.value ? 4000 : 1840));

// 处理input获得焦点时自动全选
const handleInputFocus = (event: FocusEvent) => {
  const input = event.target as HTMLInputElement;
  setTimeout(() => {
    input.select();
  }, 0);
};

// 事件处理
const onYearChange = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  year.value = isNaN(value) ? undefined : value;
  updateValue();
};

const onMonthChange = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  month.value = isNaN(value) ? undefined : value;
  updateValue();
};

const onDayChange = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  day.value = isNaN(value) ? undefined : value;
  updateValue();
};

const onBCChange = () => {
  updateValue();
};

// 更新值
const updateValue = () => {
  if (!year.value) return;

  const actualYear = isBC.value ? -year.value : year.value;

  const newDate = create(HistoricalDateSchema, {
    calendarType: CalendarType.GREGORIAN,
    year: actualYear,
    month: month.value || 0,
    day: day.value || 0,
    isLeapMonth: false,
    dynastyName: "",
    emperorId: "",
    eraName: "",
    eraYear: 0,
  });

  emit("update:value", newDate);
};

// 初始化数据
const initializeData = () => {
  const value = props.value;
  if (!value || value.calendarType !== CalendarType.GREGORIAN) return;

  isBC.value = value.year < 0;
  year.value = Math.abs(value.year);
  month.value = value.month || undefined;
  day.value = value.day || undefined;
};

// 监听props变化
watch(() => props.value, initializeData, { immediate: true });

// 组件挂载时初始化
onMounted(() => {
  initializeData();
});
</script>

<style scoped>
.gregorian-date-selector {
  /* 阳历选择器样式 */
}
</style> 